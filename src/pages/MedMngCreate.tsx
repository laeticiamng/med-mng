import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { SEOHead } from '@/components/seo/SEOHead';
import { NOM_OFFRE_PREMIUM, QUOTA_GENERATIONS_AUDIO_PREMIUM } from '@/config/offre';
import Generator from '@/pages/Generator';

/**
 * /med-mng/create — le générateur audio MED MNG (entrée « Créer » de la
 * navigation).
 *
 * C'est le vrai générateur (src/pages/Generator.tsx) : items EDN réels,
 * paroles du rang choisi (RPC mm_contenu_immersif_item), styles du catalogue
 * partagé avec le serveur, suivi de la génération et bibliothèque. L'ancienne
 * page de cette route (items fictifs « IC1 », paroles inventées, quota lu sur
 * med-mng-api) a été retirée : elle envoyait de fausses paroles au service
 * payant et affichait un mur payant erroné (« 30, 300 ou 3 000 par mois »),
 * y compris aux administrateurs.
 *
 * Accès : abonnement MED MNG Premium (30 générations audio par mois) ou
 * administrateur — même règle que le serveur (mm-generate-music).
 */
const MedMngCreateComponent = () => (
  <>
    <SEOHead
      title="Créer une chanson"
      description={`Générez une chanson pédagogique à partir des paroles d'un item EDN (rang A, B ou A+B) dans le style de votre choix. ${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio par mois avec ${NOM_OFFRE_PREMIUM}.`}
      keywords="musique, IA, génération, EDN, apprentissage"
      canonical="/med-mng/create"
    />
    <MedMngLayout>
      <Generator />
    </MedMngLayout>
  </>
);

export const MedMngCreate = withAuth(MedMngCreateComponent);
