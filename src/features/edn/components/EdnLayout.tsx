// EDN Feature Layout - Specialized layout for EDN items
import React from "react";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Music, BookOpen, Play } from "lucide-react";
import { t } from "@/lib/i18n/keys";

interface EdnLayoutProps {
  children: React.ReactNode;
  item?: {
    id: string;
    code: string;
    title: string;
    specialty: string;
    rank: 'A' | 'B';
    hasMusic?: boolean;
    hasImmersive?: boolean;
  };
  showFilters?: boolean;
}

export function EdnLayout({ children, item, showFilters = false }: EdnLayoutProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [specialtyFilter, setSpecialtyFilter] = React.useState("");

  const sidebar = item ? (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{item.code}</Badge>
          <Badge variant={item.rank === 'A' ? 'default' : 'secondary'}>
            Rang {item.rank}
          </Badge>
        </div>
        <h3 className="font-medium mb-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Spécialité: {item.specialty}
        </p>
        
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <BookOpen className="w-4 h-4 mr-2" />
            Contenu théorique
          </Button>
          
          {item.hasImmersive && (
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Play className="w-4 h-4 mr-2" />
              Mode immersif
            </Button>
          )}
          
          {item.hasMusic && (
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Music className="w-4 h-4 mr-2" />
              Contenu musical
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-2">Navigation</h4>
        <div className="space-y-1 text-sm">
          <button className="block w-full text-left p-2 hover:bg-muted rounded">
            Items précédents
          </button>
          <button className="block w-full text-left p-2 hover:bg-muted rounded">
            Items suivants
          </button>
          <button className="block w-full text-left p-2 hover:bg-muted rounded">
            Items connexes
          </button>
        </div>
      </div>
    </div>
  ) : showFilters ? (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-4">{t('actions.search')}</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Spécialité</label>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes spécialités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes spécialités</SelectItem>
                <SelectItem value="cardiologie">Cardiologie</SelectItem>
                <SelectItem value="neurologie">Neurologie</SelectItem>
                <SelectItem value="psychiatrie">Psychiatrie</SelectItem>
                <SelectItem value="pediatrie">Pédiatrie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Rang</label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Rang A
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Rang B
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-2">Filtres rapides</h4>
        <div className="space-y-1">
          <button className="block w-full text-left p-2 hover:bg-muted rounded text-sm">
            <Music className="w-4 h-4 inline mr-2" />
            Avec contenu musical
          </button>
          <button className="block w-full text-left p-2 hover:bg-muted rounded text-sm">
            <Play className="w-4 h-4 inline mr-2" />
            Mode immersif disponible
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const actions = item ? (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filtres
      </Button>
      {item.hasImmersive && (
        <Button size="sm">
          <Play className="w-4 h-4 mr-2" />
          Mode immersif
        </Button>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filtres
      </Button>
      <Button size="sm">
        {t('features.edn.browse')}
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title={item ? `${item.code} - ${item.title}` : t('features.edn.title')}
      subtitle={!item ? t('features.edn.description') : undefined}
      actions={actions}
      sidebar={sidebar}
    >
      {children}
    </DashboardLayout>
  );
}