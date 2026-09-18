import { RomanNarratif } from '@/components/edn/RomanNarratif';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/**
 * `/edn-complete/:slug/recit` — ancien onglet « Récit » (« Roman ») de la
 * modale : mise en situation construite à partir des compétences OIC.
 */
export default function EdnItemRecit() {
  const { item, contenu } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="recit" />
      <RomanNarratif
        itemCode={item.item_code}
        title={item.title}
        tableauRangA={contenu.tableau_rang_a}
        tableauRangB={contenu.tableau_rang_b}
        romanStory={contenu.roman_story}
      />
    </>
  );
}
