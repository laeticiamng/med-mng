import { AudioAmbiancePlayer } from '@/components/edn/audio/AudioAmbiancePlayer';
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sceneImmersiveEstGenerique } from '@/utils/tableauTransformations';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';
import { cheminItemEdn } from './ednItemTabs';

/** `/edn-complete/:slug/scene` — ancien onglet « Scène » de la modale. */
export default function EdnItemScene() {
  const { item, contenu, slugUrl } = useFicheItemEdn();

  const scene = contenu.scene_immersive || item.scene_immersive;

  // La scène stockée est, pour les 367 items, le même gabarit sans contenu
  // clinique (« Patient présentant une pathologie typique de l'item N ») : on la
  // traite comme absente et on affiche « pas de scène » plutôt qu'une
  // simulation qui n'en est pas.
  if (sceneImmersiveEstGenerique(scene)) {
    return (
      <>
        <EdnItemSeo segment="scene" />
        <Card className="border-2 border-accent/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <CardTitle>Pas de scène clinique pour cet item</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Aucune scène clinique rédigée n'est disponible pour <strong>{item.item_code}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <Link
                to={cheminItemEdn(slugUrl, 'rang-a')}
                className="p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
              >
                <div className="font-semibold text-primary mb-1">📚 Rang A</div>
                <div className="text-xs text-muted-foreground">Compétences fondamentales</div>
              </Link>
              <Link
                to={cheminItemEdn(slugUrl, 'musique')}
                className="p-4 rounded-lg border border-success/30 bg-success/5 hover:bg-success/10 transition-colors text-left"
              >
                <div className="font-semibold text-success mb-1">🎵 Musique</div>
                <div className="text-xs text-muted-foreground">Mémorisation musicale</div>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Les compétences officielles de l'item restent consultables sur les pages Rang A et Rang B.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <EdnItemSeo segment="scene" />
      <div className="space-y-4">
        {item.audio_ambiance && (
          <AudioAmbiancePlayer audioConfig={item.audio_ambiance} _itemCode={item.item_code} />
        )}
        <SceneImmersive data={scene} itemCode={item.item_code} />
      </div>
    </>
  );
}
