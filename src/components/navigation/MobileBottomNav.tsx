import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Library, Plus, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTE_PATHS } from '@/config/routes';

interface BottomNavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const navItems: BottomNavItem[] = [
  {
    to: ROUTE_PATHS.home,
    icon: <Home className="h-5 w-5" />,
    label: 'Accueil'
  },
  {
    to: ROUTE_PATHS.medMngLibrary,
    icon: <Library className="h-5 w-5" />,
    label: 'Bibliothèque'
  },
  {
    to: ROUTE_PATHS.medMngCreate,
    icon: <Plus className="h-5 w-5" />,
    label: 'Créer'
  },
  {
    to: ROUTE_PATHS.medMngPricing,
    icon: <CreditCard className="h-5 w-5" />,
    label: 'Abonnement'
  },
  {
    to: ROUTE_PATHS.medMngProfile,
    icon: <User className="h-5 w-5" />,
    label: 'Profil'
  }
];

export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché par la bottom nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav 
        id="main-navigation"
        data-testid="mobile-bottom-nav"
        className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border glass-medical"
        role="navigation"
        aria-label="Navigation mobile principale"
      >
        <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
                           (item.to !== '/' && location.pathname.startsWith(item.to));
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: linkActive }) => 
                  cn(
                    "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 relative group touch-feedback",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    "mobile-touch-target",
                    (linkActive || isActive) 
                      ? "text-primary bg-primary/10 shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )
                }
                aria-label={`Naviguer vers ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icône avec animation */}
                <div className={cn(
                  "flex items-center justify-center mb-1 transition-transform duration-200",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                  {item.badge && (
                    <span 
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      aria-label={`${item.badge} notifications`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium leading-none truncate transition-all duration-200",
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
                
                {/* Indicateur actif */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>
        
        {/* Indicator line pour iPhone safe area */}
        <div className="h-safe-area-inset-bottom bg-background/95" />
      </nav>
    </>
  );
};