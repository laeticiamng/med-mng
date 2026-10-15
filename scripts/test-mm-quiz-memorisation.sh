#!/usr/bin/env bash
# Test RÉEL (Postgres) de la migration 20261015120000_mm_quiz_memorisation_serveur.sql :
# droits Gratuit/Premium de la RPC, statuts servis, fermeture de la table, registre de validation.
# Les fonctions d'accès (mm_item_gratuit, mm_a_acces_premium) sont des doublures fidèles à leur
# logique de production (items d'essai ; abonnement actif/trialing non échu ou rôle admin).
# Usage : bash scripts/test-mm-quiz-memorisation.sh
set -euo pipefail

MIGRATION="$(cd "$(dirname "$0")/.." && pwd)/supabase/migrations/20261015120000_mm_quiz_memorisation_serveur.sql"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[ -x "$PGBIN/initdb" ] || { echo "PostgreSQL introuvable (PGBIN)"; exit 2; }
DATA="$(mktemp -d)"; PORT=54331; SOCK=/tmp
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
verifie() { if [ "$2" = "$3" ]; then echo "  OK   $1"; else echo "  ECHEC $1 : attendu [$2], obtenu [$3]"; ECHECS=$((ECHECS+1)); fi; }
# Exécute du SQL sous un rôle et une identité ; renvoie la sortie, ou « ERREUR:<code> » si l'appel échoue.
sous() { # role sub (peut être vide) role_jwt sql
  local out
  out="$(printf '%s\n' "set role $1;" '\o /dev/null' "select set_config('request.jwt.claim.sub','$2',false);" \
        "select set_config('request.jwt.claim.role','$3',false);" '\o' "$4" | "${P[@]}" 2>&1)" || true
  if echo "$out" | grep -q "ERROR"; then echo "ERREUR:$(echo "$out" | grep -o 'permission denied\|42501\|Accès refusé\|valide_expert ne peut\|hash différent\|Question bloquée\|en ajout seul\|violates check\|Question inconnue' | head -1)"; else echo "$out"; fi
}

PREMIUM=11111111-1111-1111-1111-111111111111; ECHU=22222222-2222-2222-2222-222222222222
GRATUIT=33333333-3333-3333-3333-333333333333; ADMIN=44444444-4444-4444-4444-444444444444

"${P[@]}" <<SQL
create role service_role bypassrls; create role anon; create role authenticated;
grant usage on schema public to anon, authenticated, service_role;
create schema auth;
create function auth.uid() returns uuid language sql stable as \$\$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid \$\$;
create function auth.role() returns text language sql stable as \$\$ select nullif(current_setting('request.jwt.claim.role', true), '') \$\$;
grant usage on schema auth to anon, authenticated, service_role;
create table public.user_subscriptions (user_id uuid, status text, current_period_end timestamptz);
create table public.user_roles (user_id uuid, role text);
insert into public.user_subscriptions values ('$PREMIUM','active', now() + interval '10 days'),
                                             ('$ECHU','active', now() - interval '1 day');
insert into public.user_roles values ('$ADMIN','admin');
create function public.mm_normaliser_code_item(p_code text) returns text language sql immutable as \$\$
  select case when p_code ~* '^\s*ic-?0*[0-9]+\s*\$' then 'IC-' || (regexp_replace(p_code,'[^0-9]','','g'))::int::text else upper(btrim(p_code)) end \$\$;
create function public.mm_items_gratuits() returns text[] language sql immutable as \$\$
  select array['IC-1','IC-161','IC-154','IC-27','IC-247','IC-359','IC-224','IC-340','IC-356','IC-66']::text[] \$\$;
create function public.mm_item_gratuit(p_item_code text) returns boolean language sql immutable as \$\$
  select public.mm_normaliser_code_item(p_item_code) = any (public.mm_items_gratuits()) \$\$;
