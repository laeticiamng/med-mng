import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { MesChansonsItem } from '@/components/edn/music/MesChansonsItem';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/musique` — ancien onglet « Musique » de la modale. */
export default function EdnItemMusique() {
  const { item, contenu, rangAVide } = useFicheItemEdn();
  // Item sans aucune compétence de rang A (IC-30, IC-142) : pas de chanson « Rang A ».
  // Sans cela, les mots-clés bruts de paroles_musicales s'affichaient comme « Rang A »
  // avec un bouton « Générer la chanson Rang A » voué à l'échec (generer-paroles-item :
  // « aucune compétence de rang A … Aucune chanson n'est générée »).
  const sansRangA = (lignes: string[] | null | undefined) => (rangAVide ? [] : lignes);

  return (
    <>
      <EdnItemSeo segment="musique" />
      {/* Les quatre jeux de paroles viennent de la RPC `mm_contenu_immersif_item`
          (contenu réservé aux items d'essai et à Premium) ; la route parente
          n'affiche cette sous-page qu'une fois le contenu renvoyé par le serveur. */}
      <ParolesMusicales
        paroles={sansRangA(contenu.paroles_musicales.length > 0 ? contenu.paroles_musicales : item.paroles_musicales) ?? []}
        paroles_rang_a={sansRangA(contenu.paroles_rang_a ?? item.paroles_rang_a) ?? undefined}
        paroles_rang_b={contenu.paroles_rang_b ?? item.paroles_rang_b}
        paroles_rang_ab={contenu.paroles_rang_ab ?? item.paroles_rang_ab}
        itemCode={item.item_code}
        tableauRangA={contenu.tableau_rang_a}
        tableauRangB={contenu.tableau_rang_b}
      />
      {/* Chansons déjà générées pour cet item (elles n'apparaissaient plus ici
          après un rechargement, seulement dans « Ma bibliothèque »). */}
      <div className="mt-6">
        <MesChansonsItem itemCode={item.item_code} />
      </div>
    </>
  );
}
