/**
 * 🏥 PREMIUM HEADER - MED-MNG v4.0
 * En-tête premium avec navigation et outils
 */

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumHeaderProps {
  className?: string;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({ className }) => {
  return (
    <header className={cn(
      "flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4",
      className
    )}>
      {/* Toggle sidebar */}
      <SidebarTrigger className="lg:hidden" />
      
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher..."
          className="pl-8 bg-muted/50"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};