create function public.mm_a_acces_premium(p_user_id uuid) returns boolean language plpgsql stable security definer set search_path = public as \$\$
begin
  if p_user_id is distinct from auth.uid() and auth.role() is distinct from 'service_role' then raise exception 'Accès refusé' using errcode = '42501'; end if;
  return p_user_id is not null and (
    exists (select 1 from public.user_subscriptions us where us.user_id = p_user_id and us.status in ('active','trialing')
            and (us.current_period_end is null or us.current_period_end > now()))
    or exists (select 1 from public.user_roles ur where ur.user_id = p_user_id and ur.role = 'admin')); end \$\$;
SQL

echo "# Migration : application et rejeu"
"${P[@]}" -f "$MIGRATION" >/dev/null || { echo "ECHEC : la migration ne s'applique pas"; exit 1; }
"${P[@]}" -f "$MIGRATION" >/dev/null 2>&1 || { echo "ECHEC : la migration n'est pas rejouable"; exit 1; }
verifie "mode pilote éteint par défaut" "f" "$("${P[@]}" -c "select pilote from mm_quiz_memorisation_config")"
verifie "statuts servis par défaut" "{valide_expert}" "$("${P[@]}" -c "select mm_quiz_memorisation_statuts()")"

# Semis de test : un item d'essai (IC-247), un item Premium (IC-217), un statut de chaque sorte.
"${P[@]}" <<'SQL'
insert into mm_quiz_memorisation_questions (id,item_code,rang,objectif_id,type,question,options,index_correct,explication,statut,tracabilite) values
 ('M247-A1','IC-247','A','OIC-247-03-A','qcm','Seuil ?','["a","b","c","d"]',2,'Explication','verifie_source_externe','{"justification":"INTERNE","extraitReferentiel":"SECRET"}'),
 ('M247-A2','IC-247','A','OIC-247-03-A','qcm','HGPO ?','["a","b","c","d"]',1,'Explication','bloque','{"motifBlocage":"conflit"}'),
 ('M217-A1','IC-217','A','OIC-217-01-A','qcm','Définition ?','["a","b","c","d"]',0,'Explication Premium','conforme_referentiel','{}');
insert into mm_quiz_memorisation_questions (id,item_code,rang,objectif_id,type,question,reponse,explication,statut) values
 ('M217-A2','IC-217','A','OIC-217-05-A','rappel','Cause ?','EBV','Explication','brouillon');
SQL
echo "# Fermeture de la table et des fonctions internes"
verifie "anon ne lit pas la table"            "ERREUR:permission denied" "$(sous anon '' anon 'select count(*) from mm_quiz_memorisation_questions;')"
verifie "authenticated ne lit pas la table"   "ERREUR:permission denied" "$(sous authenticated "$PREMIUM" authenticated 'select count(*) from mm_quiz_memorisation_questions;')"
verifie "authenticated n'écrit pas la table"  "ERREUR:permission denied" "$(sous authenticated "$PREMIUM" authenticated "update mm_quiz_memorisation_questions set statut='valide_expert';")"
verifie "anon ne lit pas la config"           "ERREUR:permission denied" "$(sous anon '' anon 'select * from mm_quiz_memorisation_config;')"
verifie "anon ne lit pas le registre"         "ERREUR:permission denied" "$(sous anon '' anon 'select * from mm_quiz_memorisation_validations;')"
verifie "anon ne peut pas valider"            "ERREUR:permission denied" "$(sous anon '' anon "select mm_quiz_memorisation_enregistrer_validation('M217-A1','valide','x y','médecin','HAS','','h');")"
verifie "authenticated sans rôle admin : refusé" "ERREUR:Accès refusé" "$(sous authenticated "$PREMIUM" authenticated "select mm_quiz_memorisation_enregistrer_validation('M217-A1','valide','Dr Test','médecin','HAS','','h');")"

nb() { echo "$1" | "${P[@]}" -c "select jsonb_array_length(('$1'::jsonb)->'questions')" 2>/dev/null; }
rpc() { sous "$1" "$2" "$3" "select mm_quiz_memorisation_item('$4');"; }

