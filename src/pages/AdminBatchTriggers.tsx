import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BatchTriggersPanel } from '@/components/admin/BatchTriggersPanel';
import { TranslatedText } from '@/components/TranslatedText';

export const AdminBatchTriggers = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText text="Retour" />
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Administration des Batch Triggers
            </h1>
            <p className="text-gray-600">
              Contrôle manuel des tâches coûteuses précédemment déclenchées automatiquement
            </p>
          </div>
        </div>

        {/* Panel principal */}
        <BatchTriggersPanel />
      </div>
    </div>
  );
};