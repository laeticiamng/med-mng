import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Music, 
  BarChart3, 
  Shield, 
  Settings, 
  Users, 
  FileText, 
  HelpCircle,
  Bell,
  Search,
  Zap,
  Grid3X3,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Navigation Rapide et Raccourcis Intelligents
 */
export const QuickNavigation = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const navigationSections = [
    {
      id: 'main',
      title: 'Principal',
      color: 'bg-primary',
      items: [
        { icon: Home, label: 'Dashboard', path: '/dashboard', shortcut: '⌘D' },
        { icon: Music, label: 'Créer Musique', path: '/med-mng/create', shortcut: '⌘M', badge: 'Nouveau' },
        { icon: BarChart3, label: 'Analytics', path: '/med-mng/analytics', shortcut: '⌘A' },
        { icon: Search, label: 'Recherche', path: '/library', shortcut: '⌘K' }
      ]
    },
    {
      id: 'medical',
      title: 'Médical',
      color: 'bg-success',
      items: [
        { icon: FileText, label: 'EDN Analysis', path: '/edn-complete', shortcut: '⌘E' },
        { icon: Shield, label: 'Audit System', path: '/audit', shortcut: '⌘S' },
        { icon: Users, label: 'Patients', path: '/med-mng/library', shortcut: '⌘P' },
        { icon: FileText, label: 'Rapports', path: '/admin-panel', shortcut: '⌘R' }
      ]
    },
    {
      id: 'admin',
      title: 'Administration',
      color: 'bg-warning',
      items: [
        { icon: Settings, label: 'Configuration', path: '/system-management', shortcut: '⌘G' },
        { icon: Users, label: 'Utilisateurs', path: '/admin-panel', shortcut: '⌘U' },
        { icon: Zap, label: 'Monitoring', path: '/system-management', shortcut: '⌘T' },
        { icon: HelpCircle, label: 'Support', path: '/chat', shortcut: '⌘H' }
      ]
    }
  ];

  const recentAccessed = [
    { path: '/med-mng/create', label: 'Création Musicale', time: '2 min' },
    { path: '/dashboard', label: 'Dashboard', time: '5 min' },
    { path: '/audit', label: 'Audit Système', time: '12 min' },
    { path: '/edn-complete', label: 'EDN Analysis', time: '18 min' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSectionToggle = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <>
      {/* Quick Access Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 rounded-full shadow-lg medical-btn-primary hover:scale-110 transition-all"
        >
          <Grid3X3 className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Quick Navigation Panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setIsExpanded(false)}>
          <div 
            className="fixed bottom-24 right-6 w-96 max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="medical-card shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Navigation Rapide</h3>
                  <Badge variant="outline" className="text-xs">⌘K pour recherche</Badge>
                </div>

                <div className="space-y-6">
                  {/* Recent Access */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Récemment Consulté</h4>
                    <div className="space-y-2">
                      {recentAccessed.map((item, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-between h-auto p-3 hover:bg-muted/50"
                          onClick={() => handleNavigation(item.path)}
                        >
                          <span className="text-sm">{item.label}</span>
                          <span className="text-xs text-muted-foreground">il y a {item.time}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Sections */}
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {navigationSections.map((section) => (
                      <div key={section.id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-3 mb-2"
                          onClick={() => handleSectionToggle(section.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${section.color}`} />
                            <span className="font-medium">{section.title}</span>
                          </div>
                          {activeSection === section.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>

                        {activeSection === section.id && (
                          <div className="space-y-1 ml-6 animate-fade-in-up">
                            {section.items.map((item, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                className="w-full justify-between h-auto p-3 hover:bg-muted/50 transition-colors"
                                onClick={() => handleNavigation(item.path)}
                              >
                                <div className="flex items-center gap-3">
                                  <item.icon className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{item.label}</span>
                                  {item.badge && (
                                    <Badge className="text-xs bg-primary/10 text-primary">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {item.shortcut}
                                </span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleNavigation('/med-mng/create')}
                        className="flex items-center gap-2"
                      >
                        <Music className="w-3 h-3" />
                        Créer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleNavigation('/chat')}
                        className="flex items-center gap-2"
                      >
                        <HelpCircle className="w-3 h-3" />
                        Aide
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickNavigation;