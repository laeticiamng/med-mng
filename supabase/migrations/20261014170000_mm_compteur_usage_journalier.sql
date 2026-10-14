-- Compteur atomique des limites d'usage journalières MED MNG (send-welcome-email, whisper-transcribe).
--
-- POURQUOI : le limiteur commun (_shared/mm-limite-usage.ts) lisait puis écrivait dans
-- public.rate_limit_counters, SANS contrainte d'unicité. Des appels simultanés passaient tous la
-- lecture « aucune ligne » avant la première écriture et insérait chacun sa propre ligne (au lieu d'un incrément) : mesuré en
-- production le 14.10.2026, 6 appels simultanés pour une limite de 2 → 5 acceptés, 4 lignes créées
-- (et, ensuite, seule la plus ancienne ligne était relue : les doublons n'étaient jamais additionnés).
--
-- CONCEPTION : table DÉDIÉE, clé primaire (identifiant, fenetre_debut), et réservation en UNE
-- instruction INSERT ... ON CONFLICT DO UPDATE ... WHERE nombre < max (même schéma que
-- mm_reserver_reinit_mdp). Le verrou de ligne sérialise les concurrents : exactement `max`
-- réservations réussissent par clé et par fenêtre, jamais une de plus.
-- rate_limit_counters n'est PAS modifiée : elle sert aussi à d'autres applications (EmotionsCare :
-- ec-coach, ec-rapport, fonction SQL increment_rate_limit_counter), qui ne sont pas dans le périmètre.
--
-- DONNÉES EXISTANTES : les lignes de rate_limit_counters des clés Med MNG (mm-bienvenue:*,
-- whisper-transcribe:*) sont reprises en SOMMANT les doublons par (identifiant, fenêtre) : aucune
-- comptabilisation perdue. La reprise est idempotente (GREATEST) : on peut la rejouer sans double
-- comptage, y compris juste après le déploiement du code pour rattraper les appels de la période
-- de transition.
--
-- La table n'est lisible ni modifiable que par le service (RLS activée, sans politique ; aucun droit
-- pour anon / authenticated) et la fonction n'est exécutable que par service_role.

create table if not exists public.mm_usage_compteurs (
  identifiant   text        not null,
  fenetre_debut timestamptz not null,
  nombre        integer     not null check (nombre >= 0),
  primary key (identifiant, fenetre_debut)
);

-- Sert au nettoyage borné des anciennes fenêtres.
create index if not exists mm_usage_compteurs_fenetre_idx
  on public.mm_usage_compteurs (fenetre_debut);

alter table public.mm_usage_compteurs enable row level security;
-- Aucune politique : seul le service (qui contourne la RLS) et la fonction SECURITY DEFINER y accèdent.

revoke all on table public.mm_usage_compteurs from public, anon, authenticated;
grant select, insert, update, delete on table public.mm_usage_compteurs to service_role;

-- Reprise des compteurs existants (doublons additionnés, rejouable).
insert into public.mm_usage_compteurs (identifiant, fenetre_debut, nombre)
select identifier, window_start, sum(request_count)::integer
from public.rate_limit_counters
where identifier like 'mm-bienvenue:%' or identifier like 'whisper-transcribe:%'
group by identifier, window_start
on conflict (identifiant, fenetre_debut) do update
  set nombre = greatest(public.mm_usage_compteurs.nombre, excluded.nombre);

-- Réserve une utilisation pour p_identifiant dans le jour UTC de p_maintenant.
-- Rend (autorise, utilise) : autorise = faux quand la limite p_max est atteinte (aucune réservation
-- supplémentaire n'est écrite) ; utilise = nombre d'utilisations du jour, celle-ci comprise si autorisée.
create or replace function public.mm_reserver_usage_journalier(
  p_identifiant text,
  p_max         integer,
  p_maintenant  timestamptz default now()
)
returns table (autorise boolean, utilise integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_debut  timestamptz;
  v_nombre integer;
begin
  if p_identifiant is null or length(p_identifiant) = 0 or length(p_identifiant) > 200 then
    raise exception 'identifiant invalide' using errcode = '22023';
  end if;
  if p_max is null or p_max < 1 then
    raise exception 'limite invalide' using errcode = '22023';
  end if;
  -- L'horloge de l'appelant ne peut pas ouvrir une fenêtre éloignée de plus d'un jour : pas de
  -- contournement par une date arbitraire, pas de fenêtre fantôme.
  if p_maintenant is null or abs(extract(epoch from (p_maintenant - now()))) > 86400 then
    raise exception 'date invalide' using errcode = '22023';
  end if;

  v_debut := date_trunc('day', p_maintenant at time zone 'UTC') at time zone 'UTC';

  -- Nettoyage opportuniste : une fois sur cent, au plus 100 lignes de plus de 8 jours (borné, index
  -- sur fenetre_debut). Ne touche jamais la fenêtre courante.
  if random() < 0.01 then
    delete from public.mm_usage_compteurs
    where ctid in (
      select ctid from public.mm_usage_compteurs
      where fenetre_debut < now() - interval '8 days'
      limit 100
    );
  end if;

  -- Atomique : la première utilisation insère 1 ; les suivantes incrémentent seulement tant que
  -- nombre < p_max. À la limite, la clause WHERE écarte la mise à jour : aucune ligne retournée.
  insert into public.mm_usage_compteurs as c (identifiant, fenetre_debut, nombre)
  values (p_identifiant, v_debut, 1)
  on conflict (identifiant, fenetre_debut) do update
    set nombre = c.nombre + 1
    where c.nombre < p_max
  returning c.nombre into v_nombre;

  if v_nombre is not null then
    return query select true, v_nombre;
    return;
  end if;

  select c.nombre into v_nombre
  from public.mm_usage_compteurs c
  where c.identifiant = p_identifiant and c.fenetre_debut = v_debut;
  return query select false, coalesce(v_nombre, p_max);
end;
$$;

revoke all on function public.mm_reserver_usage_journalier(text, integer, timestamptz) from public, anon, authenticated;
grant execute on function public.mm_reserver_usage_journalier(text, integer, timestamptz) to service_role;
