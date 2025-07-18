import React, { useState } from 'react'
import { MainNavigation } from '../Navigation/MainNavigation'
import { Breadcrumb } from '../Navigation/Breadcrumb'
import { Menu, X } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Navigation mobile */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <span className="mobile-logo">MED-MNG</span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <MainNavigation />
      </aside>

      {/* Contenu principal */}
      <main className="main-content">
        <div className="content-header">
          <Breadcrumb />
        </div>

        <div className="content-body">{children}</div>
      </main>
    </div>
  )
}