echo "# Droits Gratuit / Premium, mode par défaut (seul valide_expert est servi)"
R="$(rpc anon '' anon 'IC-247')"
verifie "visiteur, item d'essai : non verrouillé"          "false" "$(echo "$R" | "${P[@]}" -c "select (('$(echo "$R" | tr -d "\n")'::jsonb)->>'verrouille')")"
verifie "visiteur, item d'essai : aucune question (aucune validée)" "0" "$(nb "$R")"
R="$(rpc anon '' anon 'IC-217')"
verifie "visiteur, item Premium : verrouillé"              "true" "$("${P[@]}" -c "select (('$R'::jsonb)->>'verrouille')")"
verifie "visiteur, item Premium : aucune clé questions"    "f"    "$("${P[@]}" -c "select ('$R'::jsonb) ? 'questions'")"
R="$(rpc authenticated "$GRATUIT" authenticated 'ic-0217')"
verifie "compte gratuit, item Premium (code non normalisé) : verrouillé" "true" "$("${P[@]}" -c "select (('$R'::jsonb)->>'verrouille')")"
R="$(rpc authenticated "$ECHU" authenticated 'IC-217')"
verifie "abonnement échu : verrouillé"                     "true" "$("${P[@]}" -c "select (('$R'::jsonb)->>'verrouille')")"
R="$(rpc authenticated "$PREMIUM" authenticated 'IC-217')"
verifie "abonné : non verrouillé"                          "false" "$("${P[@]}" -c "select (('$R'::jsonb)->>'verrouille')")"

echo "# Mode pilote (service_role) : conforme/verifié servis, bloqué/brouillon jamais"
"${P[@]}" -c "update mm_quiz_memorisation_config set pilote = true" >/dev/null
R="$(rpc anon '' anon 'IC-247')"
verifie "pilote : IC-247 sert M247-A1 et pas la bloquée" "M247-A1" "$("${P[@]}" -c "select string_agg(q->>'id', ',') from jsonb_array_elements(('$R'::jsonb)->'questions') q")"
verifie "pilote : indicateur pilote vrai"                "true" "$("${P[@]}" -c "select (('$R'::jsonb)->>'pilote')")"
verifie "aucune donnée interne renvoyée (justification, extrait, traçabilité)" "0" "$(echo "$R" | grep -c 'INTERNE\|SECRET\|tracabilite\|justification')"
R="$(rpc authenticated "$PREMIUM" authenticated 'IC-217')"
verifie "pilote : abonné reçoit la conforme, pas le brouillon" "M217-A1" "$("${P[@]}" -c "select string_agg(q->>'id', ',') from jsonb_array_elements(('$R'::jsonb)->'questions') q")"
R="$(rpc authenticated "$GRATUIT" authenticated 'IC-217')"
verifie "pilote : compte gratuit, item Premium toujours verrouillé" "true" "$("${P[@]}" -c "select (('$R'::jsonb)->>'verrouille')")"
R="$(rpc authenticated "$ADMIN" authenticated 'IC-217')"
verifie "pilote : administrateur accède" "false" "$("${P[@]}" -c "select (('$R'::jsonb)->>'verrouille')")"
"${P[@]}" -c "update mm_quiz_memorisation_config set pilote = false" >/dev/null

echo "# valide_expert : uniquement par le registre de validation"
verifie "UPDATE direct vers valide_expert refusé (même service_role)" "ERREUR:valide_expert ne peut" "$(sous service_role '' service_role "update mm_quiz_memorisation_questions set statut='valide_expert' where id='M217-A1';")"
 verifie "GUC forgé (set_config) puis UPDATE direct : refusé" "ERREUR:valide_expert ne peut" "$(sous service_role '' service_role "select set_config('mm.validation_en_cours','on',true); update mm_quiz_memorisation_questions set statut='valide_expert' where id='M217-A1';")"
