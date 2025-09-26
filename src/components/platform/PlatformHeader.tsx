import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { UserProfile } from './UserProfile';
import { useAuth } from '@/components/providers/AuthProvider';

export const PlatformHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Générateur', href: '/generator' },
    { name: 'Bibliothèque', href: '/library' },
    { name: 'ECOS', href: '/ecos' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Assistant IA', href: '/med-chat' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-6 flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:inline-block">
              MED MNG
            </span>
          </Link>
          <Badge variant="outline" className="hidden sm:inline-flex">
            v2.0
          </Badge>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Recherche globale */}
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>

          {/* Notifications */}
          {user && <NotificationCenter />}

          {/* Profil utilisateur */}
          <UserProfile />

          {/* Menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                to="/"
                className="flex items-center space-x-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MED MNG
                </span>
              </Link>
              
              <div className="my-4 h-[calc(100vh-8rem)] pb-10">
                <div className="flex flex-col space-y-3">
                  {/* Recherche mobile */}
                  <div className="sm:hidden mb-4">
                    <GlobalSearch />
                  </div>
                  
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-foreground/70 transition-colors hover:text-foreground px-2 py-1 rounded-md hover:bg-muted"
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    <Link
                      to="/support"
                      className="text-foreground/70 transition-colors hover:text-foreground px-2 py-1 rounded-md hover:bg-muted block"
                    >
                      Support & Aide
                    </Link>
                    <Link
                      to="/admin"
                      className="text-foreground/70 transition-colors hover:text-foreground px-2 py-1 rounded-md hover:bg-muted block"
                    >
                      Administration
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};