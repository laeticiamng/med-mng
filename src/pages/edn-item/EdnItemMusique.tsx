import { useMemo } from 'react';
import { MusiqueItem } from '@/components/edn/music/MusiqueItem';
import type { ParolesItem } from '@/components/generator/GeneratorForm';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/**
 * `/edn-complete/:slug/musique` — sous-page « Musique » de l'item, sur le
 * modèle de Create : item déjà choisi, trois onglets (rang A, rang B, rang A+B),
 * style, paroles du seul rang choisi, génération et chansons déjà créées.
 */
export default function EdnItemMusique() {
  const { item, contenu, rangAVide, rangBVide, numeroItem } = useFicheItemEdn();

  // Les quatre jeux de paroles viennent de la RPC `mm_contenu_immersif_item`
  // (contenu réservé aux items d'essai et à Premium) ; la route parente
  // n'affiche cette sous-page qu'une fois le contenu renvoyé par le serveur.
  // Item sans aucune compétence de rang A (IC-30, IC-142) : pas de chanson « Rang A »
  // (generer-paroles-item : « aucune compétence de rang A … Aucune chanson n'est générée »).
  const paroles = useMemo<ParolesItem>(() => {
    const sansRangA = (lignes: string[] | null | undefined) =>
      rangAVide ? [] : (lignes ?? []);
    const musicales =
      contenu.paroles_musicales.length > 0
        ? contenu.paroles_musicales
        : item.paroles_musicales;
    return {
      item_code: item.item_code,
      title: item.title,
      subtitle: item.subtitle ?? undefined,
      paroles_musicales: sansRangA(musicales),
      paroles_rang_a: sansRangA(contenu.paroles_rang_a ?? item.paroles_rang_a),
      paroles_rang_b: contenu.paroles_rang_b ?? item.paroles_rang_b ?? [],
      paroles_rang_ab: contenu.paroles_rang_ab ?? item.paroles_rang_ab ?? [],
    };
  }, [item, contenu, rangAVide]);

  return (
    <>
      <EdnItemSeo segment="musique" />
      <MusiqueItem
        itemCode={item.item_code}
        titre={item.title}
        numero={numeroItem}
        paroles={paroles}
        rangAVide={rangAVide}
        rangBVide={rangBVide}
      />
    </>
  );
}
