
-- Vider les tables de contenu factice pour les cours
DELETE FROM public.edn_items_complete;
DELETE FROM public.ecos_situations_complete;
DELETE FROM public.ai_generated_content WHERE content_type IN ('edn_item', 'ecos_scenario');
DELETE FROM public.official_content_cache;
DELETE FROM public."official_content_cache new";

-- Optionnel: vider aussi les données de test des items EDN de base
DELETE FROM public.edn_items;
DELETE FROM public.starting_situations;
DELETE FROM public.item_situation_relations;
DELETE FROM public.item_therapeutic_relations;
DELETE FROM public.therapeutic_classes;
DELETE FROM public.user_favorite_flashcards;
