import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, Star, Crown, Trophy, Brain, CheckCircle, AlertCircle, 
  Lock, Unlock, Zap, Sparkles, BookOpen, Lightbulb, Filter
} from 'lucide-react';

interface ConceptClassifie {
  id: string;
  concept: string;
  definition: string;
  rang: 'A' | 'B' | 'AB';
  frequence: 'ultra-frequent' | 'frequent' | 'rare';
  importance_ecn: number;
  difficulte: number;
  mots_cles: string[];
  exemples: string[];
  pieges_frequents: string[];
  mnemoniques?: string;
  competences_associees: string[];
  temps_maitrise_estime: number; // minutes
  derniere_revision?: Date;
  niveau_maitrise: number; // 0-100%
}

interface TableauRangClassificationProps {
  itemCode: string;
  title: string;
  concepts?: ConceptClassifie[];
  onConceptMastered?: (conceptId: string) => void;
}

export const TableauxRangClassification = ({ 
  itemCode, 
  title, 
  concepts = [], 
  onConceptMastered 
}: TableauRangClassificationProps) => {
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | 'AB' | 'ALL'>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [masteredConcepts, setMasteredConcepts] = useState<Set<string>>(new Set());
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  // Concepts de démonstration si pas de données
  const demosConcepts: ConceptClassifie[] = [
    {
      id: '1',
      concept: 'Anamnèse structurée',
      definition: 'Interrogatoire systématique du patient suivant une méthodologie rigoureuse',
      rang: 'A',
      frequence: 'ultra-frequent',
      importance_ecn: 95,
      difficulte: 2,
      mots_cles: ['interrogatoire', 'anamnèse', 'histoire', 'symptômes'],
      exemples: ['Douleur thoracique', 'Dyspnée', 'Céphalées'],
      pieges_frequents: ['Oublier les antécédents familiaux', 'Ne pas préciser la chronologie'],
      mnemoniques: 'SOCRATES pour la douleur',
      competences_associees: ['Communication', 'Sémiologie', 'Diagnostic'],
      temps_maitrise_estime: 45,
      niveau_maitrise: 85
    },
    {
      id: '2',
      concept: 'Examen clinique systématique',
      definition: 'Examen physique complet et méthodique du patient',
      rang: 'A',
      frequence: 'ultra-frequent',
      importance_ecn: 90,
      difficulte: 3,
      mots_cles: ['inspection', 'palpation', 'percussion', 'auscultation'],
      exemples: ['Examen cardiovasculaire', 'Examen pulmonaire', 'Examen abdominal'],
      pieges_frequents: ['Oublier l\'inspection', 'Mauvaise technique de palpation'],
      competences_associees: ['Sémiologie', 'Diagnostic', 'Gestes techniques'],
      temps_maitrise_estime: 60,
      niveau_maitrise: 72
    },
    {
      id: '3',
      concept: 'Diagnostic différentiel avancé',
      definition: 'Élaboration systématique des hypothèses diagnostiques alternatives',
      rang: 'B',
      frequence: 'frequent',
      importance_ecn: 75,
      difficulte: 4,
      mots_cles: ['différentiel', 'hypothèses', 'probabilités', 'exclusion'],
      exemples: ['Douleur abdominale aiguë', 'Syndrome fébrile', 'Dyspnée aiguë'],
      pieges_frequents: ['Tunnel vision', 'Biais de confirmation'],
      competences_associees: ['Raisonnement clinique', 'Analyse critique'],
      temps_maitrise_estime: 90,
      niveau_maitrise: 45
    },
    {
      id: '4',
      concept: 'Prise en charge pluridisciplinaire',
      definition: 'Coordination des soins avec différentes spécialités médicales',
      rang: 'B',
      frequence: 'frequent',
      importance_ecn: 65,
      difficulte: 5,
      mots_cles: ['coordination', 'pluridisciplinaire', 'collaboration', 'référence'],
      exemples: ['RCP oncologique', 'Équipe gériatrique', 'Soins palliatifs'],
      pieges_frequents: ['Communication insuffisante', 'Retard de référence'],
      competences_associees: ['Communication', 'Organisation', 'Leadership'],
      temps_maitrise_estime: 120,
      niveau_maitrise: 30
    }
  ];

  const conceptsData = concepts.length > 0 ? concepts : demosConcepts;

  // Filtrage des concepts
  const filteredConcepts = conceptsData.filter(concept => {
    const rangMatch = selectedRang === 'ALL' || concept.rang === selectedRang;
    const difficultyMatch = selectedDifficulty === 'all' || 
      (selectedDifficulty === 'easy' && concept.difficulte <= 2) ||
      (selectedDifficulty === 'medium' && concept.difficulte === 3) ||
      (selectedDifficulty === 'hard' && concept.difficulte >= 4);
    
    return rangMatch && difficultyMatch;
  });

  // Statistiques
  const stats = {
    total: conceptsData.length,
    rangA: conceptsData.filter(c => c.rang === 'A').length,
    rangB: conceptsData.filter(c => c.rang === 'B').length,
    rangAB: conceptsData.filter(c => c.rang === 'AB').length,
    mastered: masteredConcepts.size,
    averageMastery: conceptsData.reduce((acc, c) => acc + c.niveau_maitrise, 0) / conceptsData.length
  };

  const handleConceptMaster = (conceptId: string) => {
    const newMastered = new Set(masteredConcepts);
    if (newMastered.has(conceptId)) {
      newMastered.delete(conceptId);
    } else {
      newMastered.add(conceptId);
    }
    setMasteredConcepts(newMastered);
    onConceptMastered?.(conceptId);
  };

  const getRangConfig = (rang: 'A' | 'B' | 'AB') => {
    const configs = {
      'A': {
        name: 'Rang A - Core Knowledge',
        description: 'Ultra-fréquent, à maîtriser par tous',
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-green-50 to-emerald-50',
        icon: <Target className="h-4 w-4" />,
        priority: 'CRITIQUE'
      },
      'B': {
        name: 'Rang B - Discriminant', 
        description: 'Moins fréquent, pour le classement',
        gradient: 'from-orange-500 to-red-500',
        bgGradient: 'from-orange-50 to-red-50',
        icon: <Star className="h-4 w-4" />,
        priority: 'IMPORTANT'
      },
      'AB': {
        name: 'Rang A+B - Perfection',
        description: 'Maîtrise totale, visée top 500',
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-50 to-pink-50',
        icon: <Crown className="h-4 w-4" />,
        priority: 'EXCELLENCE'
      }
    };
    return configs[rang];
  };

  const ConceptCard = ({ concept }: { concept: ConceptClassifie }) => {
    const rangConfig = getRangConfig(concept.rang);
    const isMastered = masteredConcepts.has(concept.id);
    const isExpanded = expandedConcept === concept.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.01 }}
        className="w-full"
      >
        <Card className={`border-2 transition-all duration-300 ${
          isMastered 
            ? 'border-green-400 bg-green-50/50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`bg-gradient-to-r ${rangConfig.gradient} text-white font-medium`}>
                    {rangConfig.icon}
                    <span className="ml-1">Rang {concept.rang}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {rangConfig.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {concept.frequence}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-gray-800 mb-2">
                  {concept.concept}
                </CardTitle>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {concept.definition}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2 ml-4">
                <Button
                  size="sm"
                  variant={isMastered ? "default" : "outline"}
                  onClick={() => handleConceptMaster(concept.id)}
                  className={isMastered ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {isMastered ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Maîtrisé
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-1" />
                      À réviser
                    </>
                  )}
                </Button>
                
                <div className="text-right text-xs text-gray-500">
                  <div>Importance: {concept.importance_ecn}%</div>
                  <div>Difficulté: {concept.difficulte}/5</div>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Niveau de maîtrise</span>
                <span className="font-medium">{concept.niveau_maitrise}%</span>
              </div>
              <Progress value={concept.niveau_maitrise} className="h-2" />
            </div>

            {/* Bouton d'expansion */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedConcept(isExpanded ? null : concept.id)}
              className="w-full mt-2"
            >
              {isExpanded ? 'Réduire' : 'Voir détails'}
            </Button>
          </CardHeader>

          {/* Contenu étendu */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-0 space-y-4">
                  {/* Mots-clés */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Mots-clés essentiels
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {concept.mots_cles.map((mot, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {mot}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Exemples */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      Exemples cliniques
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {concept.exemples.map((exemple, index) => (
                        <li key={index}>{exemple}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Pièges fréquents */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Pièges à éviter
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                      {concept.pieges_frequents.map((piege, index) => (
                        <li key={index}>{piege}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Mnémotechnique */}
                  {concept.mnemoniques && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h4 className="font-medium text-purple-700 mb-1 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Mnémotechnique
                      </h4>
                      <p className="text-sm text-purple-600 font-medium">
                        {concept.mnemoniques}
                      </p>
                    </div>
                  )}

                  {/* Temps de maîtrise */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        Temps de maîtrise estimé
                      </span>
                      <span className="font-medium text-blue-800">
                        {concept.temps_maitrise_estime} minutes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                Tableaux Stratifiés - {title}
              </CardTitle>
              <p className="text-indigo-100">
                Classification stratégique par Rang A/B/AB selon la fréquence ECN
              </p>
            </div>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              {itemCode}
            </Badge>
          </div>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-indigo-200">Total concepts</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-300">{stats.rangA}</div>
              <div className="text-xs text-indigo-200">Rang A</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-300">{stats.rangB}</div>
              <div className="text-xs text-indigo-200">Rang B</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.mastered}</div>
              <div className="text-xs text-indigo-200">Maîtrisés</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{Math.round(stats.averageMastery)}%</div>
              <div className="text-xs text-indigo-200">Maîtrise moy.</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs text-gray-600">Rang :</Badge>
              {(['ALL', 'A', 'B', 'AB'] as const).map((rang) => (
                <Button
                  key={rang}
                  variant={selectedRang === rang ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRang(rang)}
                  className={selectedRang === rang ? getRangConfig(rang as any)?.gradient ? `bg-gradient-to-r ${getRangConfig(rang as any)?.gradient}` : '' : ''}
                >
                  {rang === 'ALL' ? 'Tous' : `Rang ${rang}`}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs text-gray-600">Difficulté :</Badge>
              {[
                { key: 'all', label: 'Toutes' },
                { key: 'easy', label: 'Facile (1-2)' },
                { key: 'medium', label: 'Moyen (3)' },
                { key: 'hard', label: 'Difficile (4-5)' }
              ].map((diff) => (
                <Button
                  key={diff.key}
                  variant={selectedDifficulty === diff.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff.key as any)}
                >
                  {diff.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des concepts */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Concepts Classifiés ({filteredConcepts.length})
          </h2>
          <Badge variant="secondary">
            {Math.round((stats.mastered / stats.total) * 100)}% complété
          </Badge>
        </div>

        <AnimatePresence>
          <motion.div className="grid gap-4">
            {filteredConcepts.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredConcepts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Aucun concept trouvé avec ces filtres
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};