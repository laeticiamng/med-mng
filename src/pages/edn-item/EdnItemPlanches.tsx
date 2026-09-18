import { BdGallery } from '@/components/edn/BdGallery';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/**
 * `/edn-complete/:slug/planches` — ancien onglet « Planches » (« BD ») de la
 * modale. Ce n'est pas une bande dessinée : ce sont les compétences OIC de
 * l'item présentées en diaporama illustré.
 */
export default function EdnItemPlanches() {
  const { item, contenu } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="planches" />
      <BdGallery
        itemCode={item.item_code}
        title={item.title}
        tableauRangA={contenu.tableau_rang_a}
        tableauRangB={contenu.tableau_rang_b}
        bdPanels={contenu.bd_panels}
      />
    </>
  );
}
