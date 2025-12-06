import React, { useState } from 'react';
import { Music, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useSupabaseMusicTracks } from '@/hooks/useSupabaseMusicTracks';
import { MusicPlayer } from './MusicPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const MusicLibrary: React.FC = () => {
  const { tracks, loading, error, reload, testConnectivity } = useSupabaseMusicTracks();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [debugMode, setDebugMode] = useState(false);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => 
      prev < tracks.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => 
      prev > 0 ? prev - 1 : tracks.length - 1
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span className="text-muted-foreground">Chargement des musiques...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur: {error}
          <Button
            onClick={reload}
            variant="outline"
            size="sm"
            className="mt-2 ml-2"
          >
            <RefreshCw size={16} className="mr-1" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (tracks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Music size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">🚨 Aucune musique disponible</p>
          <p className="text-sm text-muted-foreground mb-4">
            ⚠️ Problème d'accès aux données (19 musiques attendues après correction RLS)
          </p>
          <div className="flex justify-center space-x-2">
            <Button onClick={reload} variant="outline">
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </Button>
            <Button onClick={testConnectivity} variant="secondary">
              🔧 Test DB
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            🎵 Ma Bibliothèque Musicale
          </h2>
          <p className="text-muted-foreground">
            Toutes vos musiques générées par IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            ✅ {tracks.length} musique{tracks.length > 1 ? 's' : ''} disponible{tracks.length > 1 ? 's' : ''} 
            {tracks.length >= 19 && " (Problème RLS résolu!)"}
          </span>
          {debugMode && (
            <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
              🐛 Debug: {new Date().toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={() => setDebugMode(!debugMode)} 
            variant="ghost" 
            size="sm"
            title="Toggle debug mode"
          >
            🐛
          </Button>
          <Button onClick={reload} variant="outline" size="sm">
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Lecteur principal */}
      <MusicPlayer
        track={currentTrack}
        onNext={tracks.length > 1 ? handleNext : undefined}
        onPrevious={tracks.length > 1 ? handlePrevious : undefined}
      />

      {/* Liste des tracks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music size={20} />
            Playlist ({tracks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => setCurrentTrackIndex(index)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrackIndex
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {track.title || `Musique ${index + 1}`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.metadata?.tags || 'Aucun tag'}
                    </p>
                    {track.metadata?.duration && (
                      <p className="text-xs text-muted-foreground">
                        Durée: {Math.round(track.metadata.duration)}s
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground ml-4">
                    <p>{new Date(track.created_at).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs">{new Date(track.created_at).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</p>
                    {index === currentTrackIndex && (
                      <Music size={16} className="text-primary inline mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};