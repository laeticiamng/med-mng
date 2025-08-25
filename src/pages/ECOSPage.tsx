import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Users, Activity, Clock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ECOSPage = () => {
  const ecosStations = [
    {
      id: 'clinical-exam',
      title: 'Examen clinique',
      description: 'Stations d\'examen physique et sémiologie',
      icon: Stethoscope,
      color: 'bg-blue-500',
      scenarios: 12
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Relation médecin-patient et annonces',
      icon: Users,
      color: 'bg-green-500',
      scenarios: 8
    },
    {
      id: 'procedures',
      title: 'Gestes techniques',
      description: 'Procédures et actes médicaux',
      icon: Activity,
      color: 'bg-purple-500',
      scenarios: 15
    },
    {
      id: 'emergencies',
      title: 'Situations d\'urgence',
      description: 'Prise en charge des urgences médicales',
      icon: Clock,
      color: 'bg-red-500',
      scenarios: 10
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            ECOS - Examen Clinique Objectif Structuré
          </h1>
          <p className="text-muted-foreground">
            Développez vos compétences cliniques à travers des situations pratiques
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {ecosStations.map((station) => (
            <Card key={station.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${station.color} rounded-lg`}>
                    <station.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle>{station.title}</CardTitle>
                    <CardDescription>{station.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{station.scenarios} scénarios</Badge>
                  <Link to={`/ecos/station/${station.id}`}>
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Commencer
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};