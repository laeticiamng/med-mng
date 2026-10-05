import { BdGallery } from '@/components/edn/BdGallery';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/**
 * `/edn-complete/:slug/planches` — ancien onglet « Planches » (« BD ») de la
 * modale : cases écrites par IA pour l'item à partir de ses compétences OIC,
 * chacune dessinée d'après sa description (illustrer-case).
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
