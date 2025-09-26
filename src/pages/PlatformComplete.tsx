import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlatformComplete: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Plateforme Complète - MED-MNG</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">🎯 Plateforme Complète</h1>
          <div className="text-center">
            <Badge className="mb-8">97% Complété</Badge>
            <Link to="/med-mng/dashboard">
              <Button size="lg">Accéder au Tableau de Bord</Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default PlatformComplete;