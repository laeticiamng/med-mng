import { TableauRangA } from '@/components/edn/TableauRangA';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/rang-a` — ancien onglet « Rang A » de la modale. */
export default function EdnItemRangA() {
  const { item, contenu } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="rang-a" />
      <TableauRangA _data={contenu.tableau_rang_a || item.tableau_rang_a} itemCode={item.item_code} />
    </>
  );
}
