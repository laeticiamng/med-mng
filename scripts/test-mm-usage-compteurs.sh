#!/usr/bin/env bash
# Test de concurrence RÉEL (Postgres) de la migration 20261014170000_mm_compteur_usage_journalier.sql.
# Prérequis : binaires PostgreSQL (initdb, pg_ctl, psql). Lancé en root, le script crée l'utilisateur
# système « pgtest » (initdb refuse root). Usage : bash scripts/test-mm-usage-compteurs.sh
set -euo pipefail

MIGRATION="$(cd "$(dirname "$0")/.." && pwd)/supabase/migrations/20261014170000_mm_compteur_usage_journalier.sql"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[ -x "$PGBIN/initdb" ] || { echo "PostgreSQL introuvable (PGBIN)"; exit 2; }
DATA="$(mktemp -d)"; PORT=54329; SOCK=/tmp
if [ "$(id -u)" = 0 ]; then
  id pgtest >/dev/null 2>&1 || useradd -m pgtest
  chown pgtest "$DATA"; RUN=(su pgtest -c)
else
  RUN=(bash -c)
fi
"${RUN[@]}" "$PGBIN/initdb -D $DATA -U pgtest -A trust >/dev/null && $PGBIN/pg_ctl -D $DATA -o '-p $PORT -k $SOCK' -l $DATA/log -w start >/dev/null"
trap '"${RUN[@]}" "$PGBIN/pg_ctl -D $DATA -m immediate stop >/dev/null" || true; rm -rf "$DATA"' EXIT

P=(psql -h "$SOCK" -p "$PORT" -U pgtest -d postgres -tA -q -v ON_ERROR_STOP=1)
ECHECS=0
verifie() { # description attendu obtenu
  if [ "$2" = "$3" ]; then echo "  OK   $1 ($3)"; else echo "  ECHEC $1 : attendu $2, obtenu $3"; ECHECS=$((ECHECS+1)); fi
}
appel() { "${P[@]}" -c "select autorise::text||','||utilise from mm_reserver_usage_journalier('$1', $2)"; }

"${P[@]}" <<'SQL'
create role service_role; create role anon; create role authenticated;
create table public.rate_limit_counters (id uuid default gen_random_uuid() primary key, identifier text not null,
  window_start timestamptz not null, window_end timestamptz not null, request_count int not null default 1,
  max_requests int not null, created_at timestamptz default now(), updated_at timestamptz default now());
insert into public.rate_limit_counters (identifier, window_start, window_end, request_count, max_requests)
  select 'mm-bienvenue:u-dup', date_trunc('day', now() at time zone 'UTC') at time zone 'UTC', now() + interval '1 day', 1, 2
  from generate_series(1, 3);
insert into public.rate_limit_counters (identifier, window_start, window_end, request_count, max_requests) values
  ('ec-coach:autre-app', date_trunc('day', now() at time zone 'UTC') at time zone 'UTC', now() + interval '1 day', 2, 5);
SQL

echo "# Migration et reprise des données"
"${P[@]}" -f "$MIGRATION" >/dev/null || { echo "ECHEC : la migration ne s'applique pas"; exit 1; }
"${P[@]}" -f "$MIGRATION" >/dev/null 2>&1 || { echo "ECHEC : la migration n'est pas rejouable"; exit 1; }   # rejeu : idempotent
verifie "doublons additionnés (3 lignes de 1)" 3 "$("${P[@]}" -c "select nombre from mm_usage_compteurs where identifiant='mm-bienvenue:u-dup'")"
verifie "rejeu sans double comptage" 1 "$("${P[@]}" -c "select count(*) from mm_usage_compteurs where identifiant='mm-bienvenue:u-dup'")"
verifie "autre application non reprise" 0 "$("${P[@]}" -c "select count(*) from mm_usage_compteurs where identifiant like 'ec-coach%'")"
verifie "rate_limit_counters intacte" 4 "$("${P[@]}" -c "select count(*) from rate_limit_counters")"
verifie "doublon existant au-dessus de la limite : refus" "false,3" "$(appel 'mm-bienvenue:u-dup' 2)"
verifie "refus sans écriture supplémentaire" 3 "$("${P[@]}" -c "select nombre from mm_usage_compteurs where identifiant='mm-bienvenue:u-dup'")"