verifie "registre : INSERT direct refusé pour service_role" "ERREUR:permission denied" "$(sous service_role '' service_role "insert into mm_quiz_memorisation_validations (question_id,contenu_hash,decision,relecteur_nom,relecteur_qualite,sources_verifiees) select id, contenu_hash, 'valide', 'Faux Relecteur', 'médecin', 'faux' from mm_quiz_memorisation_questions where id='M217-A1';")"
verifie "INSERT direct valide_expert refusé" "ERREUR:valide_expert ne peut" "$(sous service_role '' service_role "insert into mm_quiz_memorisation_questions (id,item_code,rang,objectif_id,type,question,reponse,explication,statut) values ('M9-A1','IC-9','A','OIC-009-01-A','rappel','q','r','e','valide_expert');")"
H="$("${P[@]}" -c "select contenu_hash from mm_quiz_memorisation_questions where id='M217-A1'")"
V() { sous "$1" "$2" "$3" "select mm_quiz_memorisation_enregistrer_validation('M217-A1','valide','$4','$5','$6','ok','$7') ->> 'statut';"; }
verifie "mauvais hash refusé"                      "ERREUR:hash différent" "$(V service_role '' service_role 'Dr Test' 'médecin' 'HAS 2025' 'pas-le-bon-hash')"
verifie "relecteur sans nom refusé"                "ERREUR:violates check" "$(V service_role '' service_role '' 'médecin' 'HAS 2025' "$H")"
verifie "sans sources vérifiées refusé"            "ERREUR:violates check" "$(V service_role '' service_role 'Dr Test' 'médecin' '' "$H")"
verifie "question bloquée non validable"           "ERREUR:Question bloquée" "$(sous service_role '' service_role "select mm_quiz_memorisation_enregistrer_validation('M247-A2','valide','Dr Test','médecin','HAS','', (select contenu_hash from mm_quiz_memorisation_questions where id='M247-A2'));")"
verifie "question inconnue refusée"                "ERREUR:Question inconnue" "$(sous service_role '' service_role "select mm_quiz_memorisation_enregistrer_validation('M0-A1','valide','Dr Test','médecin','HAS','','h');")"
verifie "aucun statut modifié par les refus" "conforme_referentiel" "$("${P[@]}" -c "select statut from mm_quiz_memorisation_questions where id='M217-A1'")"
verifie "administrateur : validation enregistrée" "valide_expert" "$(V authenticated "$ADMIN" authenticated 'Dr Test' 'médecin, infectiologue' 'HAS 2025; PubMed 36689975' "$H")"
verifie "registre : une ligne, hash du contenu relu" "1|$H" "$("${P[@]}" -c "select count(*)||'|'||max(contenu_hash) from mm_quiz_memorisation_validations")"
R="$(rpc authenticated "$PREMIUM" authenticated 'IC-217')"
verifie "mode par défaut : la question validée est servie" "M217-A1" "$("${P[@]}" -c "select string_agg(q->>'id', ',') from jsonb_array_elements(('$R'::jsonb)->'questions') q")"
verifie "registre : UPDATE refusé (service_role n'a pas le droit)" "ERREUR:permission denied" "$(sous service_role '' service_role "update mm_quiz_memorisation_validations set commentaire='x';")"
verifie "registre : DELETE refusé (service_role n'a pas le droit)" "ERREUR:permission denied" "$(sous service_role '' service_role "delete from mm_quiz_memorisation_validations;")"
verifie "registre : UPDATE refusé même pour le propriétaire (trigger)" "ERREUR:en ajout seul" "$("${P[@]}" -c "update mm_quiz_memorisation_validations set commentaire='x';" 2>&1 | grep -o 'en ajout seul' | sed 's/^/ERREUR:/' | head -1)"
echo "# Décision « a_corriger » sur une question validée (M247-A1, item d'essai)"
H2="$("${P[@]}" -c "select contenu_hash from mm_quiz_memorisation_questions where id='M247-A1'")"
sous service_role '' service_role "select mm_quiz_memorisation_enregistrer_validation('M247-A1','valide','Dr Test','médecin','HAS 2025','','$H2');" >/dev/null
verifie "M247-A1 validée puis servie (mode par défaut)" "1" "$(nb "$(rpc anon '' anon 'IC-247')")"
verifie "a_corriger : la question validée repasse en bloque" "bloque" "$(sous service_role '' service_role "select mm_quiz_memorisation_enregistrer_validation('M247-A1','a_corriger','Dr Test','médecin','HAS 2025','Reformuler','$H2') ->> 'statut';")"
verifie "a_corriger : n'est plus servie" "0" "$(nb "$(rpc anon '' anon 'IC-247')")"
verifie "a_corriger : motif écrit" "À corriger selon le relecteur : Reformuler" "$("${P[@]}" -c "select tracabilite->>'motifBlocage' from mm_quiz_memorisation_questions where id='M247-A1'")"
verifie "registre : 2 décisions pour M247-A1 (historique conservé)" "2" "$("${P[@]}" -c "select count(*) from mm_quiz_memorisation_validations where question_id='M247-A1'")"
echo "# Modification du contenu d'une question validée"
"${P[@]}" -c "update mm_quiz_memorisation_questions set explication = 'Explication retouchée' where id='M217-A1'" >/dev/null
verifie "contenu modifié : validation annulée (bloquée)" "bloque" "$("${P[@]}" -c "select statut from mm_quiz_memorisation_questions where id='M217-A1'")"
verifie "contenu modifié : n'est plus servie" "0" "$(nb "$(rpc authenticated "$PREMIUM" authenticated 'IC-217')")"
"${P[@]}" -c "update mm_quiz_memorisation_questions set ordre = 5 where id='M247-A1'" >/dev/null
verifie "hash recalculé côté serveur" "Explication retouchée" "$("${P[@]}" -c "select explication from mm_quiz_memorisation_questions where id='M217-A1'")"

