import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Zap, Search, Music, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Système de Raccourcis Clavier Avancé
 */
export const KeyboardShortcuts = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const shortcuts = [
    // Navigation principale
    { key: '⌘+D', action: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { key: '⌘+M', action: 'Créer Musique', path: '/med-mng/create', icon: Music },
    { key: '⌘+A', action: 'Analytics', path: '/med-mng/analytics', icon: BarChart3 },
    { key: '⌘+S', action: 'Système Monitoring', path: '/system-management', icon: Shield },
    
    // Recherche et navigation rapide
    { key: '⌘+K', action: 'Recherche rapide', path: '/library', icon: Search },
    { key: '⌘+/', action: 'Aide', action_type: 'help', icon: Keyboard },
    { key: 'Esc', action: 'Fermer modales', action_type: 'close', icon: Zap },
    
    // Actions spéciales
    { key: '⌘+Shift+N', action: 'Nouvelle génération', path: '/med-mng/create', icon: Music },
    { key: '⌘+Shift+D', action: 'Export données', path: '/platform-settings', icon: BarChart3 },
  ];

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, metaKey, ctrlKey, shiftKey } = event;
      const isCmd = metaKey || ctrlKey;

      // Afficher/masquer l'aide des raccourcis
      if (key === '/' && isCmd) {
        event.preventDefault();
        setIsVisible(prev => !prev);
        return;
      }

      // Fermer avec Escape
      if (key === 'Escape') {
        setIsVisible(false);
        return;
      }

      // Navigation rapide
      if (isCmd && !shiftKey) {
        switch (key.toLowerCase()) {
          case 'd':
            event.preventDefault();
            navigate('/dashboard');
            toast.success('Navigation vers Dashboard');
            break;
          case 'm':
            event.preventDefault();
            navigate('/med-mng/create');
            toast.success('Navigation vers Création Musicale');
            break;
          case 'a':
            event.preventDefault();
            navigate('/med-mng/analytics');
            toast.success('Navigation vers Analytics');
            break;
          case 's':
            event.preventDefault();
            navigate('/system-management');
            toast.success('Navigation vers Monitoring Système');
            break;
          case 'k':
            event.preventDefault();
            navigate('/library');
            toast.success('Navigation vers Bibliothèque');
            break;
        }
      }

      // Actions avec Shift
      if (isCmd && shiftKey) {
        switch (key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            navigate('/med-mng/create');
            toast.success('Nouvelle génération musicale');
            break;
          case 'd':
            event.preventDefault();
            navigate('/platform-settings');
            toast.success('Navigation vers Export de données');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl medical-card shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Raccourcis Clavier
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-3 max-h-80 overflow-y-auto">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <shortcut.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{shortcut.action}</span>
                </div>
                
                <Badge variant="outline" className="font-mono text-xs">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Appuyez sur <Badge variant="outline" className="mx-1">⌘+/</Badge> 
              pour afficher/masquer ces raccourcis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyboardShortcuts;