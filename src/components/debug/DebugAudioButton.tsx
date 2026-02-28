import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Play } from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface DebugAudioButtonProps {
  audioUrl: string;
  title?: string;
}

export const DebugAudioButton: React.FC<DebugAudioButtonProps> = ({ 
  audioUrl, 
  title = "Audio Test" 
}) => {
  const [status, setStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = React.useState<string>('');
  const { logActivity } = useActivityTracking();

  const testAudio = async () => {
    setStatus('testing');
    setErrorDetails('');
    
    logActivity({ activity_type: 'study', metadata: { action: 'debug_audio_test', url: audioUrl.substring(0, 50) } });
    
    console.log('🔍 Debug Audio Test:', {
      url: audioUrl,
      urlType: typeof audioUrl,
      isValidUrl: audioUrl?.startsWith('http'),
      length: audioUrl?.length
    });

    if (!audioUrl || audioUrl === '' || audioUrl === 'undefined') {
      setStatus('error');
      setErrorDetails('URL manquante ou invalide');
      return;
    }

    try {
      // Test 1: Vérifier si l'URL est accessible
      console.log('🔍 Test 1: Vérification URL...');
      const response = await fetch(audioUrl, { method: 'HEAD' });
      console.log('📊 Response headers:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Test 2: Créer un élément audio
      console.log('🔍 Test 2: Création élément audio...');
      const audio = new Audio();
      
      const testPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout: impossible de charger les métadonnées'));
        }, 10000);

        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          console.log('✅ Métadonnées chargées:', {
            duration: audio.duration,
            readyState: audio.readyState
          });
          resolve(audio.duration);
        });

        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(new Error(`Erreur audio: ${e.type}`));
        });

        audio.src = audioUrl;
        audio.load();
      });

      await testPromise;
      setStatus('success');
      console.log('✅ Test audio réussi !');

    } catch (error) {
      console.error('❌ Test audio échoué:', error);
      setStatus('error');
      setErrorDetails(error instanceof Error ? error.message : String(error));
    }
  };

  const playDirectly = () => {
    const audio = new Audio(audioUrl);
    audio.play().catch(e => {
      console.error('❌ Lecture directe échouée:', e);
      alert(`Erreur lecture: ${e.message}`);
    });
  };

  return (
    <div className="space-y-2 p-3 border rounded-lg bg-muted">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex space-x-1">
          {status === 'idle' && <AlertCircle className="h-4 w-4 text-muted-foreground/60" />}
          {status === 'testing' && <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />}
          {status === 'success' && <CheckCircle className="h-4 w-4 text-success" />}
          {status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground break-all">
        URL: {audioUrl?.substring(0, 60)}...
      </div>
      
      <div className="flex space-x-2">
        <Button 
          onClick={testAudio} 
          size="sm" 
          variant="outline"
          disabled={status === 'testing'}
        >
          {status === 'testing' ? 'Test...' : 'Tester URL'}
        </Button>
        <Button 
          onClick={playDirectly} 
          size="sm" 
          variant="outline"
          disabled={status !== 'success'}
        >
          <Play className="h-3 w-3 mr-1" />
          Lecture
        </Button>
      </div>
      
      {status === 'error' && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          ❌ {errorDetails}
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-xs text-success bg-success/10 p-2 rounded">
          ✅ Audio accessible et valide
        </div>
      )}
    </div>
  );
};