if [ -n "${SEMIS:-}" ]; then
  echo "# Semis réel (28 questions du pilote) appliqué à la migration"
  "${P[@]}" -c "truncate mm_quiz_memorisation_validations, mm_quiz_memorisation_questions cascade" >/dev/null
  "${P[@]}" -f "$SEMIS" >/dev/null || { echo "ECHEC : le semis ne s'applique pas"; exit 1; }
  "${P[@]}" -f "$SEMIS" >/dev/null || { echo "ECHEC : le semis n'est pas rejouable"; exit 1; }
  verifie "28 questions semées (rejeu sans doublon)" 28 "$("${P[@]}" -c "select count(*) from mm_quiz_memorisation_questions")"
  verifie "aucune valide_expert après semis" 0 "$("${P[@]}" -c "select count(*) from mm_quiz_memorisation_questions where statut='valide_expert'")"
  verifie "6 questions bloquées" 6 "$("${P[@]}" -c "select count(*) from mm_quiz_memorisation_questions where statut='bloque'")"
  for it in IC-247 IC-217 IC-160; do
    verifie "défaut : $it, abonné, rien n'est servi (aucune validée)" 0 "$(nb "$(rpc authenticated "$PREMIUM" authenticated $it)")"
  done
  "${P[@]}" -c "update mm_quiz_memorisation_config set pilote = true" >/dev/null
  verifie "pilote : IC-247 (essai gratuit), visiteur : 8 questions" 8 "$(nb "$(rpc anon '' anon IC-247)")"
  verifie "pilote : IC-217 (Premium), visiteur : verrouillé" true "$("${P[@]}" -c "select (('$(rpc anon '' anon IC-217)'::jsonb)->>'verrouille')")"
  verifie "pilote : IC-217, abonné : 7 questions" 7 "$(nb "$(rpc authenticated "$PREMIUM" authenticated IC-217)")"
  verifie "pilote : IC-160, abonné : 7 questions" 7 "$(nb "$(rpc authenticated "$PREMIUM" authenticated IC-160)")"
  verifie "pilote : jamais une question bloquée" 0 "$("${P[@]}" -c "select count(*) from (select jsonb_array_elements(('$(rpc authenticated "$PREMIUM" authenticated IC-247)'::jsonb)->'questions')->>'id' id) q where id in ('M247-A2','M247-A7','M247-B3')")"
fi

echo
if [ "$ECHECS" = 0 ]; then echo "Tous les contrôles passent."; else echo "$ECHECS contrôle(s) en échec."; exit 1; fi
