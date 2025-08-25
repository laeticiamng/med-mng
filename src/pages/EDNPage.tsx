import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MusicCardsSection } from '@/components/edn/music/MusicCardsSection';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Music, BookOpen, Play, Pause, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EDNItem {
  id: string;
  item_code: string;
  title: string;
  subtitle: string;
  slug: string;
  completeness_score: number;
  specialite: string;
  is_validated: boolean;
  paroles_musicales: string[];
}

export function EDNPage() {
  const [items, setItems] = useState<EDNItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EDNItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<EDNItem | null>(null);
  const [musicStyle, setMusicStyle] = useState('pop');
  const [musicDuration, setMusicDuration] = useState(120);
  const [generatingA, setGeneratingA] = useState(false);
  const [generatingB, setGeneratingB] = useState(false);
  const [audioA, setAudioA] = useState<string>('');
  const [audioB, setAudioB] = useState<string>('');
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEDNItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedSpecialty]);

  const fetchEDNItems = async () => {
    try {
      const { data, error } = await supabase
        .from('edn_items_complete')
        .select('id, item_code, title, subtitle, slug, completeness_score, specialite, is_validated, paroles_musicales')
        .eq('is_validated', true)
        .order('item_code');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching EDN items:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les items EDN",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.specialite.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(item => item.specialite === selectedSpecialty);
    }

    setFilteredItems(filtered);
  };

  const specialties = [...new Set(items.map(item => item.specialite))];

  const handleGenerateMusic = async (rang: 'A' | 'B') => {
    if (!selectedItem || !selectedItem.paroles_musicales) return;

    const setGenerating = rang === 'A' ? setGeneratingA : setGeneratingB;
    const setAudio = rang === 'A' ? setAudioA : setAudioB;

    setGenerating(true);
    try {
      // Simulation de génération musicale
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAudio(`/api/music/generated/${selectedItem.id}-${rang}.mp3`);
      toast({
        title: "Musique générée",
        description: `La musique ${rang} a été générée avec succès`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la musique",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des items EDN...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Items EDN - Formation Musicale
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explorez les items de connaissances EDN à travers des contenus musicaux immersifs et interactifs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Items validés</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avec paroles</p>
                <p className="text-2xl font-bold">{items.filter(i => i.paroles_musicales?.length > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Spécialités</p>
                <p className="text-2xl font-bold">{specialties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Complétude moy.</p>
                <p className="text-2xl font-bold">{Math.round(items.reduce((acc, item) => acc + item.completeness_score, 0) / items.length)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Recherche et filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un item, titre ou spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Toutes les spécialités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les spécialités</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`cursor-pointer transition-all hover:shadow-lg ${selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedItem(item)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{item.item_code}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.title}</CardDescription>
                </div>
                <Badge variant={item.completeness_score >= 90 ? 'default' : 'secondary'}>
                  {item.completeness_score}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="outline">{item.specialite}</Badge>
                {item.paroles_musicales && item.paroles_musicales.length > 0 ? (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Music className="h-4 w-4" />
                    <span>Contenu musical disponible</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Music className="h-4 w-4" />
                    <span>Pas de contenu musical</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Music Generation Section */}
      {selectedItem && selectedItem.paroles_musicales && selectedItem.paroles_musicales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Génération musicale - {selectedItem.item_code}</CardTitle>
            <CardDescription>{selectedItem.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Music Style and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Style musical</label>
                <Select value={musicStyle} onValueChange={setMusicStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="classical">Classique</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="electronic">Électronique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Durée (secondes)</label>
                <Input
                  type="number"
                  value={musicDuration}
                  onChange={(e) => setMusicDuration(parseInt(e.target.value))}
                  min={60}
                  max={300}
                />
              </div>
            </div>

            {/* Music Cards */}
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Génération musicale disponible pour cet item - Fonctionnalité en développement
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}