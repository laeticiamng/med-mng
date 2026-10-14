-- Compteur atomique des demandes de réinitialisation du mot de passe MED MNG (fonction Edge mm-password-reset).
--
-- POURQUOI UNE TABLE DÉDIÉE : le limiteur commun (_shared/mm-limite-usage.ts, table rate_limit_counters,
-- partagée avec d'autres fonctions) lit puis écrit sans contrainte d'unicité : une rafale de demandes
-- simultanées passe les deux lectures avant la première écriture et dépasse la limite. Ici, une seule
-- instruction INSERT ... ON CONFLICT DO UPDATE ... WHERE nombre < max réserve ou refuse de façon atomique
-- (le verrou de ligne sérialise les concurrents). rate_limit_counters n'est pas modifiée.
--
-- Clés (hachages SHA-256 posés par la fonction, jamais d'adresse ni d'IP en clair) :
--   mm-mdp-email:<sha256>  3 demandes par heure ;  mm-mdp-ip:<sha256>  10 demandes par heure.
-- La table n'est lisible ni modifiable que par le service (RLS activée, sans politique ; aucun droit
-- pour anon / authenticated) et la fonction n'est exécutable que par service_role.

create table if not exists public.mm_reinit_mdp_compteurs (
  cle           text        not null,
  fenetre_debut timestamptz not null,
  nombre        integer     not null check (nombre >= 0),
  primary key (cle, fenetre_debut)
);

-- Sert au nettoyage borné des anciennes fenêtres.
create index if not exists mm_reinit_mdp_compteurs_fenetre_idx
  on public.mm_reinit_mdp_compteurs (fenetre_debut);

alter table public.mm_reinit_mdp_compteurs enable row level security;
-- Aucune politique : seul le service (qui contourne la RLS) et la fonction SECURITY DEFINER y accèdent.

revoke all on table public.mm_reinit_mdp_compteurs from public, anon, authenticated;
grant select, insert, update, delete on table public.mm_reinit_mdp_compteurs to service_role;

-- Réserve une demande pour p_cle dans la fenêtre courante (alignée sur l'époque : p_fenetre = '1 hour'
-- donne les heures UTC pleines). Vrai si la demande est comptée, faux si la limite p_max est atteinte.
create or replace function public.mm_reserver_reinit_mdp(p_cle text, p_max integer, p_fenetre interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secondes numeric := extract(epoch from p_fenetre);
  v_debut    timestamptz;
  v_nombre   integer;
begin
  if p_cle is null or length(p_cle) = 0 or length(p_cle) > 200 then
    raise exception 'clé invalide' using errcode = '22023';
  end if;
  if p_max is null or p_max < 1 then
    raise exception 'limite invalide' using errcode = '22023';
  end if;
  if v_secondes is null or v_secondes < 1 then
    raise exception 'fenêtre invalide' using errcode = '22023';
  end if;

  v_debut := to_timestamp(floor(extract(epoch from now()) / v_secondes) * v_secondes);

  -- Nettoyage opportuniste : une fois sur cent, au plus 100 lignes de plus d'un jour (borné, index
  -- sur fenetre_debut). Évite une tâche planifiée pour une table qui ne grossit que de quelques
  -- lignes par demande ; le nettoyage ne touche jamais la fenêtre courante.
  if random() < 0.01 then
    delete from public.mm_reinit_mdp_compteurs
    where ctid in (
      select ctid from public.mm_reinit_mdp_compteurs
      where fenetre_debut < now() - interval '1 day'
      limit 100
    );
  end if;

  -- Atomique : la première demande insère 1 ; les suivantes incrémentent seulement tant que
  -- nombre < p_max. À la limite, la clause WHERE écarte la mise à jour : aucune ligne retournée.
  insert into public.mm_reinit_mdp_compteurs as c (cle, fenetre_debut, nombre)
  values (p_cle, v_debut, 1)
  on conflict (cle, fenetre_debut) do update
    set nombre = c.nombre + 1
    where c.nombre < p_max
  returning c.nombre into v_nombre;

  return v_nombre is not null;
end;
$$;

revoke all on function public.mm_reserver_reinit_mdp(text, integer, interval) from public, anon, authenticated;
grant execute on function public.mm_reserver_reinit_mdp(text, integer, interval) to service_role;
