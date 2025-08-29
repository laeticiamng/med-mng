import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { 
  Home, 
  ArrowLeft, 
  Settings, 
  User, 
  Bell, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface UniversalPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'light';
  showBackButton?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export const UniversalPageLayout: React.FC<UniversalPageLayoutProps> = ({
  children,
  title,
  description,
  variant = 'primary',
  showBackButton = true,
  breadcrumbs,
  actions
}) => {
  const location = useLocation();

  const defaultBreadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: title }
  ];

  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <ConsistentBackground variant={variant}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-sm">
                  {finalBreadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <ChevronRight className="h-4 w-4 text-white/50" />
                      )}
                      {crumb.href ? (
                        <Link
                          to={crumb.href}
                          className="text-white/70 hover:text-white transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-white font-medium">
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/notifications">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/faq">
                    <HelpCircle className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>

                {actions}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
              {description && (
                <p className="text-white/70 text-lg">{description}</p>
              )}
            </div>

            {/* Page Content */}
            {children}
          </div>
        </div>

        {/* Quick Return to Home */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
            asChild
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </ConsistentBackground>
  );
};