import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { Play, Pause, AlertCircle, CheckCircle, Volume2, RefreshCw } from 'lucide-react';

export const AudioDebugger: React.FC<{ enabled?: boolean }> = ({ enabled = false }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});
  const { currentTrack, isPlaying, play, pause, stop } = useGlobalAudio();

  // URL de test audio
  const testAudioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';

  useEffect(() => {
    if (enabled) {
      updateDebugInfo();
    }
  }, [enabled, currentTrack, isPlaying]);

  const updateDebugInfo = () => {
    setDebugInfo({
      currentTrack: currentTrack ? {
        url: currentTrack.url,
        title: currentTrack.title,
        urlValid: currentTrack.url !== '' && currentTrack.url !== 'undefined'
      } : null,
      isPlaying,
      audioSupport: !!window.Audio,
      autoplayPolicy: 'unknown',
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const testAudioPlayback = async () => {
    console.log('🧪 Test de lecture audio démarré');
    const results: any = {
      canCreateAudio: false,
      canLoadUrl: false,
      canPlay: false,
      autoplayBlocked: false,
      corsIssue: false,
      error: null
    };

    try {
      // Test 1: Création d'objet Audio
      const testAudio = new Audio();
      results.canCreateAudio = true;
      console.log('✅ Audio object créé');

      // Test 2: Chargement URL
      testAudio.src = testAudioUrl;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        
        testAudio.addEventListener('loadstart', () => {
          results.canLoadUrl = true;
          console.log('✅ Chargement URL démarré');
        });

        testAudio.addEventListener('canplay', () => {
          clearTimeout(timeout);
          resolve(true);
        });

        testAudio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(e);
        });

        testAudio.load();
      });

      // Test 3: Lecture
      try {
        await testAudio.play();
        results.canPlay = true;
        console.log('✅ Lecture réussie');
        testAudio.pause();
      } catch (playError: any) {
        console.warn('⚠️ Erreur de lecture:', playError);
        if (playError.name === 'NotAllowedError') {
          results.autoplayBlocked = true;
        }
        results.error = playError.message;
      }

    } catch (error: any) {
      console.error('❌ Erreur test audio:', error);
      results.error = error.message;
      
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        results.corsIssue = true;
      }
    }

    setTestResults(results);
    updateDebugInfo();
  };

  const testCurrentTrack = () => {
    if (currentTrack) {
      console.log('🧪 Test de la piste actuelle:', currentTrack);
      
      if (isPlaying) {
        pause();
      } else {
        play(currentTrack);
      }
    }
  };

  if (!enabled) return null;

  return (
    <Card className="fixed bottom-4 left-4 w-96 max-h-96 z-50 shadow-xl bg-white/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Volume2 className="h-4 w-4" />
          Audio Debugger
          <Button
            size="sm"
            variant="ghost"
            onClick={updateDebugInfo}
            className="ml-auto h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 text-xs max-h-64 overflow-y-auto">
        {/* État actuel */}
        <div>
          <h4 className="font-medium mb-1">État actuel</h4>
          <div className="grid grid-cols-2 gap-1">
            <Badge variant={debugInfo.audioSupport ? 'default' : 'destructive'}>
              Audio API: {debugInfo.audioSupport ? 'OK' : 'KO'}
            </Badge>
            <Badge variant={isPlaying ? 'default' : 'secondary'}>
              Lecture: {isPlaying ? 'OUI' : 'NON'}
            </Badge>
          </div>
        </div>

        {/* Piste courante */}
        {currentTrack && (
          <div>
            <h4 className="font-medium mb-1">Piste courante</h4>
            <div className="bg-gray-50 p-2 rounded text-xs">
              <div>Titre: {currentTrack.title}</div>
              <div className="truncate">URL: {currentTrack.url.substring(0, 50)}...</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant={debugInfo.currentTrack?.urlValid ? 'default' : 'destructive'}>
                  URL {debugInfo.currentTrack?.urlValid ? 'Valide' : 'Invalide'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Tests */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={testAudioPlayback}
              className="flex-1 h-8 text-xs"
            >
              Test Audio
            </Button>
            {currentTrack && (
              <Button
                size="sm"
                variant="outline"
                onClick={testCurrentTrack}
                className="h-8 text-xs"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            )}
          </div>
        </div>

        {/* Résultats tests */}
        {Object.keys(testResults).length > 0 && (
          <div>
            <h4 className="font-medium mb-1">Résultats tests</h4>
            <div className="space-y-1">
              {Object.entries(testResults).map(([key, value]) => {
                if (key === 'error' && !value) return null;
                return (
                  <div key={key} className="flex items-center gap-2">
                    {typeof value === 'boolean' ? (
                      <>
                        {value ? 
                          <CheckCircle className="h-3 w-3 text-green-500" /> : 
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        }
                        <span>{key}: {value ? 'OK' : 'KO'}</span>
                      </>
                    ) : (
                      <span className="text-red-600">{key}: {String(value)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alertes spécifiques */}
        {testResults.autoplayBlocked && (
          <Alert className="p-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Autoplay bloqué - Interaction utilisateur requise
            </AlertDescription>
          </Alert>
        )}

        {testResults.corsIssue && (
          <Alert className="p-2" variant="destructive">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Problème CORS détecté
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 border-t pt-2">
          MAJ: {debugInfo.timestamp}
        </div>
      </CardContent>
    </Card>
  );
};