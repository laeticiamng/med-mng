import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, LogIn, UserPlus, Search, BookOpen, Users, Library, Zap } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { TranslatedText } from '@/components/TranslatedText';
import { CommandPalette } from '@/components/search/CommandPalette';

export const GlobalHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const mainNavItems = [
    { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', icon: BookOpen },
    { path: ROUTE_PATHS.generator, label: 'Générateur', icon: Music },
    { path: ROUTE_PATHS.ecosIndex, label: 'ECOS', icon: Users },
    { path: ROUTE_PATHS.medMngLibrary, label: 'Bibliothèque', icon: Library },
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <nav className="container mx-auto px-4" role="navigation" aria-label="Navigation principale">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={ROUTE_PATHS.home} 
              className="flex items-center gap-3 group transition-transform hover:scale-105"
              aria-label="Retour à l'accueil MED-MNG"
            >
              <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-medical bg-clip-text text-transparent hidden sm:block">
                MED-MNG
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  onClick={() => navigate(item.path)}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <TranslatedText text={item.label} />
                </Button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCommandOpen(true)}
                className="hidden sm:flex"
                aria-label="Recherche globale (Cmd+K)"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Language Selector */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth Buttons */}
              {user ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTE_PATHS.medMngProfile)}
                  className="hidden md:flex"
                >
                  <TranslatedText text="Profil" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
                    className="hidden md:flex gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <TranslatedText text="Connexion" />
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
                    className="hidden md:flex gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <TranslatedText text="S'inscrire" />
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden"
                aria-label="Menu mobile"
              >
                <Music className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border/50 animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-2">
                {mainNavItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <TranslatedText text={item.label} />
                  </Button>
                ))}
                
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <LanguageSelector />
                  
                  {!user && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
                      >
                        <TranslatedText text="Connexion" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
                      >
                        <TranslatedText text="S'inscrire" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Command Palette */}
      <CommandPalette open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </>
  );
};
