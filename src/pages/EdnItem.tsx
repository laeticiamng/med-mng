import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EdnItem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  content: string;
}

const EdnItem = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<EdnItem | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch('/edn_data.json');
        const data: EdnItem[] = await response.json();
        const foundItem = data.find(item => item.id === slug);
        if (foundItem) {
          setItem(foundItem);
        } else {
          console.log('Item not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchItem();
  }, [slug]);

  if (!item) {
    return <div>Loading...</div>;
  }

  const items = JSON.parse(item.content) as { title: string; content: string; difficulty?: string; category?: string }[];

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <Link to="/edn" className="inline-block mb-8 text-white hover:text-emerald-300 transition-colors">
            ← Retour à la liste des EDN
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{item.title}</h1>
            <Badge variant="secondary" className="bg-emerald-900/50 text-emerald-200">
              {item.category}
            </Badge>
          </div>

          <Input
            type="search"
            placeholder="Rechercher un terme..."
            className="w-full max-w-md mx-auto mb-6 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ScrollArea className="rounded-md border bg-secondary text-secondary-foreground">
            <div className="p-4">
              {filteredItems.map((item, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          String(item.difficulty).toLowerCase() === 'facile' ? 'bg-green-500' : 
                          String(item.difficulty).toLowerCase() === 'moyen' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <Badge variant="outline" className="text-emerald-300 border-emerald-300">
                          {item.difficulty}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-900/50 text-emerald-200">
                        {item.category}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                    <p className="text-white/80">{item.content}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default EdnItem;
