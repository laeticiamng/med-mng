import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Home,
  Music,
  BookOpen,
  Users,
  Settings,
  User,
  LogIn,
  UserPlus,
  Stethoscope,
  Brain,
  BarChart3,
  Heart
} from "lucide-react";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Plateforme", href: "/platform", icon: Stethoscope },
  { name: "Générateur", href: "/generator", icon: Music },
  { name: "EDN", href: "/edn", icon: BookOpen },
  { name: "ECOS", href: "/ecos", icon: Brain },
  { name: "Chat IA", href: "/chat", icon: Heart },
  { name: "Communauté", href: "/community", icon: Users },
];

const medMngNavigation = [
  { name: "Tableau de bord", href: "/med-mng/dashboard", icon: BarChart3 },
  { name: "Créer", href: "/med-mng/create", icon: Music },
  { name: "Bibliothèque", href: "/med-mng/library", icon: BookOpen },
  { name: "Profil", href: "/med-mng/profile", icon: User },
];

export const PremiumNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const isMedMngRoute = location.pathname.startsWith("/med-mng");

  return (
    <nav className="medical-nav sticky top-0 z-50 border-b border-border/40 backdrop-blur-lg">
      <div className="medical-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MED-MNG
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {(isMedMngRoute ? medMngNavigation : navigation).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "medical-nav-item flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href) && "active"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {!isMedMngRoute ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/med-mng/login" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </Link>
                </Button>
                <Button asChild className="medical-btn-primary" size="sm">
                  <Link to="/med-mng/signup" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>S'inscrire</span>
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/med-mng/settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu principal"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <div className="space-y-1">
              {(isMedMngRoute ? medMngNavigation : navigation).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "medical-nav-item flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium",
                      isActive(item.href) && "active"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Auth */}
              <div className="pt-4 mt-4 border-t border-border/40 space-y-2">
                {!isMedMngRoute ? (
                  <>
                    <Link
                      to="/med-mng/login"
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Connexion</span>
                    </Link>
                    <Link
                      to="/med-mng/signup"
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>S'inscrire</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/med-mng/settings"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Paramètres</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};