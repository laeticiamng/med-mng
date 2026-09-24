import { SEOHead } from '@/components/seo/SEOHead';
import { useFicheItemEdn } from './EdnItemContext';
import { cheminItemEdn, ongletParSegment } from './ednItemTabs';

/**
 * Titre de document et balise canonique propres à chaque sous-page d'item.
 *
 * La balise canonique pointe toujours sur le slug canonique de la table
 * `edn_items_complete`, pas sur ce que l'utilisateur a tapé : `/edn-complete/IC-1/quiz`
 * et `/edn-complete/ic-1/quiz` déclarent donc la même URL canonique.
 */
export const EdnItemSeo: React.FC<{ segment: string }> = ({ segment }) => {
  const { item, slugCanonique } = useFicheItemEdn();
  const onglet = ongletParSegment(segment);

  return (
    <SEOHead
      title={`${item.item_code} ${item.title} — ${onglet?.titreDocument ?? 'Item EDN'}`}
      description={`${item.item_code} — ${item.title}. ${onglet?.description ?? ''}`}
      keywords={`EDN, ${item.item_code}, ${item.title}, compétences OIC, UNESS${item.specialite ? `, ${item.specialite}` : ''}`}
      canonical={cheminItemEdn(slugCanonique, segment)}
      ogType="article"
    />
  );
};
