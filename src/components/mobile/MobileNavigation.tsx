import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, Home, BarChart3, Settings, Search, 
  BookOpen, Activity, Shield, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const navigationItems: NavItem[] = [
  { 
    title: "Accueil", 
    href: "/", 
    icon: Home,
    description: "Page d'accueil"
  },
  { 
    title: "EDN Items", 
    href: "/edn", 
    icon: BookOpen,
    description: "Contenu pédagogique"
  },
  { 
    title: "Analytics", 
    href: "/analytics", 
    icon: BarChart3,
    badge: "Pro",
    description: "Statistiques avancées"
  },
  { 
    title: "Monitoring", 
    href: "/monitoring", 
    icon: Activity,
    description: "Surveillance système"
  },
  { 
    title: "Admin", 
    href: "/admin", 
    icon: Shield,
    badge: "Admin",
    description: "Administration"
  },
  { 
    title: "Export", 
    href: "/export", 
    icon: Download,
    description: "Exports & rapports"
  }
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <nav className="flex flex-col space-y-3">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold">
                    MedMNG Platform
                  </h2>
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                          isActive(item.href) 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.title}
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* App Title */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">MedMNG</h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="grid grid-cols-4 h-16">
          {navigationItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs font-medium transition-colors",
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1",
                isActive(item.href) ? "text-primary" : ""
              )} />
              <span className="text-[10px]">{item.title}</span>
              {item.badge && isActive(item.href) && (
                <div className="absolute -top-1 -right-1">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}