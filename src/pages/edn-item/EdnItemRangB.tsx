import { TableauRangB } from '@/components/edn/TableauRangB';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/rang-b` — ancien onglet « Rang B » de la modale. */
export default function EdnItemRangB() {
  const { item, contenu } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="rang-b" />
      <TableauRangB _data={contenu.tableau_rang_b || item.tableau_rang_b} itemCode={item.item_code} />
    </>
  );
}
