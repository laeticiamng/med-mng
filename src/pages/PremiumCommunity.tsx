import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, MessageSquare, Heart, Share2, BookOpen, Music, Award,
  Search, Filter, TrendingUp, Clock, Eye, ThumbsUp, Star,
  Plus, Send, Image, Link, Smile, Zap, Target, Globe, Calendar
} from 'lucide-react';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    level: number;
  };
  content: string;
  type: 'discussion' | 'resource' | 'achievement' | 'question';
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  isLiked?: boolean;
  attachments?: {
    type: 'image' | 'audio' | 'document';
    url: string;
    title: string;
  }[];
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: number;
  category: string;
  isJoined: boolean;
  avatar: string;
  activity: 'high' | 'medium' | 'low';
}

export default function PremiumCommunity() {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const communityStats = {
    totalMembers: 3241,
    activeToday: 892,
    postsThisWeek: 1247,
    helpfulAnswers: 5628
  };

  const posts: CommunityPost[] = [
    {
      id: '1',
      author: {
        name: 'Sarah M.',
        avatar: '/avatars/sarah.jpg',
        role: 'Externe',
        level: 3
      },
      content: 'Salut tout le monde ! J\'ai enfin réussi à mémoriser la classification NYHA grâce aux chansons MED-MNG ! 🎵 Quelqu\'un d\'autre a testé cette méthode ? Les résultats sont bluffants !',
      type: 'achievement',
      timestamp: 'Il y a 2h',
      likes: 24,
      comments: 8,
      tags: ['cardiologie', 'mémorisation'],
      isLiked: false,
      attachments: [
        {
          type: 'audio',
          url: '/audio/nyha-song.mp3',
          title: 'Ma chanson NYHA personnalisée'
        }
      ]
    },
    {
      id: '2',
      author: {
        name: 'Dr. Martin L.',
        avatar: '/avatars/martin.jpg',
        role: 'Cardiologue',
        level: 5
      },
      content: 'Excellente ressource partagée ! Pour ceux qui préparent l\'ECN, voici mon guide personnel sur l\'insuffisance cardiaque. N\'hésitez pas à poser vos questions.',
      type: 'resource',
      timestamp: 'Il y a 4h',
      likes: 89,
      comments: 23,
      tags: ['ecn', 'cardiologie', 'ressources'],
      isLiked: true,
      attachments: [
        {
          type: 'document',
          url: '/docs/insuffisance-cardiaque.pdf',
          title: 'Guide Insuffisance Cardiaque - ECN 2024'
        }
      ]
    },
    {
      id: '3',
      author: {
        name: 'Emma R.',
        avatar: '/avatars/emma.jpg',
        role: 'P1',
        level: 2
      },
      content: 'Question urgente ! Quelqu\'un peut m\'expliquer la différence entre souffle systolique et diastolique ? J\'ai un exam demain et je confonds toujours... 😅',
      type: 'question',
      timestamp: 'Il y a 6h',
      likes: 12,
      comments: 15,
      tags: ['cardiologie', 'aide', 'examen'],
      isLiked: false
    }
  ];

  const groups: CommunityGroup[] = [
    {
      id: '1',
      name: 'Cardiologie Masters',
      description: 'Groupe dédié à l\'excellence en cardiologie',
      members: 847,
      posts: 2341,
      category: 'Spécialité',
      isJoined: true,
      avatar: '/groups/cardio.jpg',
      activity: 'high'
    },
    {
      id: '2',
      name: 'Créateurs Musicaux',
      description: 'Partagez vos créations musicales pédagogiques',
      members: 623,
      posts: 1567,
      category: 'Créatif',
      isJoined: true,
      avatar: '/groups/music.jpg',
      activity: 'high'
    },
    {
      id: '3',
      name: 'ECN 2024 Prep',
      description: 'Préparation collective pour l\'ECN 2024',
      members: 1203,
      posts: 3421,
      category: 'Préparation',
      isJoined: false,
      avatar: '/groups/ecn.jpg',
      activity: 'high'
    },
    {
      id: '4',
      name: 'Neurologie Avancée',
      description: 'Discussions approfondies en neurologie',
      members: 456,
      posts: 987,
      category: 'Spécialité',
      isJoined: false,
      avatar: '/groups/neuro.jpg',
      activity: 'medium'
    }
  ];

  const topContributors = [
    { name: 'Dr. Sophie V.', role: 'Cardiologue', contributions: 247, avatar: '/avatars/sophie.jpg' },
    { name: 'Thomas K.', role: 'Interne', contributions: 198, avatar: '/avatars/thomas.jpg' },
    { name: 'Dr. Alex M.', role: 'Neurologue', contributions: 176, avatar: '/avatars/alex.jpg' },
    { name: 'Julie P.', role: 'Externe', contributions: 134, avatar: '/avatars/julie.jpg' }
  ];

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Communauté MED-MNG
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rejoignez une communauté de {communityStats.totalMembers.toLocaleString()} professionnels et étudiants en médecine. 
            Partagez, apprenez et grandissez ensemble.
          </p>
          
          {/* Community Stats */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold">{communityStats.totalMembers.toLocaleString()} membres</span>
            </div>
            <div className="flex items-center gap-2 bg-success/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-semibold">{communityStats.activeToday} actifs aujourd'hui</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <MessageSquare className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold">{communityStats.postsThisWeek} posts cette semaine</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Quick Actions */}
            <PremiumCard variant="elevated" className="p-6">
              <h3 className="font-bold text-foreground mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <PremiumButton
                  variant="primary"
                  size="sm"
                  className="w-full justify-start"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Nouveau Post
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  icon={<Users className="w-4 h-4" />}
                >
                  Rejoindre Groupe
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Messages Privés
                </PremiumButton>
              </div>
            </PremiumCard>

            {/* Top Contributors */}
            <PremiumCard variant="glass" className="p-6">
              <h3 className="font-bold text-foreground mb-4">Top Contributeurs</h3>
              <div className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.name} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={contributor.avatar} />
                        <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                          <Star className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.role}</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary text-xs">
                      {contributor.contributions}
                    </Badge>
                  </div>
                ))}
              </div>
            </PremiumCard>

            {/* Trending Tags */}
            <PremiumCard variant="glow" colorScheme="accent" className="p-6">
              <h3 className="font-bold text-foreground mb-4">Trending</h3>
              <div className="flex flex-wrap gap-2">
                {['cardiologie', 'ecn2024', 'mémorisation', 'neurologie', 'quiz'].map(tag => (
                  <Badge key={tag} className="bg-accent/20 text-accent hover:bg-accent/30 cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </PremiumCard>
          </motion.div>

          {/* Main Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <TabsList className="grid w-full sm:w-auto grid-cols-4 bg-muted/50">
                  <TabsTrigger value="feed">Feed</TabsTrigger>
                  <TabsTrigger value="groups">Groupes</TabsTrigger>
                  <TabsTrigger value="resources">Ressources</TabsTrigger>
                  <TabsTrigger value="events">Événements</TabsTrigger>
                </TabsList>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <PremiumButton variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
                    Filtres
                  </PremiumButton>
                </div>
              </div>

              <TabsContent value="feed" className="space-y-6">
                {/* New Post */}
                <PremiumCard variant="elevated" className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <Textarea
                        placeholder="Partagez vos connaissances, posez vos questions..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <PremiumButton variant="ghost" size="sm" icon={<Image className="w-4 h-4" />}>
                            Image
                          </PremiumButton>
                          <PremiumButton variant="ghost" size="sm" icon={<Music className="w-4 h-4" />}>
                            Audio
                          </PremiumButton>
                          <PremiumButton variant="ghost" size="sm" icon={<Link className="w-4 h-4" />}>
                            Lien
                          </PremiumButton>
                        </div>
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          icon={<Send className="w-4 h-4" />}
                          disabled={!newPost.trim()}
                        >
                          Publier
                        </PremiumButton>
                      </div>
                    </div>
                  </div>
                </PremiumCard>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PremiumCard variant="glass" className="p-6 hover:shadow-medium transition-all">
                        <div className="space-y-4">
                          {/* Post Header */}
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">{post.author.name}</h4>
                                <Badge className="bg-primary/20 text-primary text-xs">
                                  {post.author.role}
                                </Badge>
                                <Badge className="bg-accent/20 text-accent text-xs">
                                  Niveau {post.author.level}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                            </div>
                            <Badge
                              className={`${
                                post.type === 'achievement' ? 'bg-success/20 text-success' :
                                post.type === 'resource' ? 'bg-info/20 text-info' :
                                post.type === 'question' ? 'bg-warning/20 text-warning' :
                                'bg-muted/20 text-muted-foreground'
                              }`}
                            >
                              {post.type === 'achievement' ? 'Succès' :
                               post.type === 'resource' ? 'Ressource' :
                               post.type === 'question' ? 'Question' : 'Discussion'}
                            </Badge>
                          </div>

                          {/* Post Content */}
                          <div className="space-y-3">
                            <p className="text-foreground leading-relaxed">{post.content}</p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map(tag => (
                                <Badge key={tag} className="bg-muted/20 text-muted-foreground hover:bg-muted/30 cursor-pointer text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>

                            {/* Attachments */}
                            {post.attachments && (
                              <div className="space-y-2">
                                {post.attachments.map((attachment, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                                    {attachment.type === 'audio' && <Music className="w-5 h-5 text-purple-500" />}
                                    {attachment.type === 'document' && <BookOpen className="w-5 h-5 text-blue-500" />}
                                    {attachment.type === 'image' && <Image className="w-5 h-5 text-green-500" />}
                                    <span className="text-sm text-foreground">{attachment.title}</span>
                                    <PremiumButton variant="ghost" size="sm">
                                      Télécharger
                                    </PremiumButton>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Post Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-4">
                              <PremiumButton
                                variant="ghost"
                                size="sm"
                                className={`${post.isLiked ? 'text-red-500' : ''}`}
                                icon={<Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />}
                              >
                                {post.likes}
                              </PremiumButton>
                              <PremiumButton
                                variant="ghost"
                                size="sm"
                                icon={<MessageSquare className="w-4 h-4" />}
                              >
                                {post.comments}
                              </PremiumButton>
                              <PremiumButton
                                variant="ghost"
                                size="sm"
                                icon={<Share2 className="w-4 h-4" />}
                              >
                                Partager
                              </PremiumButton>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              <span>247 vues</span>
                            </div>
                          </div>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="groups" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PremiumCard variant="glass" className="p-6 h-full">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={group.avatar} />
                              <AvatarFallback>{group.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-bold text-foreground">{group.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {group.members.toLocaleString()} membres
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {group.posts.toLocaleString()} posts
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={`${
                                group.activity === 'high' ? 'bg-success/20 text-success' :
                                group.activity === 'medium' ? 'bg-warning/20 text-warning' :
                                'bg-muted/20 text-muted-foreground'
                              }`}
                            >
                              {group.activity === 'high' ? 'Très actif' :
                               group.activity === 'medium' ? 'Actif' : 'Peu actif'}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <PremiumButton
                              variant={group.isJoined ? "outline" : "primary"}
                              size="sm"
                              className="flex-1"
                            >
                              {group.isJoined ? 'Rejoint' : 'Rejoindre'}
                            </PremiumButton>
                            <PremiumButton variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                              Voir
                            </PremiumButton>
                          </div>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <PremiumCard variant="elevated" className="p-8 text-center">
                  <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Centre de Ressources</h3>
                  <p className="text-muted-foreground mb-6">
                    Accédez à une bibliothèque complète de ressources partagées par la communauté
                  </p>
                  <PremiumButton variant="primary" icon={<Search className="w-4 h-4" />}>
                    Explorer les Ressources
                  </PremiumButton>
                </PremiumCard>
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <PremiumCard variant="elevated" className="p-8 text-center">
                  <Calendar className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Événements Communautaires</h3>
                  <p className="text-muted-foreground mb-6">
                    Participez aux webinaires, conférences et sessions d'étude collaborative
                  </p>
                  <PremiumButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                    Voir les Événements
                  </PremiumButton>
                </PremiumCard>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </PremiumLayout>
  );
}