
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, Users, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ux/Breadcrumbs';
import { LoadingFeedback } from '@/components/ux/LoadingFeedback';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const EcosIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sample ECOS scenarios - in real app, this would come from API
  const ecosScenarios = [
    { 
      id: '003', 
      title: 'Douleur thoracique', 
      specialty: 'Cardiologie', 
      duration: '15 min',
      type: 'Urgence',
      description: 'Patient de 45 ans consultant pour douleur thoracique brutale'
    },
    { 
      id: '042', 
      title: 'Dyspnée aiguë', 
      specialty: 'Pneumologie', 
      duration: '12 min',
      type: 'Urgence',
      description: 'Femme de 65 ans avec essoufflement soudain'
    },
    { 
      id: '087', 
      title: 'Fièvre chez l\'enfant', 
      specialty: 'Pédiatrie', 
      duration: '10 min',
      type: 'Consultation',
      description: 'Enfant de 3 ans avec fièvre depuis 2 jours'
    },
    { 
      id: '156', 
      title: 'Céphalées récurrentes', 
      specialty: 'Neurologie', 
      duration: '15 min',
      type: 'Consultation',
      description: 'Adulte jeune avec maux de tête fréquents'
    },
    { 
      id: '203', 
      title: 'Troubles du comportement', 
      specialty: 'Psychiatrie', 
      duration: '18 min',
      type: 'Consultation',
      description: 'Entretien avec patient présentant des troubles anxieux'
    },
    { 
      id: '287', 
      title: 'Grossesse pathologique', 
      specialty: 'Gynécologie', 
      duration: '12 min',
      type: 'Suivi',
      description: 'Suivi de grossesse avec complications'
    },
  ];

  const filteredScenarios = ecosScenarios.filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Urgence': return 'text-red-400 bg-red-400/10';
      case 'Consultation': return 'text-blue-400 bg-blue-400/10';
      case 'Suivi': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <ConsistentBackground variant="primary">
      <PageHeader
        title="Situations ECOS"
        subtitle="Pratiquez les situations de départ ECOS avec des patients virtuels immersifs"
        icon={Stethoscope}
        showBackButton
        backTo="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search bar */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher une situation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/10 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

          {/* Scenarios grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario, index) => (
              <Link
                key={scenario.id}
                to={`/ecos/sd-${scenario.id.toLowerCase()}-${scenario.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                className="group"
              >
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border hover:bg-card hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                     style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold">
                        SD{scenario.id}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-foreground font-semibold text-lg group-hover:text-primary transition-colors">
                          {scenario.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">{scenario.specialty}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {scenario.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(scenario.type)}`}>
                        {scenario.type}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3" />
                        {scenario.duration}
                      </div>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty state */}
          {filteredScenarios.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl text-muted-foreground mb-2">Aucune situation trouvée</h3>
              <p className="text-muted-foreground/60">Essayez de modifier votre recherche</p>
            </div>
          )}
        </div>
      </ConsistentBackground>
    );
  };

  export default EcosIndex;
