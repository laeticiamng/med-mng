import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    AlertTriangle,
    Book,
    ChevronDown,
    ChevronRight,
    Eye,
    FileText,
    Heart,
    Lightbulb,
    List,
    Settings,
    Target,
    Users
} from 'lucide-react';
import React, { useState } from 'react';

interface CompetenceOIC {
  intitule: string;
  description: string;
  objectif_id?: string;
  rubrique?: string;
  keywords?: string[];
  titre_complet?: string;
  sommaire?: string;
  mecanismes?: string;
  indications?: string;
  effets_indesirables?: string;
  interactions?: string;
  modalites_surveillance?: string;
  causes_echec?: string;
  contributeurs?: string;
  ordre_affichage?: number;
}

interface CompetenceCardOptimizedProps {
  competence: CompetenceOIC;
  index: number;
  rang: 'A' | 'B';
  isPlaceholder?: boolean;
}

// Fonction utilitaire pour formater le texte
const formatTextContent = (content: string) => {
  return content
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/([.!?])\s+/g, '$1\n\n') // Double retour après les points
    .replace(/;\s+/g, ';\n') // Retour après les points-virgules
    .replace(/:\s+/g, ':\n') // Retour après les deux-points
    .replace(/,\s+([A-Z])/g, ',\n$1') // Retour après virgule si majuscule suit
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
};

