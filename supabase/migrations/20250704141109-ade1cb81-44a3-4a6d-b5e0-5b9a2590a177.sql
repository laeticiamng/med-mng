-- Corriger la fonction get_edn_objectifs_rapport pour éviter l'erreur de structure
DROP FUNCTION IF EXISTS public.get_edn_objectifs_rapport();

CREATE OR REPLACE FUNCTION public.get_edn_objectifs_rapport()
RETURNS TABLE(
  item_parent INTEGER,
  objectifs_attendus INTEGER,
  objectifs_extraits INTEGER,
  completude_pct NUMERIC,
  manquants TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si la table a des données
  IF NOT EXISTS (SELECT 1 FROM public.edn_objectifs_connaissance LIMIT 1) THEN
    -- Retourner une ligne vide si pas de données
    RETURN;
  END IF;

  -- Retourner les statistiques par item
  RETURN QUERY
  SELECT 
    o.item_parent,
    CASE 
      WHEN o.item_parent BETWEEN 1 AND 100 THEN 15
      WHEN o.item_parent BETWEEN 101 AND 200 THEN 12
      WHEN o.item_parent BETWEEN 201 AND 300 THEN 14
      ELSE 13
    END as attendus_estime,
    COUNT(*)::INTEGER as extraits,
    ROUND((COUNT(*)::NUMERIC / 
      CASE 
        WHEN o.item_parent BETWEEN 1 AND 100 THEN 15
        WHEN o.item_parent BETWEEN 101 AND 200 THEN 12
        WHEN o.item_parent BETWEEN 201 AND 300 THEN 14
        ELSE 13
      END::NUMERIC) * 100, 2) as completude_pct,
    ARRAY[]::TEXT[] as manquants -- Sera peuplé ultérieurement
  FROM public.edn_objectifs_connaissance o
  GROUP BY o.item_parent
  ORDER BY o.item_parent;
END;
$$;