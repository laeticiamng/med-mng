
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, Users, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EcosIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 text-white hover:text-emerald-300 transition-colors">
                <Stethoscope className="h-8 w-8" />
                <span className="text-2xl font-bold">DocFlemme ECOS</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une situation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-12">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Situations ECOS
              </h1>
              <Sparkles className="h-6 w-6 text-teal-400 animate-pulse" />
            </div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Pratiquez les situations de départ ECOS avec des patients virtuels immersifs
            </p>
          </div>

          {/* Scenarios grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario, index) => (
              <Link
                key={scenario.id}
                to={`/ecos/sd-${scenario.id.toLowerCase()}-${scenario.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10 animate-fade-in"
                     style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                        SD{scenario.id}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg group-hover:text-emerald-300 transition-colors">
                          {scenario.title}
                        </h3>
                        <p className="text-white/60 text-sm">{scenario.specialty}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {scenario.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(scenario.type)}`}>
                        {scenario.type}
                      </span>
                      <div className="flex items-center gap-1 text-white/40 text-xs">
                        <Clock className="h-3 w-3" />
                        {scenario.duration}
                      </div>
                    </div>
                    <Users className="h-4 w-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty state */}
          {filteredScenarios.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">Aucune situation trouvée</h3>
              <p className="text-white/40">Essayez de modifier votre recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcosIndex;
