-- ============================================================================
-- Surveillance du solde Suno : pannes de surveillance et seuils réglables (27.10.2026)
-- ============================================================================
-- CONSTAT : la première version (20261027120000_mm_suno_solde.sql) n'enregistrait rien quand le solde était
-- illisible (clé absente, fournisseur injoignable) : une panne de la surveillance restait silencieuse. Les seuils
-- ne se réglaient que par des secrets de fonction.
--
-- EFFET (idempotent) :
--   1. mm_suno_solde_releves accepte l'état « indisponible » (solde illisible, credits NULL) ; une contrainte
--      garantit que credits n'est vide que pour cet état. Index sur releve_at pour les lectures de la fonction.
--   2. public.mm_suno_solde_config : une seule ligne (id = 1) ; seuil_bas et seuil_critique en crédits. NULL = seuils
--      des secrets de fonction, sinon 120 / 36. Pour régler :
--        update public.mm_suno_solde_config set seuil_bas = 200, seuil_critique = 60, maj_at = now() where id = 1;
--      Une paire incohérente (critique >= bas) est ignorée par la fonction. RLS sans politique : service_role seulement.
--
-- RETOUR ARRIÈRE :
--   drop table public.mm_suno_solde_config;
--   delete from public.mm_suno_solde_releves where etat = 'indisponible';
--   alter table public.mm_suno_solde_releves drop constraint mm_suno_solde_releves_credits_presents;
--   alter table public.mm_suno_solde_releves drop constraint mm_suno_solde_releves_etat_check,
--     add constraint mm_suno_solde_releves_etat_check check (etat in ('ok', 'bas', 'critique'));
--   alter table public.mm_suno_solde_releves alter column credits set not null;
-- ============================================================================

ALTER TABLE public.mm_suno_solde_releves ALTER COLUMN credits DROP NOT NULL;

ALTER TABLE public.mm_suno_solde_releves DROP CONSTRAINT IF EXISTS mm_suno_solde_releves_etat_check;
ALTER TABLE public.mm_suno_solde_releves
  ADD CONSTRAINT mm_suno_solde_releves_etat_check CHECK (etat IN ('ok', 'bas', 'critique', 'indisponible'));

ALTER TABLE public.mm_suno_solde_releves DROP CONSTRAINT IF EXISTS mm_suno_solde_releves_credits_presents;
ALTER TABLE public.mm_suno_solde_releves
  ADD CONSTRAINT mm_suno_solde_releves_credits_presents CHECK ((etat = 'indisponible') = (credits IS NULL));

CREATE INDEX IF NOT EXISTS mm_suno_solde_releves_releve_idx ON public.mm_suno_solde_releves (releve_at DESC);

CREATE TABLE IF NOT EXISTS public.mm_suno_solde_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  seuil_bas numeric(10, 1) CHECK (seuil_bas IS NULL OR seuil_bas > 0),
  seuil_critique numeric(10, 1) CHECK (seuil_critique IS NULL OR seuil_critique > 0),
  maj_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mm_suno_solde_config IS
  'Seuils d''alerte du solde Suno (crédits) lus par mm-suno-solde. NULL = secrets de fonction, sinon 120 / 36. Service_role seulement.';

INSERT INTO public.mm_suno_solde_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.mm_suno_solde_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mm_suno_solde_config FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
