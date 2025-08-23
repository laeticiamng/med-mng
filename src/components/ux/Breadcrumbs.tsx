import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

  const routeLabels: Record<string, string> = {
    '/': 'Accueil',
    '/edn': 'EDN Explorer',
    '/ecos': 'Simulations ECOS',
    '/audit': 'Audit Complet',
    '/generator': 'Générateur Musical',
    '/chat': 'Chat IA Assistant',
    '/med-mng': 'MED-MNG Platform',
    '/med-mng/login': 'Connexion',
    '/med-mng/signup': 'Inscription',
    '/med-mng/pricing': 'Abonnements',
    '/med-mng/library': 'Bibliothèque',
    '/med-mng/profile': 'Profil',
    '/med-mng/create': 'Créer',
    '/admin': 'Administration',
    '/monitoring': 'Monitoring',
    '/system-health': 'Santé Système'
  };

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items: customItems, 
  className 
}) => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Accueil', href: '/', icon: <Home className="h-3 w-3" /> }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground mb-4",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/50" />
            )}
            
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span 
                className="flex items-center gap-1 text-foreground font-medium"
                aria-current="page"
              >
                {item.icon}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};