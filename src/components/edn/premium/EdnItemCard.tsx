import { Badge } from "@/components/ui/badge";
import { sceneImmersiveEstGenerique } from '@/utils/tableauTransformations';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { OfflineDownloadButton } from "@/components/edn/OfflineDownloadButton";
import { useEdnItemV2Process } from "@/hooks/useEdnItemV2Process";
import type { StatutItem } from "@/lib/recommandation";
import {
    ArrowRight,
    Brain,
    FileText,
    Heart,
    Image,
    Music,
    RotateCcw,
    StickyNote,
    Users,
    Volume2,
    type LucideIcon
} from "lucide-react";
import React from 'react';

interface TableauRang {
  title?: string;
  sections?: Array<{ title?: string; content?: string }>;
}

interface SceneImmersive {
  id?: string;
  title?: string;
  description?: string;
}

interface QuizQuestions {
  questions?: Array<{ question: string; options: string[] }>;
}

interface AudioAmbiance {
  url?: string;
  title?: string;
}

interface EdnItemCardProps {
  item: {
    id: string;
    item_code: string;
    title: string;
    subtitle?: string;
    tableau_rang_a?: TableauRang;
    tableau_rang_b?: TableauRang;
    paroles_musicales?: string[];
    scene_immersive?: SceneImmersive;
    quiz_questions?: QuizQuestions;
    audio_ambiance?: AudioAmbiance;
    visual_ambiance?: { url?: string };
    competences_count_rang_a?: number;
    competences_count_rang_b?: number;
    bd_panels?: unknown;
    roman_story?: unknown;
  };
  onOpen: (tab?: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isOfflineAvailable?: boolean;
  isDownloading?: boolean;
  onDownloadOffline?: (item: any) => void;
  onRemoveOffline?: (itemCode: string) => void;
  /** Statut pédagogique calculé à partir des données réelles (connecté uniquement). */
  statut?: StatutItem;
  /** « il y a 3 jours », si une date de dernière révision existe. */
  derniereRevision?: string | null;
  /** L'utilisateur a une note personnelle sur cet item. */
  hasNotes?: boolean;
  /** Afficher la pastille « Essai gratuit » (compte sans Premium). */
  estEssaiGratuit?: boolean;
}

const STATUTS: Record<StatutItem, { libelle: string; classe: string; cta: string }> = {
  non_commence: { libelle: 'Non commencé', classe: 'bg-muted text-muted-foreground border-transparent', cta: 'Commencer' },
  en_cours: { libelle: 'En cours', classe: 'bg-primary/10 text-primary border-primary/20', cta: 'Continuer' },
  a_revoir: { libelle: 'À revoir', classe: 'bg-warning/20 text-foreground border-warning/70', cta: 'Revoir' },
  maitrise: { libelle: 'Maîtrisé', classe: 'bg-success/15 text-foreground border-success/60', cta: 'Revoir' },
};

const stop = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** Bouton icône avec libellé accessible et infobulle. */
const BoutonIcone: React.FC<{
  libelle: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  pressed?: boolean;
  children: React.ReactNode;
}> = ({ libelle, onClick, className, pressed, children }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={libelle}
        aria-pressed={pressed}
        onClick={onClick}
        className={`h-9 w-9 shrink-0 ${className ?? ''}`}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{libelle}</TooltipContent>
  </Tooltip>
);

export const EdnItemCard: React.FC<EdnItemCardProps> = ({
  item,
  onOpen,
  isFavorite = false,
  onToggleFavorite,
  isOfflineAvailable = false,
  isDownloading = false,
  onDownloadOffline,
  onRemoveOffline,
  statut,
  derniereRevision,
  hasNotes = false,
  estEssaiGratuit = false,
}) => {
  // Traitement des données V2 si nécessaire
  const processedItem = useEdnItemV2Process(item);
  const finalItem = processedItem || item;

  const itemNumber = parseInt(finalItem.item_code.replace(/\D/g, '') || '0', 10);
  const rangA = finalItem.competences_count_rang_a || 0;
  const rangB = finalItem.competences_count_rang_b || 0;
  const aMusique = Boolean(finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0);

  // Formats disponibles. Planches et Récit sont présents sur les 367 items
  // (diaporama des compétences et mise en situation à partir de phrases types).
  const formats: Array<{ icon: LucideIcon; text: string }> = [];
  if (aMusique) formats.push({ icon: Music, text: 'Paroles' });
  formats.push({ icon: Image, text: 'Planches' });
  formats.push({ icon: FileText, text: 'Récit' });
  if (finalItem.quiz_questions) formats.push({ icon: Brain, text: 'Quiz' });
  if (!sceneImmersiveEstGenerique(finalItem.scene_immersive)) formats.push({ icon: Users, text: 'Scène' });
  if (finalItem.audio_ambiance) formats.push({ icon: Volume2, text: 'Audio' });

  const infosStatut = statut ? STATUTS[statut] : null;
  const cta = infosStatut?.cta ?? 'Commencer';
  const CtaIcon = statut === 'a_revoir' || statut === 'maitrise' ? RotateCcw : ArrowRight;
  const titreComplet = `${itemNumber}. ${finalItem.title}`;

  return (
    <Card className="group relative flex flex-col overflow-hidden border bg-card text-card-foreground transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {/* Accent : bandeau fin, le fond de carte reste clair */}
      <div className="h-1 bg-gradient-to-r from-accent to-primary" aria-hidden="true" />

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start gap-2">
          <span
            className="flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-md bg-primary/10 px-1.5 text-sm font-bold text-primary"
            aria-hidden="true"
          >
            {itemNumber}
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-muted-foreground">{finalItem.item_code}</span>
            {estEssaiGratuit && (
              <Badge variant="outline" className="h-5 border-success/60 bg-success/10 px-1.5 text-[11px] font-medium text-foreground">
                Essai gratuit
              </Badge>
            )}
            {hasNotes && (
              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[11px] font-medium text-muted-foreground">
                <StickyNote className="h-3 w-3" aria-hidden="true" />
                Notes
              </Badge>
            )}
          </div>
          {onToggleFavorite && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={isFavorite ? `Retirer l'item ${itemNumber} des favoris` : `Ajouter l'item ${itemNumber} aux favoris`}
                  aria-pressed={isFavorite}
                  onClick={(e) => {
                    stop(e);
                    onToggleFavorite();
                  }}
                  className={`-mr-1 -mt-1 h-9 w-9 shrink-0 ${isFavorite ? 'text-red-600 hover:text-red-700' : 'text-muted-foreground hover:text-red-600'}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-foreground" title={titreComplet}>
          <span className="sr-only">Item {itemNumber} : </span>
          {finalItem.title}
        </h3>

        {infosStatut && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <Badge variant="outline" className={`h-5 px-1.5 text-[11px] font-medium ${infosStatut.classe}`}>
              {infosStatut.libelle}
            </Badge>
            {derniereRevision && (
              <span className="text-muted-foreground">Dernière révision {derniereRevision}</span>
            )}
          </div>
        )}

        <div className="mt-auto space-y-1 text-muted-foreground">
          <p className="text-xs leading-normal">
            <span className="font-medium text-foreground/80">Rang A</span> {rangA}
            <span aria-hidden="true"> · </span>
            <span className="font-medium text-foreground/80">Rang B</span> {rangB}
            <span className="sr-only"> compétences du référentiel</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-normal">
            <span className="sr-only">Formats : </span>
            {formats.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1">
                <Icon className="h-3 w-3" aria-hidden="true" />
                {text}
              </span>
            ))}
          </p>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              stop(e);
              onOpen();
            }}
            className="h-9 flex-1"
            aria-label={`${cta} l'item ${itemNumber}`}
          >
            {cta}
            <CtaIcon className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Button>
          <BoutonIcone
            libelle={aMusique ? 'Ouvrir la chanson mnémotechnique (paroles)' : "Ouvrir l'écran musique de l'item"}
            onClick={(e) => {
              stop(e);
              onOpen('music');
            }}
          >
            <Music className="h-4 w-4" aria-hidden="true" />
          </BoutonIcone>
          {onDownloadOffline && onRemoveOffline && (
            <OfflineDownloadButton
              itemCode={finalItem.item_code}
              item={finalItem}
              isDownloaded={isOfflineAvailable}
              isDownloading={isDownloading}
              onDownload={onDownloadOffline}
              onRemove={onRemoveOffline}
              compact
            />
          )}
        </div>
      </div>
    </Card>
  );
};
