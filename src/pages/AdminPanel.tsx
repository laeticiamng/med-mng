import React, { useState } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Ban,
  UserCheck,
  Mail,
  Server,
  Lock
} from 'lucide-react';

const systemStatus = {
  api: { status: 'healthy', uptime: '99.98%' },
  database: { status: 'healthy', uptime: '99.95%' },
  storage: { status: 'warning', uptime: '99.2%' },
  auth: { status: 'healthy', uptime: '100%' }
};

const users = [
  {
    id: 1,
    name: 'Dr. Marie Dubois',
    email: 'marie.dubois@hospital.fr',
    role: 'Professeur',
    status: 'active',
    lastLogin: '2024-01-15 14:30',
    subscription: 'Premium'
  },
  {
    id: 2,
    name: 'Jean Martin',
    email: 'jean.martin@etudiant.univ.fr',
    role: 'Étudiant',
    status: 'active',
    lastLogin: '2024-01-15 12:15',
    subscription: 'Gratuit'
  },
  {
    id: 3,
    name: 'Sophie Laurent',
    email: 'sophie.laurent@med.univ.fr',
    role: 'Interne',
    status: 'suspended',
    lastLogin: '2024-01-10 09:45',
    subscription: 'Pro'
  }
];

const systemSettings = [
  {
    category: 'Sécurité',
    settings: [
      { key: 'twoFactorRequired', label: 'Authentification à deux facteurs obligatoire', value: true },
      { key: 'sessionTimeout', label: 'Délai d\'expiration de session (heures)', value: '24' },
      { key: 'maxLoginAttempts', label: 'Tentatives de connexion max', value: '3' }
    ]
  },
  {
    category: 'Fonctionnalités',
    settings: [
      { key: 'registrationOpen', label: 'Inscriptions ouvertes', value: true },
      { key: 'maintenanceMode', label: 'Mode maintenance', value: false },
      { key: 'analyticsEnabled', label: 'Analytics activées', value: true }
    ]
  }
];

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'suspended': return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Panneau d'Administration
          </h1>
          <p className="text-white/80 text-lg">
            Gestion avancée de la plateforme MED-MNG
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Filtres utilisateurs */}
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="Étudiant">Étudiants</option>
                    <option value="Interne">Internes</option>
                    <option value="Professeur">Professeurs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{user.email}</span>
                          <span>•</span>
                          <span>{user.role}</span>
                          <span>•</span>
                          <span>Dernière connexion: {user.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{user.subscription}</Badge>
                      {getUserStatusBadge(user.status)}
                      <div className="flex space-x-2">
                        <PremiumButton size="sm" variant="outline">
                          <UserCheck className="w-4 h-4" />
                        </PremiumButton>
                        <PremiumButton size="sm" variant="outline">
                          <Mail className="w-4 h-4" />
                        </PremiumButton>
                        <PremiumButton size="sm" variant="outline">
                          <Ban className="w-4 h-4" />
                        </PremiumButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* État du système */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(systemStatus).map(([service, data]) => (
                <PremiumCard key={service} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium capitalize">{service}</h3>
                    <div className={`p-2 rounded-lg ${getStatusColor(data.status)}`}>
                      {getStatusIcon(data.status)}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-2">{data.uptime}</div>
                  <p className="text-sm text-muted-foreground">Disponibilité</p>
                </PremiumCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Métriques système
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RAM Usage</span>
                    <span className="font-medium">4.2GB / 8GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stockage</span>
                    <span className="font-medium">2.8TB / 5TB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requêtes/min</span>
                    <span className="font-medium">8,432</span>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6">Logs récents</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                    <span className="font-medium text-green-800">INFO:</span> Backup complété avec succès
                    <div className="text-green-600 text-xs mt-1">Il y a 2 heures</div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <span className="font-medium text-yellow-800">WARNING:</span> CPU usage élevé détecté
                    <div className="text-yellow-600 text-xs mt-1">Il y a 4 heures</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <span className="font-medium text-blue-800">INFO:</span> Nouvel utilisateur inscrit
                    <div className="text-blue-600 text-xs mt-1">Il y a 6 heures</div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-8">
              {systemSettings.map((category) => (
                <PremiumCard key={category.category} className="p-6">
                  <h2 className="text-xl font-semibold mb-6">{category.category}</h2>
                  <div className="space-y-6">
                    {category.settings.map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={setting.key} className="font-medium">
                            {setting.label}
                          </Label>
                        </div>
                        <div>
                          {typeof setting.value === 'boolean' ? (
                            <Switch
                              id={setting.key}
                              checked={setting.value}
                            />
                          ) : (
                            <Input
                              id={setting.key}
                              value={setting.value}
                              className="w-20 text-right"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Tentatives de connexion suspectes
                </h2>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">192.168.1.100</span>
                      <Badge variant="destructive">Bloqué</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      15 tentatives échouées en 5 minutes
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">10.0.0.45</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Surveillé</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connexions multiples simultanées
                    </p>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard className="p-6">
                <h2 className="text-xl font-semibold mb-6">Actions de sécurité</h2>
                <div className="space-y-4">
                  <PremiumButton className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Scan de sécurité complet
                  </PremiumButton>
                  
                  <PremiumButton variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Audit des permissions
                  </PremiumButton>
                  
                  <PremiumButton variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Rapport d'activité
                  </PremiumButton>
                </div>
              </PremiumCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default AdminPanel;