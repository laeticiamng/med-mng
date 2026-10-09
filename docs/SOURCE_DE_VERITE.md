# Med MNG — source de vérité

État **vérifié** du produit, fonctionnalité par fonctionnalité, avec la preuve et sa date. Ce qui n'est pas prouvé ici est « non vérifié ». Les rapports d'audit antérieurs sont archivés (voir `docs/archives/`) et ne font pas foi.

Chaque section est délimitée par des marqueurs `<!-- section: … -->` / `<!-- fin section: … -->` : un agent ne modifie que ses propres sections ; en cas de conflit, garder les deux sections entières.

<!-- section: decisions -->
## Décisions de l'utilisatrice (CEO)

### Génération musicale — réactivée le 09.10.2026

- **Décision** (09.10.2026, soir, explicite) : la génération musicale de Med MNG est **réactivée**, comme avant la suspension du matin. Fournisseur technique : **sunoapi.org**, **aucune migration prévue**. Ne pas supprimer l'intégration ni changer de fournisseur sans nouvelle décision de l'utilisatrice.
- **Historique** : suspendue le 09.10.2026 au matin (#232, #234), la réponse écrite de Suno indiquant que sunoapi.org n'est pas un intermédiaire autorisé. La réactivation est une décision assumée par l'utilisatrice ; aucune mention de licence, de partenariat ou d'autorisation de Suno n'est faite nulle part (test `src/tests/createAudioDisponible.test.tsx`).
- **Mécanisme** : drapeau unique `GENERATION_AUDIO_DISPONIBLE` (`supabase/functions/_shared/mm-disponibilite.ts`), lu par le site et par `mm-generate-music`. Ordre des contrôles serveur : interrupteur → abonnement Premium et quota (30 par mois) → réservation au registre `mm_generations_audio` (refus si les compteurs sont illisibles) → appel à `https://api.sunoapi.org/api/v1/generate`.
- **Qualité des paroles** : contrôles de fidélité conservés (nombres, intervalles, unités et ordinaux en toutes lettres, durée suffisante : `supabase/functions/_shared/mm-paroles-chantees.ts`, `src/tests/parolesChantees.test.ts`).
- **Offre** : 69 €/an ou 9,90 €/mois, 30 générations audio par mois (prix Stripe `medmng_premium_annual` / `medmng_premium_monthly`, vérifiés le 09.10.2026).
<!-- fin section: decisions -->
