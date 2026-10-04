-- IC-150 : décision CEO du 03.10.2026 — valeur LiSA conservée (OIC-150-06-A, 80–90 mg/kg/j) ;
-- ajout de « par jour » dans les paroles (6 lignes). Appliqué le 03.10.2026.
UPDATE public.edn_items_complete
   SET paroles_rang_a    = array_replace(paroles_rang_a,    'Moins de 2 ans : amoxicilline 80 à 90 milligrammes par kilo, 8 à 10 jours,', 'Moins de 2 ans : amoxicilline 80 à 90 milligrammes par kilo et par jour, 8 à 10 jours,'),
       paroles_musicales = array_replace(paroles_musicales, 'Moins de 2 ans : amoxicilline 80 à 90 milligrammes par kilo, 8 à 10 jours,', 'Moins de 2 ans : amoxicilline 80 à 90 milligrammes par kilo et par jour, 8 à 10 jours,'),
       paroles_rang_ab   = array_replace(paroles_rang_ab,   'Moins de 2 ans : amoxicilline 80 à 90 milligrammes par kilo, 8 à 10 jours,', 'Moins de 2 ans : amoxicilline 80 à 90 milligrammes par kilo et par jour, 8 à 10 jours,')
 WHERE item_code = 'IC-150';
