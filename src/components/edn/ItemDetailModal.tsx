import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Download, Headphones, Heart, Star, X } from 'lucide-react';
import React from 'react';

interface OicSkill {
  oic_code: string;
  oic_title: string;
  rang: string;
}

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  specialite?: string;
  rang?: string;
  oic_skills?: OicSkill[];
  payload_v2?: any;
}

interface ItemDetailModalProps {
  item: EdnItem | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateMusic?: (item: EdnItem, rang: 'A' | 'B') => void;
  onAddToFavorites?: (item: EdnItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onGenerateMusic,
  onAddToFavorites,
}) => {
  if (!item) return null;

  const rangASkills = item.oic_skills?.filter(s => s.rang === 'A') || [];
  const rangBSkills = item.oic_skills?.filter(s => s.rang === 'B') || [];

  const handleExportPDF = () => {
    // Export logic - simple text for now
    const content = `
${item.item_code} - ${item.title}
Spécialité: ${item.specialite || 'Non définie'}

Compétences Rang A (${rangASkills.length}):
${rangASkills.map(s => `- ${s.oic_code}: ${s.oic_title}`).join('\n')}

Compétences Rang B (${rangBSkills.length}):
${rangBSkills.map(s => `- ${s.oic_code}: ${s.oic_title}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.item_code}-${item.title.slice(0, 30)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-primary border-primary/30">
                  {item.item_code}
                </Badge>
                {item.specialite && (
                  <Badge variant="secondary">{item.specialite}</Badge>
                )}
                {item.rang && (
                  <Badge 
                    variant={item.rang === 'A' ? 'default' : 'secondary'}
                    className={item.rang === 'A' ? 'bg-warning text-warning-foreground' : ''}
                  >
                    Rang {item.rang}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl">{item.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {rangASkills.length + rangBSkills.length} compétences OIC associées
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex gap-2 py-3 border-y border-border">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAddToFavorites?.(item)}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Favoris
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          {onGenerateMusic && (
            <>
              <Button 
                size="sm"
                onClick={() => onGenerateMusic(item, 'A')}
                className="gap-2 bg-warning hover:bg-warning/90 text-warning-foreground"
              >
                <Headphones className="h-4 w-4" />
                Musique Rang A
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => onGenerateMusic(item, 'B')}
                className="gap-2"
              >
                <Headphones className="h-4 w-4" />
                Musique Rang B
              </Button>
            </>
          )}
        </div>

        <Tabs defaultValue="rangA" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rangA" className="gap-2">
              <Star className="h-4 w-4 text-warning" />
              Rang A ({rangASkills.length})
            </TabsTrigger>
            <TabsTrigger value="rangB" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Rang B ({rangBSkills.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rangA" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              {rangASkills.length > 0 ? (
                <div className="space-y-2">
                  {rangASkills.map((skill, idx) => (
                    <div 
                      key={skill.oic_code || idx}
                      className="p-3 bg-warning/10 border border-warning/20 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0 text-warning border-warning/30">
                          {skill.oic_code}
                        </Badge>
                        <p className="text-sm text-foreground">{skill.oic_title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune compétence Rang A pour cet item</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rangB" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              {rangBSkills.length > 0 ? (
                <div className="space-y-2">
                  {rangBSkills.map((skill, idx) => (
                    <div 
                      key={skill.oic_code || idx}
                      className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0 text-primary border-primary/30">
                          {skill.oic_code}
                        </Badge>
                        <p className="text-sm text-foreground">{skill.oic_title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune compétence Rang B pour cet item</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
