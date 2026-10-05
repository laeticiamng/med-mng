-- ============================================================================
-- MED MNG — cleanup_duplicates() suspendue (05.10.2026, appliquée en production)
-- ============================================================================
-- CONSTAT : cette fonction SECURITY DEFINER supprime des lignes d'items EDN
-- (« doublons »). Elle était exécutable par anon puis par tout compte connecté,
-- et la fonction edge audit-system (sans aucun contrôle d'accès jusqu'au commit
-- 9218f3c8) l'appelait avec la clé de service dès que autoFix était demandé.
-- Le contenu officiel ne se modifie pas automatiquement : aucune application ne
-- doit pouvoir la lancer.
-- EFFET : EXECUTE retiré à PUBLIC, anon, authenticated ET service_role (seul le
-- propriétaire peut encore l'exécuter, depuis l'éditeur SQL).
-- Conséquence : le bouton « Nettoyer » de /admin/audit et l'autoFix
-- « duplicate_item_code » d'audit-system échouent proprement (erreur affichée).
-- RETOUR ARRIÈRE : GRANT EXECUTE ON FUNCTION public.cleanup_duplicates() TO service_role;
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.cleanup_duplicates() FROM PUBLIC, anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
