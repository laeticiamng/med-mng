import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ednProgressService, type EdnUnifiedRow, type SessionPlanRow } from '@/services/EdnProgressService';
import type { SpacedRepetitionItem } from '@/hooks/edn/useEdnProgressionData';
import { jsPDF } from 'jspdf';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';
import { isTestEnvironment } from '@/utils/environment';

interface EightMinuteSessionBuilderProps {
  items: EdnUnifiedRow[];
  suggestions: SpacedRepetitionItem[];
  onSessionSaved?: () => void;
}

type SessionPlanContent = {
  jeDis: string[];
  jeFais: string[];
  jeConclue: string[];
  notes: string;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remaining = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

export const EightMinuteSessionBuilder: React.FC<EightMinuteSessionBuilderProps> = ({ items, suggestions, onSessionSaved }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SessionPlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedItemCode, setSelectedItemCode] = useState<string | undefined>(suggestions[0]?.itemCode ?? items[0]?.item_code);
  const [notes, setNotes] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(8 * 60);
  const [isSaving, setIsSaving] = useState(false);
  const activeRunRef = useRef<{
    runId: string;
    startedAt: number;
    itemCode: string | null;
    contentId: string | null;
  } | null>(null);
  const testEnvironment = isTestEnvironment();

  const createRunId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  useEffect(() => {
    if (testEnvironment) {
      setUserId('test-edn-user');
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [testEnvironment]);

  useEffect(() => {
    if (!userId) {
      setSavedPlans([]);
      setLoadingPlans(false);
      return;
    }

    let active = true;
    setLoadingPlans(true);
    ednProgressService
      .listSessionPlans(userId)
      .then((plans) => {
        if (active) setSavedPlans(plans);
      })
      .finally(() => {
        if (active) setLoadingPlans(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning && remainingSeconds === 0 && activeRunRef.current) {
      const run = activeRunRef.current;
      activeRunRef.current = null;
      void trackCanonicalEvent({
        type: 'study_end',
        contentId: run.contentId ?? undefined,
        metadata: {
          runId: run.runId,
          itemCode: run.itemCode,
          reason: 'timeout',
          durationSeconds: Math.round((Date.now() - run.startedAt) / 1000),
        },
      });
    }
  }, [isRunning, remainingSeconds]);

  const selectedItem = useMemo(() => items.find((item) => item.item_code === selectedItemCode) ?? null, [items, selectedItemCode]);

  const sessionContent: SessionPlanContent = useMemo(() => {
    if (!selectedItem) {
      return { jeDis: [], jeFais: [], jeConclue: [], notes };
    }

    const tableaux = (selectedItem.tableaux ?? {}) as any;
    const rangASections: any[] = tableaux?.rang_a?.sections ?? [];
    const rangBSections: any[] = tableaux?.rang_b?.sections ?? [];
    const ecos = Array.isArray(selectedItem.ecos_contexts) ? (selectedItem.ecos_contexts as any[]) : [];
    const valeurs = Array.isArray(selectedItem.valeurs_professionnelles) ? (selectedItem.valeurs_professionnelles as any[]) : [];

    const safeMap = (source: any[], keys: string[], limit: number) =>
      source
        .map((section) => {
          for (const key of keys) {
            const value = section?.[key];
            if (value && typeof value === 'string') return value;
          }
          return null;
        })
        .filter((value): value is string => Boolean(value))
        .slice(0, limit);

    const jeDis = safeMap(rangASections, ['title', 'concept', 'definition'], 4);
    const jeFais = safeMap(rangBSections, ['title', 'technique', 'cas'], 4);
    const jeConclueCandidates = safeMap(ecos, ['title', 'content'], 4);

    const jeConclue = jeConclueCandidates.length > 0
      ? jeConclueCandidates
      : safeMap(valeurs, ['title', 'description'], 3);

    if (jeDis.length === 0 && valeurs.length > 0) {
      jeDis.push(...safeMap(valeurs, ['title', 'description'], 3));
    }

    if (jeFais.length === 0 && ecos.length > 0) {
      jeFais.push(...jeConclueCandidates);
    }

    return {
      jeDis,
      jeFais,
      jeConclue,
      notes,
    };
  }, [selectedItem, notes]);

  const toggleStep = (category: keyof SessionPlanContent, value: string) => {
    const key = `${category}-${value}`;
    setCompletedSteps((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(8 * 60);
    activeRunRef.current = null;
  };

  const toggleTimer = () => {
    setIsRunning((running) => {
      const next = !running;
      if (!running && next) {
        const runId = createRunId();
        activeRunRef.current = {
          runId,
          startedAt: Date.now(),
          itemCode: selectedItem?.item_code ?? null,
          contentId: (selectedItem?.id as string | null | undefined) ?? selectedItem?.item_code ?? null,
        };
        void trackCanonicalEvent({
          type: 'study_start',
          contentId: activeRunRef.current.contentId ?? undefined,
          metadata: {
            runId,
            itemCode: selectedItem?.item_code ?? null,
            title: selectedItem?.title ?? null,
          },
        });
      }
      return next;
    });
  };

  const exportMarkdown = () => {
    if (!selectedItem) return;

    const markdown = [
      `# Séance 8 minutes – ${selectedItem.item_code} (${selectedItem.title})`,
      '',
      '## Je dis',
      ...sessionContent.jeDis.map((line) => `- ${line}`),
      '',
      '## Je fais',
      ...sessionContent.jeFais.map((line) => `- ${line}`),
      '',
      '## Je conclus',
      ...sessionContent.jeConclue.map((line) => `- ${line}`),
      '',
      '## Notes',
      sessionContent.notes || '_Aucune note enregistrée_',
    ].join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `session-${selectedItem.item_code}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!selectedItem) return;

    if (testEnvironment) {
      console.info('📄 [TEST] Export PDF simulé pour la séance 8 minutes');
      return;
    }

    const doc = new jsPDF();
    let cursorY = 20;

    doc.setFontSize(16);
    doc.text(`Séance 8 minutes – ${selectedItem.item_code}`, 10, cursorY);
    cursorY += 8;

    doc.setFontSize(12);
    doc.text(selectedItem.title ?? '', 10, cursorY);
    cursorY += 10;

    const addSection = (title: string, entries: string[]) => {
      if (entries.length === 0) return;
      doc.setFontSize(13);
      doc.text(title, 10, cursorY);
      cursorY += 6;
      doc.setFontSize(11);
      entries.forEach((entry) => {
        const lines = doc.splitTextToSize(`• ${entry}`, 180);
        doc.text(lines, 12, cursorY);
        cursorY += lines.length * 6;
      });
      cursorY += 4;
    };

    addSection('Je dis', sessionContent.jeDis);
    addSection('Je fais', sessionContent.jeFais);
    addSection('Je conclus', sessionContent.jeConclue);

    doc.setFontSize(13);
    doc.text('Notes', 10, cursorY);
    cursorY += 6;
    doc.setFontSize(11);
    const noteLines = doc.splitTextToSize(sessionContent.notes || 'Aucune note enregistrée', 180);
    doc.text(noteLines, 12, cursorY);

    doc.save(`session-${selectedItem.item_code}.pdf`);
  };

  const handleSaveSession = async () => {
    if (!userId || !selectedItem) return;
    setIsSaving(true);

    try {
      const saved = await ednProgressService.saveSessionPlan({
        userId,
        title: `${selectedItem.item_code} – Session 8 minutes`,
        focusItemCode: selectedItem.item_code,
        focusTheme: selectedItem.specialite ?? selectedItem.domaine_medical ?? null,
        durationMinutes: Math.max(1, Math.round((8 * 60 - remainingSeconds) / 60)),
        plan: {
          jeDis: sessionContent.jeDis,
          jeFais: sessionContent.jeFais,
          jeConclue: sessionContent.jeConclue,
          notes: sessionContent.notes,
        },
      });

      if (saved) {
        setSavedPlans((previous) => {
          const existingIndex = previous.findIndex((plan) => plan.id === saved.id);
          if (existingIndex >= 0) {
            const clone = [...previous];
            clone[existingIndex] = saved;
            return clone;
          }
          return [saved, ...previous];
        });
        if (testEnvironment) {
          console.info('💾 [TEST] Session 8 minutes enregistrée localement', saved.id);
        }
        onSessionSaved?.();
        if (activeRunRef.current) {
          const run = activeRunRef.current;
          activeRunRef.current = null;
          void trackCanonicalEvent({
            type: 'study_end',
            contentId: run.contentId ?? undefined,
            metadata: {
              runId: run.runId,
              itemCode: run.itemCode,
              reason: 'saved',
              durationSeconds: Math.round((Date.now() - run.startedAt) / 1000),
            },
          });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPlan = (plan: SessionPlanRow) => {
    setSelectedItemCode(plan.focus_item_code ?? plan.title.split('–')[0]?.trim());
    const content = plan.plan as SessionPlanContent;
    setNotes(content?.notes ?? '');
    setCompletedSteps({});
    resetTimer();
    if (testEnvironment) {
      console.info('📚 [TEST] Plan de session chargé', plan.id);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const success = await ednProgressService.deleteSessionPlan(planId);
    if (success) {
      setSavedPlans((previous) => previous.filter((plan) => plan.id !== planId));
      if (testEnvironment) {
        console.info('🗑️ [TEST] Plan de session supprimé', planId);
      }
    }
  };

  const suggestionBadges = suggestions.slice(0, 3);

  return (
    <Card className="border-border/60" data-testid="eight-minute-session-builder">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-lg">Séance 8 minutes personnalisée</CardTitle>
            <p className="text-sm text-muted-foreground">
              Préparez une mini-séance structurée en trois actes : Je dis, Je fais, Je conclus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Suggestions :</span>
            {suggestionBadges.map((suggestion) => (
              <Badge
                key={suggestion.itemCode}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedItemCode(suggestion.itemCode)}
                data-testid={`session-suggestion-${suggestion.itemCode}`}
              >
                {suggestion.itemCode}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedItemCode} onValueChange={setSelectedItemCode}>
            <SelectTrigger className="w-72" data-testid="session-item-select">
              <SelectValue placeholder="Choisir un item EDN" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem
                  key={item.item_code}
                  value={item.item_code}
                  data-testid={`session-item-${item.item_code}`}
                >
                  {item.item_code} – {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">Timer :</span>
            <span className="font-mono text-lg" data-testid="session-timer">{formatTime(remainingSeconds)}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTimer}
              data-testid="session-start-button"
            >
              {isRunning ? 'Pause' : 'Démarrer'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTimer}
              data-testid="session-reset-button"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Je dis</h3>
          {sessionContent.jeDis.map((line, index) => {
            const key = `jeDis-${line}`;
            return (
              <label key={key} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox
                  checked={!!completedSteps[key]}
                  onCheckedChange={() => toggleStep('jeDis', line)}
                  data-testid={`je-dis-${index}`}
                />
                <span>{line}</span>
              </label>
            );
          })}
          {sessionContent.jeDis.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun contenu disponible pour ce rang. Ajoutez des notes personnalisées.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Je fais</h3>
          {sessionContent.jeFais.map((line, index) => {
            const key = `jeFais-${line}`;
            return (
              <label key={key} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox
                  checked={!!completedSteps[key]}
                  onCheckedChange={() => toggleStep('jeFais', line)}
                  data-testid={`je-fais-${index}`}
                />
                <span>{line}</span>
              </label>
            );
          })}
          {sessionContent.jeFais.length === 0 && (
            <p className="text-sm text-muted-foreground">Pas d'action pratique identifiée. Utilisez vos ressources ECOS pour compléter.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Je conclus</h3>
          {sessionContent.jeConclue.map((line, index) => {
            const key = `jeConclue-${line}`;
            return (
              <label key={key} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox
                  checked={!!completedSteps[key]}
                  onCheckedChange={() => toggleStep('jeConclue', line)}
                  data-testid={`je-conclus-${index}`}
                />
                <span>{line}</span>
              </label>
            );
          })}
          {sessionContent.jeConclue.length === 0 && (
            <p className="text-sm text-muted-foreground">Ajoutez vos points de synthèse pour clôturer la séance.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="w-full space-y-2">
          <label className="text-sm font-medium text-foreground">Notes personnelles</label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Synthèse personnelle, points clés à revoir, axes d'amélioration..."
            rows={4}
            data-testid="session-notes"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleSaveSession}
            disabled={!userId || !selectedItem || isSaving}
            data-testid="session-save-button"
          >
            {isSaving ? 'Enregistrement...' : 'Sauvegarder la séance'}
          </Button>
          <Button
            variant="outline"
            onClick={exportMarkdown}
            disabled={!selectedItem}
            data-testid="session-export-markdown"
          >
            Exporter en Markdown
          </Button>
          <Button
            variant="outline"
            onClick={exportPdf}
            disabled={!selectedItem}
            data-testid="session-export-pdf"
          >
            Exporter en PDF
          </Button>
        </div>

        <div className="w-full">
          <h4 className="text-sm font-semibold mb-2 text-foreground">Sessions enregistrées</h4>
          {loadingPlans && <p className="text-sm text-muted-foreground">Chargement des séances enregistrées...</p>}
          {!loadingPlans && savedPlans.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune séance enregistrée pour le moment.</p>
          )}
          {!loadingPlans && savedPlans.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2" data-testid="session-saved-plan-list">
              {savedPlans.slice(0, 6).map((plan, index) => (
                <Card
                  key={plan.id}
                  className="border-border/50"
                  data-testid={`session-saved-plan-${index}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {plan.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(plan.updated_at).toLocaleString('fr-FR')}
                    </p>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleLoadPlan(plan)}
                      data-testid={`session-load-plan-${plan.id}`}
                    >
                      Charger
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      data-testid={`session-delete-plan-${plan.id}`}
                    >
                      Supprimer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
