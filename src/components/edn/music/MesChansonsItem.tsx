import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { ROUTE_PATHS } from '@/config/routes';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ListMusic } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * « Mes chansons de cet item » — les chansons déjà générées par l'utilisateur
 * pour l'item affiché.
 *
 * CONSTAT (audit du 04.10.2026, production) : après un rechargement, une
 * chanson générée depuis l'onglet Musique n'y apparaissait plus ; il fallait
 * aller la chercher dans « Ma bibliothèque ». Source : generated_music_tracks
 * (RLS : ses propres lignes), générations terminées de l'item, une entrée par
 * fichier audio (la ligne principale reprend l'audio de la première piste).
 */

interface ChansonItem {
  id: string;
  title: string | null;
  audio_url: string | null;
  duration: number | string | null;
  created_at: string;
  metadata: { rang?: string; style?: string } | null;
}

export const dureeLisible = (valeur: number | string | null | undefined): string => {
  const secondes = typeof valeur === 'number' ? valeur : Number.parseFloat(String(valeur ?? ''));
  if (!Number.isFinite(secondes) || secondes <= 0) return '';
  const total = Math.round(secondes);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/** Une entrée par fichier audio, la plus récente d'abord. */
export const dedoublonnerChansons = (lignes: ChansonItem[]): ChansonItem[] => {
  const vues = new Set<string>();
  return [...lignes]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .filter((l) => {
      if (!l.audio_url || vues.has(l.audio_url)) return false;
      vues.add(l.audio_url);
      return true;
    });
};

export const MesChansonsItem: React.FC<{ itemCode: string }> = ({ itemCode }) => {
  const { user } = useAuth();

  const { data: chansons = [] } = useQuery({
    queryKey: ['mes-chansons-item', user?.id, itemCode],
    enabled: Boolean(user?.id && itemCode),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<ChansonItem[]> => {
      const { data, error } = await (supabase as any)
        .from('generated_music_tracks')
        .select('id, title, audio_url, duration, created_at, metadata')
        .eq('user_id', user!.id)
        .eq('generation_status', 'completed')
        .eq('metadata->>itemCode', itemCode)
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) return [];
      return dedoublonnerChansons((data ?? []) as ChansonItem[]).slice(0, 6);
    },
  });

  if (chansons.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListMusic className="h-4 w-4 text-primary" aria-hidden="true" />
          Mes chansons de cet item
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-3">
          {chansons.map((c, i) => {
            const duree = dureeLisible(c.duration);
            const date = new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
            const titre = `${c.title || `Chanson ${itemCode}`}${chansons.length > 1 ? ` · version ${chansons.length - i}` : ''}`;
            return (
              <li key={c.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{titre}</p>
                <p className="mb-2 text-xs text-muted-foreground">
                  {[c.metadata?.style, duree, date].filter(Boolean).join(' · ')}
                </p>
                <audio controls preload="none" src={c.audio_url ?? undefined} className="w-full" aria-label={`Écouter ${titre}`} />
              </li>
            );
          })}
        </ul>
        <Link to={ROUTE_PATHS.medMngMusicLibrary} className="text-sm font-medium text-primary hover:underline">
          Toutes mes chansons dans « Ma bibliothèque »
        </Link>
      </CardContent>
    </Card>
  );
};

export default MesChansonsItem;
