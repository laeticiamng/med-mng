// Dashboard Layout - Scalable layout component
import React from "react";
import { NavButton } from "@/components/navigation/NavButton";
import { NAV_SCHEMA, filterNavNodes } from "@/lib/nav-schema";
import { t } from "@/lib/i18n/keys";
import type { NavigationContext } from "@/types/nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  sidebar
}: DashboardLayoutProps) {
  // Mock navigation context - replace with actual auth state
  const navigationContext: NavigationContext = {
    isAuthenticated: Boolean(localStorage.getItem('auth-token')),
    userRoles: ['user'], // Get from auth context
    featureFlags: {} // Get from feature flag service
  };

  const filteredNav = filterNavNodes(NAV_SCHEMA, navigationContext);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                MED-MNG
              </span>
            </a>
            
            {/* Main Navigation */}
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {filteredNav.map((node) => (
                <NavButton
                  key={node.id}
                  node={node}
                  context={navigationContext}
                  variant="ghost"
                  size="sm"
                >
                  {t(node.labelKey)}
                </NavButton>
              ))}
            </nav>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {actions}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden md:flex w-64 flex-col border-r bg-background">
            <div className="flex-1 overflow-auto p-4">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}