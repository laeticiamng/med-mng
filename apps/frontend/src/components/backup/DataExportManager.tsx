import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  Database, 
  FileText, 
  Music, 
  Users, 
  Calendar,
  Archive,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface ExportTask {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'files' | 'music' | 'users' | 'analytics';
  size: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: string;
  completedAt?: string;
}

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  types: string[];
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  retention: string;
}

export const DataExportManager: React.FC = () => {
  const [exportTasks, setExportTasks] = useState<ExportTask[]>([
    {
      id: '1',
      name: 'Export complet base de données',
      description: 'Export de toutes les données utilisateurs et contenu EDN',
      type: 'database',
      size: '2.4 GB',
      status: 'completed',
      progress: 100,
      completedAt: 'Il y a 2 heures'
    },
    {
      id: '2',
      name: 'Export musiques générées',
      description: 'Archive de toutes les compositions musicales IA',
      type: 'music',
      size: '847 MB',
      status: 'running',
      progress: 67,
      estimatedTime: '8 minutes restantes'
    },
    {
      id: '3',
      name: 'Export données utilisateurs',
      description: 'Profils, progressions et préférences des utilisateurs',
      type: 'users',
      size: '156 MB',
      status: 'pending',
      progress: 0
    }
  ]);

  const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([
    {
      id: '1',
      name: 'Sauvegarde quotidienne BDD',
      frequency: 'daily',
      time: '03:00',
      types: ['database', 'users'],
      enabled: true,
      lastRun: 'Aujourd\'hui à 03:00',
      nextRun: 'Demain à 03:00',
      retention: '30 jours'
    },
    {
      id: '2',
      name: 'Archive hebdomadaire complète',
      frequency: 'weekly',
      time: '02:00',
      types: ['database', 'files', 'music', 'analytics'],
      enabled: true,
      lastRun: 'Dimanche dernier à 02:00',
      nextRun: 'Dimanche prochain à 02:00',
      retention: '12 semaines'
    },
    {
      id: '3',
      name: 'Sauvegarde mensuelle longue durée',
      frequency: 'monthly',
      time: '01:00',
      types: ['database', 'files', 'music', 'users', 'analytics'],
      enabled: true,
      lastRun: 'Le 1er de ce mois à 01:00',
      nextRun: 'Le 1er du mois prochain à 01:00',
      retention: '24 mois'
    }
  ]);

  const [selectedTypes, setSelectedTypes] = useState<string[]>(['database']);

  const exportTypes = [
    { id: 'database', label: 'Base de données', icon: Database, description: 'Toutes les données structurées' },
    { id: 'files', label: 'Fichiers', icon: FileText, description: 'Documents et ressources' },
    { id: 'music', label: 'Musiques', icon: Music, description: 'Compositions générées par IA' },
    { id: 'users', label: 'Utilisateurs', icon: Users, description: 'Profils et progressions' },
    { id: 'analytics', label: 'Analytics', icon: Calendar, description: 'Données de performance' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = exportTypes.find(t => t.id === type);
    return typeConfig ? <typeConfig.icon className="w-4 h-4" /> : <Archive className="w-4 h-4" />;
  };

  const handleExportStart = () => {
    const newTask: ExportTask = {
      id: Date.now().toString(),
      name: `Export personnalisé`,
      description: `Export de: ${selectedTypes.map(type => exportTypes.find(t => t.id === type)?.label).join(', ')}`,
      type: selectedTypes[0] as any,
      size: 'Calcul en cours...',
      status: 'running',
      progress: 0,
      estimatedTime: 'Estimation en cours...'
    };

    setExportTasks(prev => [newTask, ...prev]);

    // Simulation du progrès
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExportTasks(prev => 
          prev.map(task => 
            task.id === newTask.id 
              ? { ...task, status: 'completed', progress: 100, completedAt: 'À l\'instant', size: '1.2 GB' }
              : task
          )
        );
      } else {
        setExportTasks(prev => 
          prev.map(task => 
            task.id === newTask.id 
              ? { ...task, progress, estimatedTime: `${Math.ceil((100 - progress) / 10)} minutes restantes` }
              : task
          )
        );
      }
    }, 2000);
  };

  const toggleSchedule = (scheduleId: string) => {
    setBackupSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Données
          </h1>
          <p className="text-muted-foreground mt-1">
            Export, sauvegarde et archivage des données de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Sécurisé
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export">Export Manuel</TabsTrigger>
          <TabsTrigger value="tasks">Tâches en cours</TabsTrigger>
          <TabsTrigger value="schedule">Planification</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nouvel export de données</CardTitle>
              <CardDescription>
                Sélectionnez les types de données à exporter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exportTypes.map((type) => (
                  <Card 
                    key={type.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTypes.includes(type.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedTypes(prev =>
                        prev.includes(type.id)
                          ? prev.filter(t => t !== type.id)
                          : [...prev, type.id]
                      );
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <type.icon className="w-5 h-5 text-primary" />
                          <div>
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        </div>
                        <Checkbox 
                          checked={selectedTypes.includes(type.id)}
                          onChange={() => {}}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Options d'export</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="compress" defaultChecked />
                    <label htmlFor="compress" className="text-sm">
                      Compresser l'archive (recommandé)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="encrypt" defaultChecked />
                    <label htmlFor="encrypt" className="text-sm">
                      Chiffrer les données sensibles
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="validate" defaultChecked />
                    <label htmlFor="validate" className="text-sm">
                      Valider l'intégrité des données
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {selectedTypes.length} type(s) sélectionné(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Taille estimée: ~{selectedTypes.length * 500} MB
                  </p>
                </div>
                <Button 
                  onClick={handleExportStart}
                  disabled={selectedTypes.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Démarrer l'export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tâches d'export en cours</CardTitle>
              <CardDescription>
                Suivez le progrès de vos exports de données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(task.type)}
                          <div>
                            <h4 className="font-medium">{task.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status === 'completed' ? 'Terminé' :
                             task.status === 'running' ? 'En cours' :
                             task.status === 'failed' ? 'Échec' : 'En attente'}
                          </Badge>
                        </div>
                      </div>

                      {task.status === 'running' && (
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span>{task.progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Taille: {task.size}</span>
                        <span>
                          {task.status === 'completed' && task.completedAt}
                          {task.status === 'running' && task.estimatedTime}
                        </span>
                      </div>

                      {task.status === 'completed' && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="w-3 h-3 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sauvegardes automatiques</CardTitle>
              <CardDescription>
                Configuration des sauvegardes programmées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupSchedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{schedule.name}</h4>
                            <Badge variant="outline" className={
                              schedule.frequency === 'daily' ? 'text-blue-600' :
                              schedule.frequency === 'weekly' ? 'text-green-600' : 'text-purple-600'
                            }>
                              {schedule.frequency === 'daily' ? 'Quotidien' :
                               schedule.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Planifié à {schedule.time} • Rétention: {schedule.retention}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={schedule.enabled}
                            onCheckedChange={() => toggleSchedule(schedule.id)}
                          />
                          <span className="text-sm">Activé</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {schedule.types.map((type) => {
                          const typeConfig = exportTypes.find(t => t.id === type);
                          return (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {typeConfig?.label}
                            </Badge>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Dernière exécution:</span>
                          <p>{schedule.lastRun}</p>
                        </div>
                        <div>
                          <span className="font-medium">Prochaine exécution:</span>
                          <p>{schedule.nextRun}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ajouter une nouvelle planification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Configuration du chiffrement et de la protection des données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Chiffrement</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">AES-256 au repos</p>
                        <p className="text-sm text-muted-foreground">
                          Chiffrement des données stockées
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Activé
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">TLS 1.3 en transit</p>
                        <p className="text-sm text-muted-foreground">
                          Chiffrement des transferts
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Activé
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Accès et audit</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Journalisation des accès</p>
                        <p className="text-sm text-muted-foreground">
                          Logs détaillés des exports
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Activé
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Authentification 2FA</p>
                        <p className="text-sm text-muted-foreground">
                          Requise pour exports critiques
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Activé
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Conformité RGPD</span>
                </div>
                <p className="text-sm text-blue-800">
                  Tous les exports respectent les exigences du RGPD. 
                  Les données personnelles sont automatiquement anonymisées dans les exports partagés.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Certifications de sécurité</span>
                </div>
                <p className="text-sm text-green-800">
                  Notre infrastructure est certifiée ISO 27001 et SOC 2 Type II. 
                  Tous les exports bénéficient de ces standards de sécurité.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};