
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Search, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EdnIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample EDN items - in real app, this would come from API
  const ednItems = [
    { id: '096', title: 'Neuropathie périphérique', category: 'Neurologie', difficulty: 'Difficile' },
    { id: '104', title: 'Insuffisance cardiaque chronique', category: 'Cardiologie', difficulty: 'Modéré' },
    { id: '183', title: 'Hypoglycémie', category: 'Endocrinologie', difficulty: 'Facile' },
    { id: '205', title: 'Hépatite virale', category: 'Gastroentérologie', difficulty: 'Modéré' },
    { id: '267', title: 'Convulsions chez le nourrisson', category: 'Pédiatrie', difficulty: 'Difficile' },
    { id: '312', title: 'Syndrome néphrotique', category: 'Néphrologie', difficulty: 'Modéré' },
  ];

  const filteredItems = ednItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'text-green-400 bg-green-400/10';
      case 'Modéré': return 'text-yellow-400 bg-yellow-400/10';
      case 'Difficile': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 text-white hover:text-purple-300 transition-colors">
                <Brain className="h-8 w-8" />
                <span className="text-2xl font-bold">DocFlemme EDN</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-12">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Items EDN
              </h1>
              <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
            </div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Explorez les 367 items de l'Examen National Dématérialisé dans une expérience immersive unique
            </p>
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <Link
                key={item.id}
                to={`/edn/item-${item.id.toLowerCase()}-${item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 animate-fade-in"
                     style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {item.id}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-white/60 text-sm">{item.category}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                    <BookOpen className="h-4 w-4 text-white/40 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">Aucun item trouvé</h3>
              <p className="text-white/40">Essayez de modifier votre recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdnIndex;
