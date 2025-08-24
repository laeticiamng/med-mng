import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell,
  Settings,
  Filter,
  Search,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  Star,
  Calendar,
  Music,
  BookOpen,
  Trophy,
  Users,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  MoreVertical,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'achievement' | 'study' | 'music' | 'social' | 'system' | 'reminder';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'Nouveau badge débloqué !',
      description: 'Félicitations ! Vous avez obtenu le badge "Expert Cardiologie" après avoir maîtrisé 50 items.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      isRead: false,
      isImportant: true,
      actionUrl: '/profile?tab=achievements'
    },
    {
      id: '2',
      type: 'study',
      title: 'Rappel d\'étude',
      description: 'Il est temps de réviser l\'item IC-225 - Insuffisance cardiaque. Votre dernière révision date de 3 jours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      isRead: false,
      isImportant: false,
      actionUrl: '/edn/ic-225'
    },
    {
      id: '3',
      type: 'music',
      title: 'Nouvelle musique générée',
      description: 'Votre chanson "Arythmie Électro Beat" a été créée avec succès et est prête à écouter !',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
      isRead: true,
      isImportant: false,
      actionUrl: '/med-mng/player/2'
    },
    {
      id: '4',
      type: 'social',
      title: 'Nouveau follower',
      description: 'Dr. Martin Dupont a commencé à suivre vos progrès. Vous avez maintenant 24 followers !',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6h ago
      isRead: true,
      isImportant: false,
      actionUrl: '/profile?tab=social'
    },
    {
      id: '5',
      type: 'system',
      title: 'Nouvelle fonctionnalité disponible',
      description: 'Découvrez le nouveau système de gamification avec des défis quotidiens et des récompenses !',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12h ago
      isRead: false,
      isImportant: true,
      actionUrl: '/dashboard?tab=gamification'
    },
    {
      id: '6',
      type: 'reminder',
      title: 'Pause recommandée',
      description: 'Vous étudiez depuis 2h30. Prenez une pause de 15 minutes pour optimiser votre apprentissage.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
      isImportant: false
    }
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'study': return BookOpen;
      case 'music': return Music;
      case 'social': return Users;
      case 'system': return Info;
      case 'reminder': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'achievement': return 'from-yellow-500 to-orange-600';
      case 'study': return 'from-blue-500 to-indigo-600';
      case 'music': return 'from-purple-500 to-pink-600';
      case 'social': return 'from-green-500 to-emerald-600';
      case 'system': return 'from-gray-500 to-slate-600';
      case 'reminder': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    const matchesUnread = !showOnlyUnread || !notification.isRead;
    
    return matchesSearch && matchesFilter && matchesUnread;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  const handleMarkAsRead = (notificationId: string) => {
    toast({
      title: "Notification marquée comme lue",
      description: "La notification a été mise à jour.",
    });
  };

  const handleMarkAllAsRead = () => {
    toast({
      title: "Toutes les notifications marquées comme lues",
      description: `${unreadCount} notifications ont été mises à jour.`,
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée définitivement.",
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} jour${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
  };

  return (
    <ImmersiveLayout
      variant="medical"
      header={{
        title: "Centre de Notifications",
        subtitle: `${unreadCount} non lues • ${importantCount} importantes`,
        icon: <Bell className="h-6 w-6" />,
        badge: unreadCount > 0 ? { text: unreadCount.toString(), color: "orange" } : undefined,
        backTo: "/dashboard",
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings?tab=notifications')}>
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: notifications.length, icon: Bell, color: 'from-blue-500 to-indigo-600' },
            { label: 'Non lues', value: unreadCount, icon: Eye, color: 'from-orange-500 to-red-600' },
            { label: 'Importantes', value: importantCount, icon: Star, color: 'from-yellow-500 to-orange-600' },
            { label: 'Aujourd\'hui', value: notifications.filter(n => 
              n.timestamp.toDateString() === new Date().toDateString()
            ).length, icon: Calendar, color: 'from-green-500 to-emerald-600' }
          ].map((stat, index) => (
            <Card key={index} className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres et recherche */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans les notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="achievement">Succès</SelectItem>
                    <SelectItem value="study">Études</SelectItem>
                    <SelectItem value="music">Musique</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                    <SelectItem value="reminder">Rappels</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={showOnlyUnread ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                >
                  {showOnlyUnread ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des notifications */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Aucune notification trouvée</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery || filterType !== 'all' || showOnlyUnread
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Vous êtes à jour ! Aucune nouvelle notification.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <Card 
                  key={notification.id} 
                  className={`bg-black/20 backdrop-blur-sm border transition-all duration-300 cursor-pointer hover:border-white/30 ${
                    notification.isRead ? 'border-white/10' : 'border-blue-500/30 bg-blue-500/5'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icône de type */}
                      <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`font-medium ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                            {notification.isImportant && (
                              <Star className="inline h-4 w-4 text-yellow-400 ml-2" />
                            )}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/10">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.isRead && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Marquer comme lu
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }} className="text-red-400">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-300'}`}>
                          {notification.description}
                        </p>
                        
                        {/* Badges de type */}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            className={`text-xs ${
                              notification.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-300' :
                              notification.type === 'study' ? 'bg-blue-500/20 text-blue-300' :
                              notification.type === 'music' ? 'bg-purple-500/20 text-purple-300' :
                              notification.type === 'social' ? 'bg-green-500/20 text-green-300' :
                              notification.type === 'system' ? 'bg-gray-500/20 text-gray-300' :
                              'bg-orange-500/20 text-orange-300'
                            }`}
                          >
                            {notification.type === 'achievement' && 'Succès'}
                            {notification.type === 'study' && 'Étude'}
                            {notification.type === 'music' && 'Musique'}
                            {notification.type === 'social' && 'Social'}
                            {notification.type === 'system' && 'Système'}
                            {notification.type === 'reminder' && 'Rappel'}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ImmersiveLayout>
  );
}