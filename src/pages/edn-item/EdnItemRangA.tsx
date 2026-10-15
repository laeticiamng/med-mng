import { TableauRangA } from '@/components/edn/TableauRangA';
import { LienQuizItem } from '@/components/edn/quiz/LienQuizItem';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/rang-a` — ancien onglet « Rang A » de la modale. */
export default function EdnItemRangA() {
  const { item, contenu, slugUrl, contenuVerrouille, chargementContenu } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="rang-a" />
      <TableauRangA _data={contenu.tableau_rang_a || item.tableau_rang_a} itemCode={item.item_code} />
      {/* Le quiz de l'item est réservé aux items d'essai et à Premium : pas de lien vers un encart. */}
      {!contenuVerrouille && !chargementContenu && (
        <LienQuizItem itemCode={item.item_code} slugUrl={slugUrl} accroche="Vous avez lu les compétences de rang A : testez ce que vous en retenez." />
      )}
    </>
  );
}
