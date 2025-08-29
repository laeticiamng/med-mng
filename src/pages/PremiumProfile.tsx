import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, Award, BookOpen, Music, Target, Calendar, Settings,
  Edit3, Save, Upload, Share2, Download, Trophy, Star,
  Clock, TrendingUp, Heart, Users, Zap, Shield, Crown
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  unlockedAt: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface StudyStats {
  totalStudyTime: number;
  itemsCompleted: number;
  musicsCreated: number;
  averageScore: number;
  longestStreak: number;
  currentStreak: number;
}

export default function PremiumProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState({
    name: 'Dr. Sarah Martin',
    title: 'Externe en Cardiologie',
    bio: 'Passionnée par la cardiologie et les nouvelles méthodes d\'apprentissage. Créatrice de contenus musicaux pédagogiques.',
    location: 'Paris, France',
    university: 'Université Paris Cité',
    year: '6ème année',
    specialization: 'Cardiologie',
    avatar: '/avatars/profile.jpg'
  });

  const studyStats: StudyStats = {
    totalStudyTime: 247, // hours
    itemsCompleted: 156,
    musicsCreated: 42,
    averageScore: 87.3,
    longestStreak: 23,
    currentStreak: 15
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Expert Cardiologie',
      description: 'Complété tous les items de cardiologie avec >90%',
      icon: Heart,
      color: 'text-red-500',
      unlockedAt: 'Il y a 2 jours',
      category: 'Expertise',
      rarity: 'epic'
    },
    {
      id: '2',
      title: 'Compositeur Médical',
      description: '25 musiques pédagogiques créées',
      icon: Music,
      color: 'text-purple-500',
      unlockedAt: 'Il y a 1 semaine',
      category: 'Créativité',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Série d\'Or',
      description: '20 jours d\'apprentissage consécutifs',
      icon: Trophy,
      color: 'text-yellow-500',
      unlockedAt: 'Il y a 3 jours',
      category: 'Persévérance',
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Mentor Communautaire',
      description: '100 réponses utiles dans la communauté',
      icon: Users,
      color: 'text-blue-500',
      unlockedAt: 'Il y a 5 jours',
      category: 'Communauté',
      rarity: 'rare'
    },
    {
      id: '5',
      title: 'Perfectionniste',
      description: 'Score parfait sur 10 quiz consécutifs',
      icon: Target,
      color: 'text-green-500',
      unlockedAt: 'Il y a 1 mois',
      category: 'Performance',
      rarity: 'legendary'
    },
    {
      id: '6',
      title: 'Pionnier MED-MNG',
      description: 'Parmi les 100 premiers utilisateurs',
      icon: Crown,
      color: 'text-amber-500',
      unlockedAt: 'Il y a 3 mois',
      category: 'Statut',
      rarity: 'legendary'
    }
  ];

  const recentActivity = [
    {
      type: 'completion',
      title: 'Item IC-230 complété',
      description: 'Fibrillation auriculaire - Score: 95%',
      time: 'Il y a 2h',
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      type: 'creation',
      title: 'Musique créée',
      description: 'Chanson sur l\'hypertension artérielle',
      time: 'Il y a 4h',
      icon: Music,
      color: 'text-purple-500'
    },
    {
      type: 'achievement',
      title: 'Badge obtenu',
      description: 'Expert Cardiologie débloqué',
      time: 'Il y a 2 jours',
      icon: Award,
      color: 'text-yellow-500'
    },
    {
      type: 'community',
      title: 'Post communautaire',
      description: 'Partagé une ressource sur les souffles cardiaques',
      time: 'Il y a 3 jours',
      icon: Users,
      color: 'text-green-500'
    }
  ];

  const progressBySpecialty = [
    { name: 'Cardiologie', completed: 35, total: 35, percentage: 100, color: 'bg-red-500' },
    { name: 'Neurologie', completed: 27, total: 30, percentage: 90, color: 'bg-purple-500' },
    { name: 'Pneumologie', completed: 20, total: 25, percentage: 80, color: 'bg-blue-500' },
    { name: 'Gastroentérologie', completed: 22, total: 28, percentage: 79, color: 'bg-green-500' },
    { name: 'Endocrinologie', completed: 14, total: 20, percentage: 70, color: 'bg-yellow-500' },
    { name: 'Rhumatologie', completed: 8, total: 15, percentage: 53, color: 'bg-indigo-500' }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'from-amber-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityLabel = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'Légendaire';
      case 'epic': return 'Épique';
      case 'rare': return 'Rare';
      default: return 'Commun';
    }
  };

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PremiumCard variant="glow" colorScheme="primary" className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-2xl">{profileData.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full shadow-lg">
                  <Crown className="w-4 h-4 text-primary-foreground" />
                </div>
                {!isEditing && (
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          icon={<Upload className="w-4 h-4" />}
                        >
                          Modifier
                        </PremiumButton>
                )}
              </div>

              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="text-2xl font-bold"
                    />
                    <Input
                      value={profileData.title}
                      onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    />
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={3}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {profileData.name}
                      </h1>
                      <p className="text-xl text-muted-foreground mb-3">{profileData.title}</p>
                      <p className="text-muted-foreground leading-relaxed max-w-2xl">
                        {profileData.bio}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary/20 text-primary">
                        📍 {profileData.location}
                      </Badge>
                      <Badge className="bg-accent/20 text-accent">
                        🎓 {profileData.university}
                      </Badge>
                      <Badge className="bg-success/20 text-success">
                        📚 {profileData.year}
                      </Badge>
                      <Badge className="bg-info/20 text-info">
                        ⚕️ {profileData.specialization}
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <PremiumButton
                  variant={isEditing ? "primary" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                  icon={isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                >
                  {isEditing ? 'Sauvegarder' : 'Modifier'}
                </PremiumButton>
                <PremiumButton
                  variant="ghost"
                  size="sm"
                  icon={<Share2 className="w-4 h-4" />}
                >
                  Partager
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <PremiumCard variant="glass" className="p-4 text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{studyStats.totalStudyTime}h</p>
            <p className="text-xs text-muted-foreground">Temps d'étude</p>
          </PremiumCard>
          
          <PremiumCard variant="glass" className="p-4 text-center">
            <BookOpen className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{studyStats.itemsCompleted}</p>
            <p className="text-xs text-muted-foreground">Items complétés</p>
          </PremiumCard>
          
          <PremiumCard variant="glass" className="p-4 text-center">
            <Music className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{studyStats.musicsCreated}</p>
            <p className="text-xs text-muted-foreground">Musiques créées</p>
          </PremiumCard>
          
          <PremiumCard variant="glass" className="p-4 text-center">
            <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{studyStats.averageScore}%</p>
            <p className="text-xs text-muted-foreground">Score moyen</p>
          </PremiumCard>
          
          <PremiumCard variant="glass" className="p-4 text-center">
            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{studyStats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Série actuelle</p>
          </PremiumCard>
          
          <PremiumCard variant="glass" className="p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
            <p className="text-xs text-muted-foreground">Succès</p>
          </PremiumCard>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="achievements">Succès</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <PremiumCard variant="elevated" className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6">Activité Récente</h3>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 4).map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                          <div className="p-2 rounded-lg bg-muted">
                            <IconComponent className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-foreground">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PremiumCard>

                {/* Top Achievements */}
                <PremiumCard variant="glass" className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6">Succès Récents</h3>
                  <div className="space-y-4">
                    {achievements.slice(0, 4).map((achievement) => {
                      const IconComponent = achievement.icon;
                      return (
                        <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-background/50 to-muted/20">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">{achievement.unlockedAt}</p>
                          </div>
                          <Badge className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white text-xs`}>
                            {getRarityLabel(achievement.rarity)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </PremiumCard>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PremiumCard
                        variant="glow"
                        className={`p-6 bg-gradient-to-br ${getRarityColor(achievement.rarity)}/10 border-gradient`}
                      >
                        <div className="text-center space-y-4">
                          <div className={`p-4 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} mx-auto w-fit`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-bold text-foreground">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <Badge className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                              {getRarityLabel(achievement.rarity)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Débloqué {achievement.unlockedAt}</p>
                            <p className="text-xs text-accent">{achievement.category}</p>
                          </div>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <PremiumCard variant="elevated" className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Historique d'Activité</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="p-3 rounded-lg bg-muted">
                          <IconComponent className={`w-5 h-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-foreground">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PremiumCard>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <PremiumCard variant="elevated" className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Progression par Spécialité</h3>
                <div className="space-y-6">
                  {progressBySpecialty.map((specialty, index) => (
                    <motion.div
                      key={specialty.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{specialty.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {specialty.completed}/{specialty.total} items
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={specialty.percentage}
                          className="flex-1 h-3"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {specialty.percentage}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}