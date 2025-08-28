import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ux/Breadcrumbs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface SubPageLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
  actions?: ReactNode;
  children: ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export const SubPageLayout: React.FC<SubPageLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  showBackButton = true,
  className = ""
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <div className="mb-4">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}

          {/* Title Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="h-9 w-9 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {actions}
              
              {/* Page Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.print()}>
                    Imprimer la page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    navigator.share?.({
                      title: title,
                      url: window.location.href
                    }).catch(console.log);
                  }}>
                    Partager
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};