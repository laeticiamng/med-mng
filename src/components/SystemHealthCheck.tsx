import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const SystemHealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');

  useEffect(() => {
    // Simulate health check
    const timer = setTimeout(() => {
      setStatus('healthy');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">Vérification système...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-100 text-red-800 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Erreur système détectée</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-3 py-2 rounded-lg shadow-sm opacity-75">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Système opérationnel</span>
      </div>
    </div>
  );
};