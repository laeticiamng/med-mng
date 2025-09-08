import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  Music, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Heart,
  Play,
  Plus,
  Users,
  Star,
  Calendar,
  Target,
  Award,
  Headphones,
  Library,
  Mic
} from "lucide-react";

const Dashboard = () => {
  const [user] = useState({
    name: "Dr. Marie Dubois",
    email: "marie.dubois@med.fr",
    subscription: "Premium",
    joinDate: "2024-01-15",
    avatar: "/api/placeholder/60/60"
  });

  const [stats] = useState({
    songsGenerated: 24,
    hoursListened: 156,
    itemsStudied: 89,
    favoriteGenre: "Rap médical",
    streak: 15,
    totalPlaylists: 8,
    sharedSongs: 12,
    averageRating: 4.7
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: "song_generated",
      title: "Insuffisance cardiaque - Version rap",
      category: "Cardiologie", 
      timestamp: "Il y a 2 heures",
      duration: "3:24"
    },
    {
      id: 2,
      type: "playlist_created",
      title: "Révisions Neurologie",
      category: "Neurologie",
      timestamp: "Hier",
      songCount: 6
    },
    {
      id: 3,
      type: "song_liked",
      title: "Diabète type 2 - Mélodie pop",
      category: "Endocrinologie",
      timestamp: "Il y a 2 jours",
      duration: "2:56"
    }
  ]);

  const [recommendations] = useState([
    {
      id: 1,
      title: "AVC ischémique - Protocole d'urgence",
      category: "Neurologie",
      difficulty: "Avancé",
      duration: "4:12",
      rating: 4.8,
      thumbnail: "/api/placeholder/120/80"
    },
    {
      id: 2,
      title: "Pneumonie communautaire - Diagnostic",
      category: "Pneumologie", 
      difficulty: "Intermédiaire",
      duration: "3:45",
      rating: 4.6,
      thumbnail: "/api/placeholder/120/80"
    },
    {
      id: 3,
      title: "Hypertension artérielle - Traitement",
      category: "Cardiologie",
      difficulty: "Facile",
      duration: "2:38",
      rating: 4.9,
      thumbnail: "/api/placeholder/120/80"
    }
  ]);

  const [upcomingGoals] = useState([
    {
      id: 1,
      title: "Compléter 50 items EDN",
      progress: 89,
      target: 50,
      current: 45,
      deadline: "Fin du mois"
    },
    {
      id: 2,
      title: "Écouter 200h de contenu",
      progress: 78,
      target: 200,
      current: 156,
      deadline: "Fin du trimestre"
    },
    {
      id: 3,
      title: "Créer 30 chansons",
      progress: 80,
      target: 30,
      current: 24,
      deadline: "Fin du mois"
    }
  ]);

  return (
    <>
      <Helmet>
        <title>Tableau de bord - MED-MNG | Votre progression musicale médicale</title>
        <meta name="description" content="Suivez votre progression d'apprentissage médical avec MED-MNG. Statistiques, recommandations et contenus personnalisés." />
      </Helmet>

      <main className="min-h-screen py-8">
        <div className="medical-container">
          {/* En-tête personnalisé */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Bonjour, {user.name.split(' ')[1]} ! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                  Prêt à continuer votre apprentissage musical ? Voici votre progression du jour.
                </p>
              </div>
              <Badge variant="secondary" className="hidden md:flex">
                <Star className="w-4 h-4 mr-2" />
                {user.subscription}
              </Badge>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="medical-card-premium text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stats.songsGenerated}</div>
                <div className="text-sm text-muted-foreground">Chansons créées</div>
              </CardContent>
            </Card>

            <Card className="medical-card-premium text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Headphones className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-accent mb-1">{stats.hoursListened}h</div>
                <div className="text-sm text-muted-foreground">Temps d'écoute</div>
              </CardContent>
            </Card>

            <Card className="medical-card-premium text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-success" />
                </div>
                <div className="text-2xl font-bold text-success mb-1">{stats.itemsStudied}</div>
                <div className="text-sm text-muted-foreground">Items étudiés</div>
              </CardContent>
            </Card>

            <Card className="medical-card-premium text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-warning" />
                </div>
                <div className="text-2xl font-bold text-warning mb-1">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">Jours consécutifs</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Actions rapides */}
              <Card className="medical-card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Actions rapides</span>
                  </CardTitle>
                  <CardDescription>
                    Créez et explorez votre contenu médical musical
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button asChild className="medical-btn-primary h-20 flex-col">
                      <Link to="/med-mng/create">
                        <Mic className="w-8 h-8 mb-2" />
                        <span>Créer une chanson</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col">
                      <Link to="/med-mng/library">
                        <Library className="w-8 h-8 mb-2" />
                        <span>Ma bibliothèque</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs de progression */}
              <Card className="medical-card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Objectifs en cours</span>
                  </CardTitle>
                  <CardDescription>
                    Suivez votre progression vers vos objectifs d'apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {upcomingGoals.map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{goal.title}</span>
                          <Badge variant="outline">{goal.deadline}</Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Progress value={goal.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-20">
                            {goal.current}/{goal.target}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations personnalisées */}
              <Card className="medical-card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Recommandé pour vous</span>
                  </CardTitle>
                  <CardDescription>
                    Contenu sélectionné selon vos préférences d'apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="w-16 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            <Badge variant="outline" className="text-xs">{item.difficulty}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.duration}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{item.rating}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Profil utilisateur */}
              <Card className="medical-card-premium">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                  <Badge variant="secondary" className="mb-4">
                    <Award className="w-3 h-3 mr-1" />
                    {user.subscription}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Membre depuis {new Date(user.joinDate).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Activité récente */}
              <Card className="medical-card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Activité récente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          {activity.type === "song_generated" && <Music className="w-4 h-4 text-primary" />}
                          {activity.type === "playlist_created" && <Library className="w-4 h-4 text-accent" />}
                          {activity.type === "song_liked" && <Heart className="w-4 h-4 text-success" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{activity.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                            {activity.duration && (
                              <span className="text-xs text-muted-foreground">{activity.duration}</span>
                            )}
                            {activity.songCount && (
                              <span className="text-xs text-muted-foreground">{activity.songCount} chansons</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques détaillées */}
              <Card className="medical-card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Vos statistiques</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Playlists créées</span>
                      <span className="font-medium">{stats.totalPlaylists}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Chansons partagées</span>
                      <span className="font-medium">{stats.sharedSongs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Note moyenne</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{stats.averageRating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Genre préféré</span>
                      <Badge variant="secondary" className="text-xs">{stats.favoriteGenre}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;