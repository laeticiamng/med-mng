-- ============================================================================
-- MED MNG — Items d'essai : 9 items cliniques à la place d'IC-2 à IC-10 (DC5)
-- Décision produit du 06.10.2026 (CEO) : « Oui », telle que recommandée.
-- NON APPLIQUÉE en production à la date de ce fichier : à déployer EN MÊME TEMPS
-- que le front (src/config/offre.ts), sinon l'interface et le serveur divergent.
-- ============================================================================
-- CONSTAT : mm_items_gratuits() renvoyait IC-1 à IC-10, tous transversaux
-- (« Fondamentaux médicaux »). mm_item_gratuit() ne fait qu'appeler
-- mm_items_gratuits() : elle n'est pas modifiée. Seule la RPC
-- mm_contenu_immersif_item() s'en sert ; aucune politique RLS ne l'utilise.
-- Aucun utilisateur n'avait de progression sur IC-2 à IC-10 dans les 60 derniers
-- jours (SELECT du 06.10.2026) : le changement ne retire rien à personne.
--
-- NOUVELLE LISTE (10 items : le nombre « 10 items d'essai » reste exact) :
--   IC-1   Relation médecin-malade (conservé : premier item)
--   IC-161 Infections urinaires de l'enfant et de l'adulte
--   IC-154 Infections broncho-pulmonaires communautaires
--   IC-27  Prévention des risques fœtaux
--   IC-247 Diabète sucré de type 1 et 2
--   IC-359 Détresse respiratoire aiguë (nourrisson, enfant, adulte)
--   IC-224 HTA de l'adulte et de l'enfant
--   IC-340 Accidents vasculaires cérébraux
--   IC-356 Appendicite de l'enfant et de l'adulte
--   IC-66  Troubles dépressifs, anxieux…
-- Critère : nombre de groupes de DES pondérant le rang B de l'item pour
-- l'appariement (arrêté du 19.04.2022, JO du 14.05.2022, annexe 1), avec
-- contrainte de diversité des spécialités. IC-150 est exclu (décision DC2
-- ouverte ; item verrouillé de référence dans e2e-prod/verrou.spec.ts).
--
-- EFFET : même signature (sans argument, TEXT[]), même volatilité (IMMUTABLE),
-- même search_path (public, posé par 20260925031058) : CREATE OR REPLACE
-- conserve les droits existants (aucun GRANT/REVOKE ici). Seule la liste change.
--
-- À TENIR ALIGNÉ avec src/config/offre.ts (ITEMS_GRATUITS).
--
-- RETOUR ARRIÈRE : réappliquer la définition de
-- 20260925031036_cf912335-3a37-4ceb-8cf0-399ba4ee5c0b.sql (IC-1 à IC-10),
-- avec SET search_path = public.
--
-- VÉRIFICATION APRÈS APPLICATION :
--   select public.mm_item_gratuit('IC-161'), public.mm_item_gratuit('IC-2'),
--          public.mm_item_gratuit('IC-150');                      -- t, f, f
--   select cardinality(public.mm_items_gratuits());               -- 10
--   e2e-prod/verrou.spec.ts et e2e-prod/critique.spec.ts (@attend-deploiement).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mm_items_gratuits()
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT ARRAY['IC-1','IC-161','IC-154','IC-27','IC-247','IC-359','IC-224','IC-340','IC-356','IC-66']::TEXT[];
$$;
