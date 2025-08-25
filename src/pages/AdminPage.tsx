import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Settings, 
  Database, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Shield,
  Zap,
  FileText,
  Music
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  systemHealth: number;
  dbSize: string;
  lastBackup: Date;
}

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  createdAt: Date;
}

interface ContentItem {
  id: string;
  type: 'edn' | 'music' | 'ecos';
  title: string;
  author: string;
  status: 'published' | 'draft' | 'review';
  views: number;
  createdAt: Date;
}

export function AdminPage() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 245,
    activeUsers: 89,
    totalContent: 156,
    systemHealth: 98,
    dbSize: '2.4 GB',
    lastBackup: new Date()
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@medmng.fr',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(2024, 0, 15)
    },
    {
      id: '2',
      email: 'user1@student.fr',
      role: 'user',
      status: 'active',
      lastLogin: new Date(Date.now() - 86400000),
      createdAt: new Date(2024, 1, 20)
    },
    {
      id: '3',
      email: 'moderator@medmng.fr',
      role: 'moderator',
      status: 'active',
      lastLogin: new Date(Date.now() - 3600000),
      createdAt: new Date(2024, 0, 10)
    }
  ]);

  const [content, setContent] = useState<ContentItem[]>([
    {
      id: '1',
      type: 'edn',
      title: 'IC-1 - La relation médecin-malade',
      author: 'Dr. Martin',
      status: 'published',
      views: 1245,
      createdAt: new Date(2024, 0, 15)
    },
    {
      id: '2',
      type: 'music',
      title: 'Chanson cardiologie - Rang A',
      author: 'IA Generator',
      status: 'published',
      views: 892,
      createdAt: new Date(2024, 1, 10)
    },
    {
      id: '3',
      type: 'ecos',
      title: 'Simulation urgence pédiatrique',
      author: 'Dr. Dubois',
      status: 'review',
      views: 234,
      createdAt: new Date(2024, 1, 20)
    }
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-yellow-500';
      case 'user': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'suspended': return 'text-red-600';
      case 'published': return 'text-green-600';
      case 'draft': return 'text-gray-600';
      case 'review': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const updateUserRole = (userId: string, newRole: 'admin' | 'user' | 'moderator') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast({
      title: "Rôle mis à jour",
      description: `Le rôle de l'utilisateur a été modifié avec succès`
    });
  };

  const updateUserStatus = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast({
      title: "Statut mis à jour",
      description: `Le statut de l'utilisateur a été modifié avec succès`
    });
  };

  const approveContent = (contentId: string) => {
    setContent(content.map(item =>
      item.id === contentId ? { ...item, status: 'published' as const } : item
    ));
    toast({
      title: "Contenu approuvé",
      description: "Le contenu a été publié avec succès"
    });
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Administration
        </h1>
        <p className="text-lg text-muted-foreground">
          Gestion et supervision de la plateforme MED-MNG
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs totaux</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+12 ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-green-600">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}% actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Contenus totaux</p>
                <p className="text-2xl font-bold">{stats.totalContent}</p>
                <p className="text-xs text-blue-600">+8 cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Santé système</p>
                <p className="text-2xl font-bold">{stats.systemHealth}%</p>
                <Progress value={stats.systemHealth} className="w-full h-2 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>État du système</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">API Supabase</p>
                <p className="text-sm text-green-600">Opérationnel</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Base de données</p>
                <p className="text-sm text-muted-foreground">{stats.dbSize}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Dernière sauvegarde</p>
                <p className="text-sm text-muted-foreground">
                  {stats.lastBackup.toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getRoleColor(user.role)}`}></div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          <span className={getStatusColor(user.status)}>{user.status}</span>
                          <span>Dernière connexion: {user.lastLogin.toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={user.role} onValueChange={(value: 'admin' | 'user' | 'moderator') => updateUserRole(user.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="moderator">Modérateur</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={user.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => updateUserStatus(user.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="suspended">Suspendu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion du contenu</CardTitle>
                <Input
                  placeholder="Rechercher du contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {item.type === 'edn' && <FileText className="h-5 w-5 text-blue-600" />}
                        {item.type === 'music' && <Music className="h-5 w-5 text-purple-600" />}
                        {item.type === 'ecos' && <Activity className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{item.type.toUpperCase()}</Badge>
                          <span className={getStatusColor(item.status)}>{item.status}</span>
                          <span>Par {item.author}</span>
                          <span>{item.views} vues</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'review' && (
                        <Button onClick={() => approveContent(item.id)} size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Éditer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Utilisation par type de contenu</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Items EDN</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={65} className="w-24" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Génération musicale</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-24" />
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Simulations ECOS</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="w-24" />
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Nouveau contenu EDN validé</span>
                    <span className="text-muted-foreground">Il y a 2h</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>5 nouveaux utilisateurs</span>
                    <span className="text-muted-foreground">Aujourd'hui</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Music className="h-4 w-4 text-purple-600" />
                    <span>127 musiques générées</span>
                    <span className="text-muted-foreground">Cette semaine</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Maintenance programmée</span>
                    <span className="text-muted-foregroung">Demain 3h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nom de la plateforme</label>
                  <Input defaultValue="MED-MNG" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email de contact</label>
                  <Input defaultValue="contact@medmng.fr" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Durée maximum de session (minutes)</label>
                  <Input type="number" defaultValue="60" />
                </div>
                <Button>Enregistrer</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Authentification à deux facteurs</span>
                  <Badge variant="outline" className="text-green-600">Activé</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chiffrement des données</span>
                  <Badge variant="outline" className="text-green-600">Activé</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sauvegarde automatique</span>
                  <Badge variant="outline" className="text-green-600">Quotidienne</Badge>
                </div>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}