import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { EcosSimulationChronometree } from '@/components/ecos/EcosSimulationChronometree';

const EcosSimulationPage = () => {
  const { itemCode } = useParams<{ itemCode: string }>();
  const navigate = useNavigate();

  const handleSimulationComplete = (results: any) => {
    console.log('Résultats ECOS:', results);
    // Ici on pourrait sauvegarder les résultats de la simulation
  };

  return (
    <>
      <Helmet>
        <title>ECOS Simulation - {itemCode} | MED-MNG</title>
        <meta name="description" content={`Simulation ECOS chronométrée pour ${itemCode}. Entraîne-toi dans des conditions réelles d'examen.`} />
        <meta name="keywords" content="ECOS, simulation, chronométrée, examen clinique, MED-MNG" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </div>

          {/* Simulation ECOS */}
          <EcosSimulationChronometree 
            itemCode={itemCode || 'IC-001'}
            onSimulationComplete={handleSimulationComplete}
          />
        </div>
      </div>
    </>
  );
};

export default EcosSimulationPage;