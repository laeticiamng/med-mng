import { useState, useEffect } from 'react';
import { Menu, X, Home, Book, MessageCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { globalEvents } from '@/utils/simpleHelpers';

// Pure JS header component - architecture simplifiée
function SimpleHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentLanguage, setCurrentLanguage, t } = useLanguage();

  // Gestion du scroll avec JS vanilla
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation simple
  const navigate = (path) => {
    window.location.href = path;
    setIsMenuOpen(false);
  };

  // Menu items avec structure simple
  const menuItems = [
    { 
      icon: Home, 
      label: 'Accueil', 
      path: '/', 
      key: 'nav.home' 
    },
    { 
      icon: Book, 
      label: 'EDN', 
      path: '/edn-production', 
      key: 'nav.edn' 
    },
    { 
      icon: MessageCircle, 
      label: 'Chat IA', 
      path: '/chat', 
      key: 'nav.chat' 
    },
    { 
      icon: Settings, 
      label: 'Paramètres', 
      path: '/settings', 
      key: 'nav.settings' 
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    globalEvents.emit('menu-toggled', !isMenuOpen);
  };

  const handleLanguageChange = (newLang) => {
    setCurrentLanguage(newLang);
    globalEvents.emit('language-changed', newLang);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-sm shadow-sm border-b' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo simple */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">MED-MNG</span>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{t(item.key) || item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sélecteur de langue simple */}
          <div className="hidden md:flex items-center gap-2">
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 rounded-md border bg-background text-sm"
            >
              <option value="fr">🇫🇷 FR</option>
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
            </select>
          </div>

          {/* Menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="md:hidden"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Menu mobile overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b shadow-lg">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent text-left"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.key) || item.label}</span>
                  </button>
                );
              })}
              
              {/* Sélecteur langue mobile */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">Langue</label>
                <select
                  value={currentLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default SimpleHeader;