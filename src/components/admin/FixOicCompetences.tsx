import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const FixOicCompetences: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fixed, setFixed] = useState(false);
  const { toast } = useToast();

  const fixOicItem205 = async () => {
    try {
      setLoading(true);
      
      // Appeler la fonction edge pour corriger IC-205
      const { data, error } = await supabase.functions.invoke('fix-oic-item-205', {
        body: {}
      });

      if (error) {
        throw error;
      }

      console.log('✅ Correction terminée:', data);
      
      toast({
        title: "✅ Compétences corrigées",
        description: `Les compétences OIC pour IC-205 ont été corrigées avec succès.`,
      });
      
      setFixed(true);
      
      // Recharger la page après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: `Erreur lors de la correction: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-orange-500" />
          <span>Correction des compétences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Les compétences OIC pour IC-205 semblent incomplètes ou corrompues. 
          Cliquez pour les corriger avec des données officielles.
        </div>
        
        {!fixed ? (
          <Button 
            onClick={fixOicItem205}
            disabled={loading}
            className="w-full"
            variant="default"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Correction en cours...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4 mr-2" />
                Corriger les compétences IC-205
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Compétences corrigées !</span>
          </div>
        )}
        
        <div className="flex items-start space-x-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>La page se rechargera automatiquement après la correction.</span>
        </div>
      </CardContent>
    </Card>
  );
};