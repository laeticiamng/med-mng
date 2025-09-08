import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  BarChart3,
  Mic,
  Image,
  Headphones,
  Brain,
  Heart,
  Waves,
  Settings,
  Star,
  Home,
  Sparkles
} from 'lucide-react';

const meditationItems = [
  {
    title: 'Vue d\'ensemble',
    url: '/meditation',
    icon: Home,
    description: 'Dashboard principal',
    category: 'main'
  },
  {
    title: 'Générateur Musical IA',
    url: '/meditation/music-generator',
    icon: Music,
    description: 'Suno API + Battements binauraux',
    category: 'tools',
    status: '100%',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    title: 'Mixeur Audio Pro',
    url: '/meditation/audio-mixer',
    icon: BarChart3,
    description: 'Console professionnelle 4 pistes',
    category: 'tools',
    status: '100%',
    color: 'from-green-500 to-emerald-600'
  },
  {
    title: 'Synthèse Vocale',
    url: '/meditation/voice-synthesis',
    icon: Mic,
    description: 'OpenAI TTS + Templates guidés',
    category: 'tools',
    status: '100%',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    title: 'Images d\'Ambiance',
    url: '/meditation/ambient-images',
    icon: Image,
    description: 'DALL-E 3 + Auto-génération',
    category: 'tools',
    status: '100%',
    color: 'from-pink-500 to-rose-600'
  },
  {
    title: 'Modes d\'Écoute',
    url: '/meditation/listening-modes',
    icon: Headphones,
    description: 'Ondes cérébrales + Biométrie',
    category: 'tools',
    status: '100%',
    color: 'from-orange-500 to-red-600'
  },
  {
    title: 'Sessions Guidées',
    url: '/meditation/guided-sessions',
    icon: Brain,
    description: 'Méditations personnalisées',
    category: 'content',
    color: 'from-violet-500 to-purple-600'
  },
  {
    title: 'Cohérence Cardiaque',
    url: '/meditation/heart-coherence',
    icon: Heart,
    description: 'Régulation cœur-cerveau',
    category: 'content',
    color: 'from-red-500 to-pink-600'
  },
  {
    title: 'Ondes Binaurales',
    url: '/meditation/binaural-waves',
    icon: Waves,
    description: 'Fréquences thérapeutiques',
    category: 'content',
    color: 'from-teal-500 to-cyan-600'
  },
  {
    title: 'Paramètres',
    url: '/meditation/settings',
    icon: Settings,
    description: 'Configuration personnelle',
    category: 'config'
  }
];

export function MeditationSidebar() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50 hover:border-r-2 hover:border-muted-foreground/20";

  const categories = [
    { id: 'main', label: 'Principal', items: meditationItems.filter(item => item.category === 'main') },
    { id: 'tools', label: 'Outils IA Premium', items: meditationItems.filter(item => item.category === 'tools') },
    { id: 'content', label: 'Contenu Thérapeutique', items: meditationItems.filter(item => item.category === 'content') },
    { id: 'config', label: 'Configuration', items: meditationItems.filter(item => item.category === 'config') }
  ];

  return (
    <Sidebar className={open ? "w-80" : "w-16"}>
      <SidebarContent className="bg-gradient-to-b from-background via-background to-muted/20">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {!open && (
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Centre Méditation
                </h2>
                <p className="text-xs text-muted-foreground">
                  Suite IA Premium Complète
                </p>
              </div>
            )}
          </div>
        </div>

        {categories.map((category) => (
          <SidebarGroup key={category.id}>
            {!open && (
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2">
                {category.label}
              </SidebarGroupLabel>
            )}

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {category.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-auto p-0">
                        <NavLink 
                          to={item.url} 
                          end 
                          className={`${getNavCls({ isActive: isActive(item.url) })} flex items-center gap-3 p-3 rounded-lg transition-all duration-200 relative overflow-hidden group`}
                        >
                          {/* Gradient background pour les outils IA */}
                          {item.color && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                          )}
                          
                          <div className={`p-2 rounded-lg ${
                            item.color 
                              ? `bg-gradient-to-r ${item.color}` 
                              : 'bg-muted'
                          } relative z-10`}>
                            <IconComponent className={`w-4 h-4 ${item.color ? 'text-white' : 'text-muted-foreground'}`} />
                          </div>
                          
                          {!open && (
                            <div className="flex-1 min-w-0 relative z-10">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{item.title}</span>
                                {item.status && (
                                  <Badge className="bg-success/10 text-success text-xs border-success/20">
                                    {item.status}
                                  </Badge>
                                )}
                                {item.category === 'tools' && (
                                  <Star className="w-3 h-3 text-warning" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Stats Footer */}
        {!open && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="space-y-3">
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-success to-success-glow text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  5/5 Outils IA - 100%
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <div className="font-semibold text-primary">100%</div>
                  <div className="text-muted-foreground">Génération IA</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <div className="font-semibold text-accent">100%</div>
                  <div className="text-muted-foreground">Mixage Pro</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}