import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, Search, Users, Clock, Sparkles, Trophy, 
  Target, BookOpen, Brain, Heart, Activity, Play,
  Star, Award, TrendingUp, CheckCircle, Timer,
  UserCheck, PlusCircle, Filter, Grid, List,
  Calendar, MapPin, Zap, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumbs } from '@/components/ux/Breadcrumbs';
import { LoadingFeedback } from '@/components/ux/LoadingFeedback';
import { ErgonomicEnhancements } from '@/components/ux/ErgonomicEnhancements';
import { SmartTooltip, ContextualHelp } from '@/components/ux/SmartTooltips';
import { PulseButton, AnimatedLike, MagneticHover } from '@/components/ux/MicroInteractions';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

const EcosIndex = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('scenarios');
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  // Statistiques utilisateur simulées
  const userStats = {
    completedScenarios: 12,
    averageScore: 87,
    totalTime: 186, // en minutes
    rank: 'Expert Junior',
    streak: 5
  };

  // Spécialités médicales
  const specialties = [
    { id: 'all', name: 'Toutes spécialités', icon: Target, color: 'text-gray-400' },
    { id: 'cardiology', name: 'Cardiologie', icon: Heart, color: 'text-red-400' },
    { id: 'neurology', name: 'Neurologie', icon: Brain, color: 'text-purple-400' },
    { id: 'emergency', name: 'Urgences', icon: Activity, color: 'text-orange-400' },
    { id: 'pediatrics', name: 'Pédiatrie', icon: UserCheck, color: 'text-blue-400' },
    { id: 'psychiatry', name: 'Psychiatrie', icon: Brain, color: 'text-indigo-400' },
    { id: 'gynecology', name: 'Gynécologie', icon: Users, color: 'text-pink-400' }
  ];

  // Scénarios ECOS enrichis
  const ecosScenarios = [
    { 
      id: '003', 
      title: 'Douleur thoracique aiguë', 
      specialty: 'Cardiologie', 
      specialtyId: 'cardiology',
      duration: '15 min',
      type: 'Urgence',
      difficulty: 'Intermédiaire',
      description: 'Patient de 45 ans consultant pour douleur thoracique brutale irradiant vers le bras gauche',
      objectives: ['Anamnèse dirigée', 'Examen clinique', 'Diagnostic différentiel', 'Prise en charge initiale'],
      competencies: ['IC-236', 'IC-132', 'IC-200'],
      popularity: 95,
      averageScore: 78,
      estimatedTime: 12,
      tags: ['ECG', 'Biomarqueurs', 'Urgence vitale'],
      patientProfile: {
        age: 45,
        gender: 'M',
        context: 'Consultation urgente',
        complexity: 'Modérée'
      }
    },
    { 
      id: '042', 
      title: 'Dyspnée aiguë du sujet âgé', 
      specialty: 'Pneumologie', 
      specialtyId: 'emergency',
      duration: '18 min',
      type: 'Urgence',
      difficulty: 'Avancé',
      description: 'Femme de 75 ans avec essoufflement soudain et toux productive',
      objectives: ['Évaluation respiratoire', 'Gaz du sang', 'Imagerie thoracique', 'Oxygénothérapie'],
      competencies: ['IC-204', 'IC-354', 'IC-199'],
      popularity: 88,
      averageScore: 71,
      estimatedTime: 16,
      tags: ['OAP', 'Embolie pulmonaire', 'Insuffisance cardiaque'],
      patientProfile: {
        age: 75,
        gender: 'F',
        context: 'Service d\'urgences',
        complexity: 'Élevée'
      }
    },
    { 
      id: '087', 
      title: 'Fièvre chez l\'enfant de 18 mois', 
      specialty: 'Pédiatrie', 
      specialtyId: 'pediatrics',
      duration: '12 min',
      type: 'Consultation',
      difficulty: 'Débutant',
      description: 'Enfant de 18 mois avec fièvre élevée depuis 48h, parents inquiets',
      objectives: ['Anamnèse pédiatrique', 'Examen systématique', 'Relation parents-enfant', 'Éducation thérapeutique'],
      competencies: ['IC-144', 'IC-203', 'IC-367'],
      popularity: 92,
      averageScore: 84,
      estimatedTime: 10,
      tags: ['Fièvre pédiatrique', 'Convulsions', 'Déshydratation'],
      patientProfile: {
        age: 1.5,
        gender: 'M',
        context: 'Cabinet de pédiatrie',
        complexity: 'Faible'
      }
    },
    { 
      id: '156', 
      title: 'Céphalées récurrentes de l\'adulte jeune', 
      specialty: 'Neurologie', 
      specialtyId: 'neurology',
      duration: '20 min',
      type: 'Consultation spécialisée',
      difficulty: 'Intermédiaire',
      description: 'Femme de 28 ans consultant pour maux de tête récidivants avec photophobie',
      objectives: ['Interrogatoire neurologique', 'Examen neurologique', 'Diagnostic différentiel', 'Prescription ciblée'],
      competencies: ['IC-262', 'IC-98', 'IC-189'],
      popularity: 86,
      averageScore: 76,
      estimatedTime: 18,
      tags: ['Migraine', 'Hypertension intracrânienne', 'Imagerie cérébrale'],
      patientProfile: {
        age: 28,
        gender: 'F',
        context: 'Consultation neurologique',
        complexity: 'Modérée'
      }
    },
    { 
      id: '203', 
      title: 'Troubles anxieux et dépressifs', 
      specialty: 'Psychiatrie', 
      specialtyId: 'psychiatry',
      duration: '25 min',
      type: 'Entretien psychiatrique',
      difficulty: 'Avancé',
      description: 'Jeune adulte de 24 ans avec symptômes anxio-dépressifs et idées suicidaires',
      objectives: ['Évaluation psychiatrique', 'Évaluation du risque suicidaire', 'Alliance thérapeutique', 'Orientation'],
      competencies: ['IC-347', 'IC-62', 'IC-337'],
      popularity: 79,
      averageScore: 69,
      estimatedTime: 23,
      tags: ['Risque suicidaire', 'Anxiété généralisée', 'Thérapie cognitive'],
      patientProfile: {
        age: 24,
        gender: 'M',
        context: 'Consultation psychiatrique',
        complexity: 'Très élevée'
      }
    },
    { 
      id: '287', 
      title: 'Suivi de grossesse pathologique', 
      specialty: 'Gynécologie-Obstétrique', 
      specialtyId: 'gynecology',
      duration: '15 min',
      type: 'Suivi spécialisé',
      difficulty: 'Intermédiaire',
      description: 'Femme enceinte de 32 SA avec diabète gestationnel et HTA gravidique',
      objectives: ['Surveillance materno-fœtale', 'Gestion du diabète', 'Surveillance tensionnelle', 'Préparation accouchement'],
      competencies: ['IC-17', 'IC-23', 'IC-246'],
      popularity: 82,
      averageScore: 81,
      estimatedTime: 14,
      tags: ['Diabète gestationnel', 'Pré-éclampsie', 'Monitoring fœtal'],
      patientProfile: {
        age: 29,
        gender: 'F',
        context: 'Consultation obstétricale',
        complexity: 'Modérée'
      }
    },
  ];

  const filteredScenarios = ecosScenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = selectedSpecialty === 'all' || scenario.specialtyId === selectedSpecialty;
    const matchesDifficulty = selectedDifficulty === 'all' || scenario.difficulty.toLowerCase() === selectedDifficulty;
    
    return matchesSearch && matchesSpecialty && matchesDifficulty;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Urgence': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'Consultation': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'Consultation spécialisée': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'Suivi spécialisé': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Entretien psychiatrique': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'text-green-400 bg-green-400/10';
      case 'Intermédiaire': return 'text-yellow-400 bg-yellow-400/10';
      case 'Avancé': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return '⭐';
      case 'Intermédiaire': return '⭐⭐';
      case 'Avancé': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  useEffect(() => {
    // Simulation du chargement des données utilisateur
    const timer = setTimeout(() => {
      setCompletedScenarios(['003', '087', '156']);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ConsistentBackground variant="primary">
      <PageHeader
        title="Simulations ECOS Immersives"
        subtitle="Maîtrisez les situations de départ avec des patients virtuels ultra-réalistes"
        icon={Stethoscope}
        showBackButton
        backTo="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        {/* Statistiques utilisateur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <MagneticHover>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-purple-400/50 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white">{userStats.completedScenarios}</div>
                <div className="text-xs text-gray-300">Scénarios réussis</div>
              </CardContent>
            </Card>
          </MagneticHover>
          
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-green-400/50 transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold text-white">{userStats.averageScore}%</div>
              <div className="text-xs text-gray-300">Score moyen</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-400/50 transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <Timer className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold text-white">{userStats.totalTime}min</div>
              <div className="text-xs text-gray-300">Temps total</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-orange-400/50 transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">{userStats.rank}</div>
              <div className="text-xs text-gray-300">Niveau actuel</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-pink-400/50 transition-all duration-300 group">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-pink-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold text-white">{userStats.streak}</div>
              <div className="text-xs text-gray-300">Jours consécutifs</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contrôles et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Barre de recherche */}
            <ContextualHelp page="ecos" element="search">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Rechercher par spécialité, pathologie, compétence... (Appuyez sur /)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400/50 h-12 rounded-xl transition-all duration-200"
                />
              </div>
            </ContextualHelp>
            
            {/* Filtres */}
            <div className="flex gap-3">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white h-12 rounded-xl">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                  {specialties.map(specialty => (
                    <SelectItem key={specialty.id} value={specialty.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <specialty.icon className={`h-4 w-4 ${specialty.color}`} />
                        {specialty.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white h-12 rounded-xl">
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                  <SelectItem value="all" className="text-white hover:bg-white/10">Toutes</SelectItem>
                  <SelectItem value="débutant" className="text-white hover:bg-white/10">⭐ Débutant</SelectItem>
                  <SelectItem value="intermédiaire" className="text-white hover:bg-white/10">⭐⭐ Intermédiaire</SelectItem>
                  <SelectItem value="avancé" className="text-white hover:bg-white/10">⭐⭐⭐ Avancé</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle de vue */}
              <div className="flex border border-white/20 rounded-xl bg-white/10 overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-12 px-4 rounded-none ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-12 px-4 rounded-none ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Onglets de navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-black/40 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="scenarios">🎯 Scénarios ({filteredScenarios.length})</TabsTrigger>
              <TabsTrigger value="progress">📊 Progression</TabsTrigger>
              <TabsTrigger value="leaderboard">🏆 Classement</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Contenu des onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="scenarios">
            {/* Grille des scénarios */}
            <AnimatePresence>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredScenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/ecos/sd-${scenario.id.toLowerCase()}-${scenario.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                      className="group block h-full"
                    >
                      <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl group h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-2xl transition-shadow">
                                SD{scenario.id}
                              </div>
                              <div>
                                <Badge className={getTypeColor(scenario.type) + ' mb-1'}>
                                  {scenario.type}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                                    {getDifficultyIcon(scenario.difficulty)} {scenario.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {completedScenarios.includes(scenario.id) && (
                              <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-xs font-medium">Complété</span>
                              </div>
                            )}
                          </div>
                          
                          <CardTitle className="text-white group-hover:text-purple-300 transition-colors text-lg mb-2">
                            {scenario.title}
                          </CardTitle>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-red-400" />
                              {scenario.specialty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-blue-400" />
                              {scenario.duration}
                            </span>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {scenario.description}
                          </p>
                          
                          {/* Profil patient */}
                          <div className="bg-black/20 rounded-lg p-3 mb-4 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <UserCheck className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-white">Profil patient</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-gray-300">Âge: {scenario.patientProfile.age} ans</div>
                              <div className="text-gray-300">Sexe: {scenario.patientProfile.gender}</div>
                              <div className="text-gray-300 col-span-2">Contexte: {scenario.patientProfile.context}</div>
                            </div>
                          </div>
                          
                          {/* Objectifs */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-purple-400" />
                              <span className="text-sm font-medium text-white">Objectifs principaux</span>
                            </div>
                            <div className="space-y-1">
                              {scenario.objectives.slice(0, 3).map((objective, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                  {objective}
                                </div>
                              ))}
                              {scenario.objectives.length > 3 && (
                                <div className="text-xs text-gray-400">+{scenario.objectives.length - 3} autres...</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {scenario.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} className="bg-white/10 text-gray-300 text-xs border-white/20">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Statistiques */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3 text-gray-400">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {scenario.popularity}% popularité
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {scenario.averageScore}% réussite
                              </span>
                            </div>
                            <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                              <Play className="h-3 w-3" />
                              <span>Démarrer</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="progress">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Progression par spécialité */}
              <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Progression par spécialité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {specialties.slice(1).map(specialty => (
                      <div key={specialty.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <specialty.icon className={`h-4 w-4 ${specialty.color}`} />
                            <span className="text-white text-sm">{specialty.name}</span>
                          </div>
                          <span className="text-gray-300 text-sm">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Top 10 des étudiants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 
                              i === 1 ? 'bg-gray-300 text-gray-700' : 
                              i === 2 ? 'bg-orange-400 text-orange-900' : 'bg-white/20 text-white'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">Étudiant {i + 1}</div>
                            <div className="text-gray-400 text-sm">{Math.floor(Math.random() * 20) + 5} scénarios complétés</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{100 - i * 2}%</div>
                          <div className="text-gray-400 text-sm">Score moyen</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* État vide */}
        {filteredScenarios.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun scénario trouvé</h3>
            <p className="text-gray-400 mb-6">Essayez de modifier vos filtres de recherche</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('all');
                setSelectedDifficulty('all');
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            >
              Réinitialiser les filtres
            </Button>
          </motion.div>
        )}
      </div>
    </ConsistentBackground>
  );
};

export default EcosIndex;