echo "# Concurrence : 6 appels simultanés, limite 2 (3 répétitions)"
for run in a b c; do
  T="$(mktemp -d)"
  for i in 1 2 3 4 5 6; do appel "mm-bienvenue:conc-$run" 2 > "$T/$i" & done; wait
  verifie "[$run] exactement 2 autorisés" 2 "$(cat "$T"/* | grep -c '^true,')"
  verifie "[$run] 4 refusés" 4 "$(cat "$T"/* | grep -c '^false,')"
  verifie "[$run] une seule ligne, valeur 2" "1|2" "$("${P[@]}" -c "select count(*)||'|'||max(nombre) from mm_usage_compteurs where identifiant='mm-bienvenue:conc-$run'")"
  verifie "[$run] une ligne de résultat par appel" 6 "$(cat "$T"/* | wc -l)"
done
echo "# Concurrence : 60 appels simultanés, limite 5"
T="$(mktemp -d)"; for i in $(seq 1 60); do appel 'whisper-transcribe:conc-60' 5 > "$T/$i" & done; wait
verifie "exactement 5 autorisés" 5 "$(cat "$T"/* | grep -c '^true,')"
verifie "compteur = 5, jamais plus" 5 "$("${P[@]}" -c "select nombre from mm_usage_compteurs where identifiant='whisper-transcribe:conc-60'")"
echo "# Utilisateurs distincts : 6 utilisateurs x 3 appels simultanés, limite 2"
T="$(mktemp -d)"; for u in 1 2 3 4 5 6; do for i in 1 2 3; do appel "mm-bienvenue:usr-$u" 2 > "$T/${u}_$i" & done; done; wait
verifie "12 autorisés (2 par utilisateur)" 12 "$(cat "$T"/* | grep -c '^true,')"
verifie "6 refusés" 6 "$(cat "$T"/* | grep -c '^false,')"
echo "# Fenêtres temporelles (jour UTC, horloge de la base)"
JOUR="date_trunc('day', now() at time zone 'UTC') at time zone 'UTC'"
"${P[@]}" -c "insert into mm_usage_compteurs values ('mm-bienvenue:fen', $JOUR - interval '1 day', 1)"
verifie "veille pleine : compteur du jour indépendant" "true,1" "$(appel 'mm-bienvenue:fen' 1)"
verifie "veille intacte" 1 "$("${P[@]}" -c "select nombre from mm_usage_compteurs where identifiant='mm-bienvenue:fen' and fenetre_debut = $JOUR - interval '1 day'")"
verifie "aujourd'hui : limite atteinte" "false,1" "$(appel 'mm-bienvenue:fen' 1)"
verifie "fenêtre du jour = jour UTC courant" 1 "$("${P[@]}" -c "select count(*) from mm_usage_compteurs where identifiant='mm-bienvenue:fen' and fenetre_debut = $JOUR")"
verifie "l'appelant ne peut pas choisir la date" "ERREUR" "$("${P[@]}" -c "select * from mm_reserver_usage_journalier('x',2, now())" >/dev/null 2>&1 && echo ACCEPTE || echo ERREUR)"
verifie "limite invalide refusée" "ERREUR" "$(appel 'x' 0 >/dev/null 2>&1 && echo ACCEPTE || echo ERREUR)"
echo "# Droits"
verifie "anon / authenticated / service_role (exécution)" "f|f|t" "$("${P[@]}" -c "select has_function_privilege('anon','mm_reserver_usage_journalier(text,integer)','execute')::text||'|'||has_function_privilege('authenticated','mm_reserver_usage_journalier(text,integer)','execute')::text||'|'||has_function_privilege('service_role','mm_reserver_usage_journalier(text,integer)','execute')::text" | sed 's/true/t/g;s/false/f/g')"
verifie "table fermée à authenticated" f "$("${P[@]}" -c "select has_table_privilege('authenticated','mm_usage_compteurs','select')::text" | sed 's/true/t/;s/false/f/')"

[ "$ECHECS" = 0 ] && echo "TOUS LES CONTRÔLES PASSENT" || { echo "$ECHECS ÉCHEC(S)"; exit 1; }
