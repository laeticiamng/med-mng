import React from 'react';
import { SystemHealthChecker } from '@/components/system/SystemHealthChecker';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SystemHealth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <div className="h-6 border-l border-gray-300" />
          <h1 className="text-3xl font-bold text-gray-900">
            Diagnostic Système
          </h1>
        </div>
        
        <SystemHealthChecker />
      </div>
    </div>
  );
};

export default SystemHealth;