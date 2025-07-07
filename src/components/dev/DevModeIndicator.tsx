import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DevModeIndicator = () => {
  // En mode développement, afficher l'indicateur
  const isDevelopment = window.location.hostname.includes('lovable') || 
                       window.location.hostname === 'localhost' ||
                       process.env.NODE_ENV === 'development';

  if (!isDevelopment) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg">
        <Shield className="h-4 w-4" />
        <Badge variant="secondary" className="bg-white text-blue-600">
          Mode TEST
        </Badge>
        <Link to="/dev-workspace">
          <Button size="sm" variant="secondary" className="h-6 text-xs">
            <Code className="h-3 w-3 mr-1" />
            Dev Zone
          </Button>
        </Link>
      </div>
    </div>
  );
};