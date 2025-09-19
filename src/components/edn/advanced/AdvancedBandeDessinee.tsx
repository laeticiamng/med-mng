import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Sparkles, Download, RefreshCw, Image, FileText, CheckCircle2 } from 'lucide-react';
import { pedagogicalContentService } from '@/services/pedagogicalContentService';
import { RateLimitNotice } from '@/components/system/RateLimitNotice';
import { RateLimitExceededError } from '@/utils/errors/rateLimit';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';

interface ComicScene {
  id: string;
  title: string;
  narrative: string;
  learning_points?: string[];
}

interface ComicPanel {
  id: string;
  title: string;
  description?: string;
  dialogue?: string;
  image_url?: string;
  competences?: string[];
}

interface ComicAsset {
  url: string;
  label?: string;
  type?: string;
}

interface ComicContent {
  synopsis: string;
  scenes: ComicScene[];
  panels: ComicPanel[];
  assets: ComicAsset[];
  updatedAt?: string;
}

interface AdvancedBandeDessineeProps {
  item: {
    id: string;
    title: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
  onProgress?: (progress: number) => void;
}

const normalizeComicContent = (rawContent: any, fallbackTitle: string): ComicContent | null => {
  if (!rawContent) return null;

  const payload = typeof rawContent === 'string' ? (() => {
    try {
      return JSON.parse(rawContent);
    } catch {
      return null;
    }
  })() : rawContent;

  if (!payload) return null;

  const synopsis =
    payload.synopsis ||
    payload.storyline ||
    payload.story ||
    `Synopsis pédagogique pour ${fallbackTitle}`;

  const scenes: ComicScene[] = (payload.scenes || payload.script || []).map((scene: any, index: number) => ({
    id: scene.id?.toString() ?? `scene-${index + 1}`,
    title: scene.title || scene.heading || `Scène ${index + 1}`,
    narrative: scene.narrative || scene.description || scene.content || '',
    learning_points: scene.learning_points || scene.key_points || [],
  }));

  const panels: ComicPanel[] = (payload.panels || payload.vignettes || []).map((panel: any, index: number) => ({
    id: panel.id?.toString() ?? `panel-${index + 1}`,
    title: panel.title || `Vignette ${index + 1}`,
    description: panel.text || panel.description || '',
    dialogue: panel.dialogue || panel.bubble || '',
    image_url: panel.imageUrl || panel.image_url,
    competences: panel.competences || panel.skills || [],
  }));

  const assets: ComicAsset[] = (payload.assets || payload.asset_urls || []).map((asset: any) => ({
    url: typeof asset === 'string' ? asset : asset.url,
    label: asset.label || asset.caption,
    type: asset.type,
  }));

  return {
    synopsis,
    scenes,
    panels,
    assets,
    updatedAt: payload.updated_at || payload.updatedAt,
  };
};

const buildMarkdownExport = (itemTitle: string, content: ComicContent) => {
  const lines: string[] = [];
  lines.push(`# ${itemTitle} – Bande dessinée pédagogique`);
  lines.push('');
  lines.push('## Synopsis');
  lines.push(content.synopsis || 'Synopsis non renseigné.');
  lines.push('');
  lines.push('## Scènes');
  content.scenes.forEach((scene, index) => {
    lines.push(`### ${index + 1}. ${scene.title}`);
    lines.push(scene.narrative || 'Narration non fournie.');
    if (scene.learning_points?.length) {
      lines.push('');
      lines.push('**Points pédagogiques :**');
      scene.learning_points.forEach((point) => lines.push(`- ${point}`));
    }
    lines.push('');
  });

  if (content.panels.length) {
    lines.push('## Vignettes illustrées');
    content.panels.forEach((panel, index) => {
      lines.push(`### Vignette ${index + 1} – ${panel.title}`);
      if (panel.description) lines.push(panel.description);
      if (panel.dialogue) lines.push(`> ${panel.dialogue}`);
      if (panel.competences?.length) {
        lines.push('');
        lines.push('Compétences abordées :');
        panel.competences.forEach((competence) => lines.push(`- ${competence}`));
      }
      lines.push('');
    });
  }

  if (content.assets.length) {
    lines.push('## Assets visuels');
    content.assets.forEach((asset) => {
      lines.push(`- ${asset.label ?? 'Asset'} : ${asset.url}`);
    });
    lines.push('');
  }

  return lines.join('\n');
};

export const AdvancedBandeDessinee: React.FC<AdvancedBandeDessineeProps> = ({ item }) => {
  const [content, setContent] = useState<ComicContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ message: string; retryAt?: number | null; retryAfterSeconds?: number } | null>(null);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pedagogicalContentService.getItemContent(item.item_code);
      const rawComic = Array.isArray(response)
        ? response.find((entry: any) => entry.content_type === 'comic')?.content
        : response?.bande_dessinee || response?.comic;