const CompetenceSection: React.FC<{
  title: string;
  content: string;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ title, content, icon, colorClass }) => {
  const formattedContent = formatTextContent(content);
  const paragraphs = formattedContent.split('\n').filter(p => p.trim().length > 0);
  
  return (
    <div className={`p-6 rounded-2xl border-l-4 ${colorClass} bg-background/50 hover:bg-background/80 transition-all duration-200 shadow-sm hover:shadow-md`}>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <h4 className="font-bold text-lg text-foreground tracking-tight">{title}</h4>
      </div>
      <div className="pl-14">
        <div className="space-y-4 text-base text-muted-foreground leading-[1.8] font-medium max-w-none">
          {paragraphs.map((paragraph, idx) => (
            <p 
              key={idx}
              className="mb-3 last:mb-0"
              style={{ 
                lineHeight: '1.75',
                letterSpacing: '0.01em',
                wordSpacing: '0.05em'
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
export const CompetenceCardOptimized: React.FC<CompetenceCardOptimizedProps> = ({ 
  competence, 
  index, 
  rang, 
  isPlaceholder = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const themeColors = rang === 'A' 
    ? {
        primary: 'from-primary to-primary/80',
        bg: 'bg-primary/5',
        border: 'border-l-primary',
        text: 'text-primary',
        accent: 'bg-primary/10'
      }
    : {
        primary: 'from-accent to-accent/80', 
        bg: 'bg-accent/5',
        border: 'border-l-accent',
        text: 'text-accent',
        accent: 'bg-accent/10'
      };

  // Analyser le contenu disponible
  const sections = [
    { 
      key: 'sommaire', 
      title: 'Vue d\'ensemble', 
      content: competence.sommaire, 
      icon: <Lightbulb className="w-4 h-4 text-warning" />,
      colorClass: 'border-l-warning bg-warning/5'
    },
    { 
      key: 'mecanismes', 
      title: 'Mécanismes d\'action', 
      content: competence.mecanismes, 
      icon: <Settings className="w-4 h-4 text-success" />,
      colorClass: 'border-l-success bg-success/5'
    },
    { 
      key: 'indications', 
      title: 'Indications cliniques', 
      content: competence.indications, 
      icon: <Target className="w-4 h-4 text-primary" />,
      colorClass: 'border-l-primary bg-primary/5'
    },
    { 
      key: 'surveillance', 
      title: 'Modalités de surveillance', 
      content: competence.modalites_surveillance, 
      icon: <Eye className="w-4 h-4 text-accent" />,
      colorClass: 'border-l-accent bg-accent/5'
    },
    { 
      key: 'effets', 
      title: 'Effets indésirables', 
      content: competence.effets_indesirables, 
      icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
      colorClass: 'border-l-destructive bg-destructive/5'
    },
    { 
      key: 'interactions', 
      title: 'Interactions médicamenteuses', 
      content: competence.interactions, 
      icon: <Heart className="w-4 h-4 text-warning" />,
      colorClass: 'border-l-warning bg-warning/5'
    },
    { 
      key: 'echec', 
      title: 'Causes d\'échec thérapeutique', 
      content: competence.causes_echec, 
      icon: <AlertTriangle className="w-4 h-4 text-warning" />,
      colorClass: 'border-l-warning bg-warning/5'
    }
  ].filter(section => section.content && section.content.trim().length > 0);

  const availableSectionsCount = sections.length;

  return (
    <Card className={`
      ${isPlaceholder ? 'opacity-60' : ''} 
      transition-all duration-300 
      border-0 
      shadow-sm 
      hover:shadow-lg 
      group 
      relative 
      overflow-hidden
      bg-card
    `}>
      {/* Indicateur de progression visuel */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${themeColors.primary} opacity-80`}></div>
      
      <CardHeader 
        className={`${themeColors.bg} cursor-pointer hover:bg-opacity-80 transition-all duration-200 pb-4`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Numéro et badge */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColors.primary} text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-105 transition-transform`}>
                {competence.ordre_affichage || index + 1}
              </div>
              {competence.objectif_id && (
                <Badge variant="outline" className="text-xs font-medium px-2 py-1 border-primary/30 text-primary">
                  {competence.objectif_id}
                </Badge>
              )}
            </div>
            
            {/* Contenu principal */}
            <div className="flex-1 space-y-4">
              <h3 className="font-bold text-xl text-foreground leading-tight group-hover:text-primary transition-colors tracking-tight">
                {competence.titre_complet || competence.intitule}
              </h3>
              
              {/* Description courte */}
              {competence.description && (
                <div className="bg-background/60 rounded-xl p-4 border border-border/50 shadow-sm">
                  <div className="space-y-3 text-base text-muted-foreground leading-[1.7] font-medium max-w-none">
                    {formatTextContent(competence.description).split('\n').filter(p => p.trim().length > 0).slice(0, 3).map((paragraph, idx) => (
                      <p 
                        key={idx}
                        style={{ 
                          lineHeight: '1.7',
                          letterSpacing: '0.01em',
                          wordSpacing: '0.05em'
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                    {formatTextContent(competence.description).split('\n').filter(p => p.trim().length > 0).length > 3 && (
                      <p className="text-sm text-muted-foreground/70 italic">
                        ... voir plus en détail ci-dessous
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Indicateurs de contenu */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {sections.slice(0, 4).map((_section, idx) => (
                    <div key={idx} className="w-2 h-2 rounded-full bg-primary/60"></div>
                  ))}
                  {availableSectionsCount > 4 && (
                    <span className="text-xs text-muted-foreground">+{availableSectionsCount - 4}</span>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
                  <List className="w-3 h-3 mr-1" />
                  {availableSectionsCount} section{availableSectionsCount > 1 ? 's' : ''} détaillée{availableSectionsCount > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Contrôle d'expansion */}
          <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      {/* Contenu étendu */}
      {isExpanded && (
        <CardContent className="pt-0 pb-8 px-8">
          <Separator className="mb-8" />
          
          <div className="space-y-6 max-w-4xl">
            {/* Description complète */}
            {competence.description && (
              <CompetenceSection
                title="Description complète"
                content={competence.description}
                icon={<Book className="w-4 h-4 text-primary" />}
                colorClass="border-l-primary bg-primary/5"
              />
            )}
            
            {/* Autres sections */}
            {sections.map((section, _idx) => (
              <CompetenceSection
                key={section.key}
                title={section.title}
                content={section.content!}
                icon={section.icon}
                colorClass={section.colorClass}
              />
            ))}
            
            {/* Métadonnées */}
            {(competence.contributeurs || competence.rubrique) && (
              <div className="mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Informations complémentaires</span>
                </div>
                <div className="space-y-2 pl-6">
                  {competence.contributeurs && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Contributeurs:</span> {competence.contributeurs}
                    </p>
                  )}
                  {competence.rubrique && competence.rubrique !== 'Non spécifiée' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Rubrique:</span>
                      <Badge variant="outline" className="text-xs">
                        {competence.rubrique}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Message si aucun contenu */}
            {!competence.description && availableSectionsCount === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Contenu détaillé en cours d'enrichissement
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};