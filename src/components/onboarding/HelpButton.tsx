import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, Book, MessageCircle, Video } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useActivityTracking } from '@/hooks/useActivityTracking';

export const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { startOnboarding } = useOnboarding();
  const { logActivity } = useActivityTracking();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'help_button', action: 'open' }
      });
    }
  };

  const helpItems = [
    {
      icon: Book,
      title: 'Recommencer le tutoriel',
      description: 'Revoir les étapes de découverte',
      action: () => {
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'help_button', action: 'start_tutorial' }
        });
        startOnboarding();
        setIsOpen(false);
      }
    },
    {
      icon: MessageCircle,
      title: 'Centre d\'aide',
      description: 'Documentation et FAQ',
      action: () => {
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'help_button', action: 'open_help_center' }
        });
        window.open('/help', '_blank');
      }
    },
    {
      icon: Video,
      title: 'Vidéos tutorielles',
      description: 'Guides visuels pas à pas',
      action: () => {
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'help_button', action: 'open_tutorials' }
        });
        window.open('/tutorials', '_blank');
      }
    }
  ];

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="medical-card w-80 p-0 shadow-xl" 
        side="top" 
        align="end"
      >
        <div className="p-4">
          <h3 className="font-semibold text-medical-primary mb-3">
            Besoin d'aide ?
          </h3>
          <div className="space-y-2">
            {helpItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left hover:bg-medical-background"
                onClick={item.action}
              >
                <item.icon className="h-5 w-5 mr-3 text-medical-accent flex-shrink-0" />
                <div>
                  <div className="font-medium text-medical-primary">
                    {item.title}
                  </div>
                  <div className="text-sm text-medical-secondary">
                    {item.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};