      const normalized = normalizeComicContent(rawComic, item.title);
      setContent(normalized);
      setRateLimit(null);
      return normalized;
    } catch (err) {
      if (err instanceof RateLimitExceededError) {
        setRateLimit({
          message: err.message,
          retryAt: err.retryAt ?? (err.retryAfterSeconds ? Date.now() + err.retryAfterSeconds * 1000 : undefined),
          retryAfterSeconds: err.retryAfterSeconds,
        });
        setError(err.message);
      } else {
        const message = err instanceof Error ? err.message : 'Impossible de charger la bande dessinée.';
        setError(message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [item.item_code]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    void trackCanonicalEvent({
      type: 'bd_generate_start',
      metadata: {
        item_code: item.item_code,
        item_title: item.title,
      },
    });
    try {
      await pedagogicalContentService.generateMissingContent(item.item_code);
      const refreshed = await loadContent();
      setRateLimit(null);
      void trackCanonicalEvent({
        type: 'bd_generate_success',
        metadata: {
          item_code: item.item_code,
          item_title: item.title,
          scene_count: refreshed?.scenes.length ?? 0,
          panel_count: refreshed?.panels.length ?? 0,
          has_assets: Boolean(refreshed?.assets?.length),
        },
      });
    } catch (err) {
      if (err instanceof RateLimitExceededError) {
        setRateLimit({
          message: err.message,
          retryAt: err.retryAt ?? (err.retryAfterSeconds ? Date.now() + err.retryAfterSeconds * 1000 : undefined),
          retryAfterSeconds: err.retryAfterSeconds,
        });
        setError(err.message);
        void trackCanonicalEvent({
          type: 'bd_generate_fail',
          metadata: {
            item_code: item.item_code,
            item_title: item.title,
            error_type: 'rate_limit',
            retry_after_seconds: err.retryAfterSeconds,
          },
        });
      } else {
        const message = err instanceof Error ? err.message : 'Erreur lors de la génération de la bande dessinée.';
        setError(message);
        void trackCanonicalEvent({
          type: 'bd_generate_fail',
          metadata: {
            item_code: item.item_code,
            item_title: item.title,
            error_message: message,
          },
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!content) return;
    const markdown = buildMarkdownExport(item.title, content);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${item.item_code}-bande-dessinee.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!content) return;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(`${item.title} – Bande dessinée pédagogique`, 40, 60);

    pdf.setFontSize(12);
    pdf.setFont('Helvetica', 'normal');
    const synopsisLines = pdf.splitTextToSize(content.synopsis || 'Synopsis non renseigné.', 520);
    pdf.text('Synopsis', 40, 90);
    pdf.text(synopsisLines, 40, 110);

    let y = 110 + synopsisLines.length * 14 + 20;
    content.scenes.forEach((scene, index) => {
      if (y > 720) {
        pdf.addPage();
        y = 60;
      }
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`${index + 1}. ${scene.title}`, 40, y);
      y += 18;
      pdf.setFont('Helvetica', 'normal');
      const narrativeLines = pdf.splitTextToSize(scene.narrative || '', 520);
      pdf.text(narrativeLines, 40, y);
      y += narrativeLines.length * 14 + 10;

      if (scene.learning_points?.length) {
        pdf.setFont('Helvetica', 'italic');
        pdf.text('Points pédagogiques :', 40, y);
        y += 14;
        pdf.setFont('Helvetica', 'normal');
        scene.learning_points.forEach((point) => {
          const bulletLines = pdf.splitTextToSize(`• ${point}`, 520);
          pdf.text(bulletLines, 40, y);
          y += bulletLines.length * 14;
        });
        y += 6;
      }
    });

    pdf.save(`${item.item_code}-bande-dessinee.pdf`);
  };

  const hasContent = !!content;

  return (
    <div id="section-bd" className="space-y-6">
      <Card className="border-2 border-violet-200 bg-violet-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <BookOpen className="h-5 w-5" />
            Bande dessinée clinique – {item.title}
          </CardTitle>
          <CardDescription>
            Script structuré, scènes pédagogiques et assets exportables (PDF / Markdown) pour animer vos révisions EDN.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rateLimit && (
            <RateLimitNotice
              scope="comic"
              message={rateLimit.message}
              retryAt={rateLimit.retryAt}
              retryAfterSeconds={rateLimit.retryAfterSeconds}
              onDismiss={() => setRateLimit(null)}
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Générer / mettre à jour
            </Button>
            <Button variant="outline" onClick={handleExportPdf} disabled={!hasContent}>
              <Download className="mr-2 h-4 w-4" />
              Exporter en PDF
            </Button>
            <Button variant="outline" onClick={handleExportMarkdown} disabled={!hasContent}>
              <FileText className="mr-2 h-4 w-4" />
              Exporter en Markdown
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : !content ? (
        <Card className="border border-dashed border-muted bg-muted/20">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
            <Image className="h-10 w-10" />
            Aucune bande dessinée n'est encore disponible. Lancez une génération pour obtenir un storyboard complet.
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Synopsis et scènes pédagogiques
            </CardTitle>
            <CardDescription>
              {content.updatedAt
                ? `Mise à jour le ${new Date(content.updatedAt).toLocaleString('fr-FR')}`
                : 'Dernière version générée'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Synopsis</h3>
              <p className="text-sm text-muted-foreground">{content.synopsis || 'Synopsis non renseigné.'}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scènes pédagogiques</h3>
              <div className="space-y-4">
                {content.scenes.map((scene, index) => (
                  <div key={scene.id} className="rounded-lg border border-muted bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Scène {index + 1}</Badge>
                        <span className="font-semibold text-foreground">{scene.title}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{scene.narrative}</p>
                    {scene.learning_points?.length ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {scene.learning_points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {content.panels.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold">Vignettes illustrées</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {content.panels.map((panel) => (
                    <div key={panel.id} className="rounded-lg border border-muted bg-white/70 p-4">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span className="font-semibold text-foreground">{panel.title}</span>
                      </div>
                      {panel.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{panel.description}</p>
                      )}
                      {panel.dialogue && (
                        <p className="mt-2 rounded-md bg-muted/40 p-2 text-sm italic">“{panel.dialogue}”</p>
                      )}
                      {panel.competences?.length && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {panel.competences.map((competence) => (
                            <Badge key={competence} variant="outline">
                              {competence}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {panel.image_url && (
                        <a
                          href={panel.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-xs text-primary hover:underline"
                        >
                          Ouvrir l’illustration
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.assets.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <h3 className="text-lg font-semibold">Assets multimédia</h3>
                <div className="space-y-2">
                  {content.assets.map((asset) => (
                    <div key={asset.url} className="flex items-center justify-between gap-3 rounded-md border border-muted/40 p-3">
                      <div>
                        <div className="font-medium text-foreground">{asset.label ?? 'Asset visuel'}</div>
                        <div className="text-xs text-muted-foreground">{asset.type ?? 'visuel'}</div>
                      </div>
                      <a href={asset.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                        Ouvrir
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

