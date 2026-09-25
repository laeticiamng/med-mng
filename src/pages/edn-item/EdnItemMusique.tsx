import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/musique` — ancien onglet « Musique » de la modale. */
export default function EdnItemMusique() {
  const { item, contenu } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="musique" />
      {/* Les quatre jeux de paroles viennent de la RPC `mm_contenu_immersif_item`
          (contenu réservé aux items d'essai et à Premium) ; la route parente
          n'affiche cette sous-page qu'une fois le contenu renvoyé par le serveur. */}
      <ParolesMusicales
        paroles={contenu.paroles_musicales.length > 0 ? contenu.paroles_musicales : item.paroles_musicales}
        paroles_rang_a={contenu.paroles_rang_a ?? item.paroles_rang_a}
        paroles_rang_b={contenu.paroles_rang_b ?? item.paroles_rang_b}
        paroles_rang_ab={contenu.paroles_rang_ab ?? item.paroles_rang_ab}
        itemCode={item.item_code}
        tableauRangA={contenu.tableau_rang_a}
        tableauRangB={contenu.tableau_rang_b}
      />
    </>
  );
}
