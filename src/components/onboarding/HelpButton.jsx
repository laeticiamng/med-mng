import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const HelpButton = ({ className, onClick, ...props }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full",
        "bg-background/90 backdrop-blur-sm border-border/50",
        "hover:bg-primary hover:text-primary-foreground",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      onClick={onClick}
      aria-label="Aide et support"
      title="Obtenir de l'aide"
      {...props}
    >
      <HelpCircle className="w-5 h-5" />
    </Button>
  );
};

export default HelpButton;