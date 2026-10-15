import { TableauRangB } from '@/components/edn/TableauRangB';
import { LienQuizItem } from '@/components/edn/quiz/LienQuizItem';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/rang-b` — ancien onglet « Rang B » de la modale. */
export default function EdnItemRangB() {
  const { item, contenu, slugUrl, contenuVerrouille, chargementContenu } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="rang-b" />
      <TableauRangB _data={contenu.tableau_rang_b || item.tableau_rang_b} itemCode={item.item_code} />
      {/* Le quiz de l'item est réservé aux items d'essai et à Premium : pas de lien vers un encart. */}
      {!contenuVerrouille && !chargementContenu && (
        <LienQuizItem itemCode={item.item_code} slugUrl={slugUrl} accroche="Vous avez lu les compétences de rang B : testez ce que vous en retenez." />
      )}
    </>
  );
}
