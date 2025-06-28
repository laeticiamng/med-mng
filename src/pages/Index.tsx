
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Stethoscope, Volume2, VolumeX, Sparkles, User, Library, Music, CreditCard, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/TranslatedText';

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Neural network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#neural-gradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Navigation Header */}
      <div className="relative z-20 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">
              <TranslatedText text="MED MNG" />
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/med-mng/library">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 px-4 py-2 rounded-lg transition-all">
                <Library className="h-4 w-4" />
                <TranslatedText text="Bibliothèque" />
              </Button>
            </Link>
            
            <Link to="/med-mng/create">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 px-4 py-2 rounded-lg transition-all">
                <Music className="h-4 w-4" />
                <TranslatedText text="Créer Musique" />
              </Button>
            </Link>
            
            <Link to="/med-mng/pricing">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 px-4 py-2 rounded-lg transition-all">
                <CreditCard className="h-4 w-4" />
                <TranslatedText text="Abonnements" />
              </Button>
            </Link>
            
            <Link to="/med-mng/login">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 flex items-center gap-2 px-4 py-2 rounded-lg transition-all">
                <User className="h-4 w-4" />
                <TranslatedText text="Connexion" />
              </Button>
            </Link>

            {/* Music toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
            >
              {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mouse follower effect */}
      <div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 -mt-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Logo/Title */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 animate-pulse" />
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                <TranslatedText text="MED MNG" />
              </h1>
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 animate-pulse" />
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-light">
              <TranslatedText text="par EmotionsCare" />
            </p>
          </div>

          {/* Main tagline */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-4">
              <TranslatedText text="Et si la médecine devenait une" />{' '}
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold">
                <TranslatedText text="expérience sensorielle" />
              </span>{' '}
              <TranslatedText text="?" />
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-3xl mx-auto">
              <TranslatedText text="Plongez dans un univers immersif où apprentissage rime avec émotion, musique et interactivité. Découvrez une nouvelle façon d'apprendre la médecine." />
            </p>
          </div>

          {/* Mode selection - Larger buttons for better accessibility */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to="/edn">
              <Button 
                size="lg" 
                className="group relative px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-0 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 w-full sm:w-auto min-w-[200px]"
              >
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-semibold">
                      <TranslatedText text="Mode EDN" />
                    </div>
                    <div className="text-xs sm:text-sm text-purple-100">
                      <TranslatedText text="Items théoriques" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>

            <Link to="/ecos">
              <Button 
                size="lg" 
                className="group relative px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border-0 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25 w-full sm:w-auto min-w-[200px]"
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-semibold">
                      <TranslatedText text="Mode ECOS" />
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-100">
                      <TranslatedText text="Situations cliniques" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
          </div>

          {/* Quick Access Grid - Improved for mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Link to="/med-mng/library">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col items-center gap-1 sm:gap-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <Library className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">
                  <TranslatedText text="Bibliothèque" />
                </span>
              </Button>
            </Link>
            
            <Link to="/med-mng/create">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col items-center gap-1 sm:gap-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <Music className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">
                  <TranslatedText text="Créer" />
                </span>
              </Button>
            </Link>
            
            <Link to="/med-mng/pricing">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col items-center gap-1 sm:gap-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <CreditCard className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">
                  <TranslatedText text="Tarifs" />
                </span>
              </Button>
            </Link>
            
            <Link to="/med-mng/login">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col items-center gap-1 sm:gap-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <User className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">
                  <TranslatedText text="Profil" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Additional Navigation Grid for better access */}
          <div className="mt-8 lg:hidden">
            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
              <Link to="/med-mng/library">
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 flex items-center justify-center gap-3 py-3 rounded-xl transition-all"
                  variant="outline"
                >
                  <Library className="h-5 w-5" />
                  <TranslatedText text="Accéder à la Bibliothèque" />
                </Button>
              </Link>
              
              <Link to="/med-mng/create">
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 flex items-center justify-center gap-3 py-3 rounded-xl transition-all"
                  variant="outline"
                >
                  <Music className="h-5 w-5" />
                  <TranslatedText text="Créer de la Musique" />
                </Button>
              </Link>
              
              <Link to="/med-mng/pricing">
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 flex items-center justify-center gap-3 py-3 rounded-xl transition-all"
                  variant="outline"
                >
                  <CreditCard className="h-5 w-5" />
                  <TranslatedText text="Voir les Abonnements" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Subtitle */}
          <div className="mt-12 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <p className="text-white/50 text-xs sm:text-sm">
              <TranslatedText text="Une expérience créée pour transformer votre apprentissage médical" />
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
    </div>
  );
};

export default Index;
