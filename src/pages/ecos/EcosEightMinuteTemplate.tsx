import React, { useMemo, useState } from 'react';
import { LucideIcon, Printer } from 'lucide-react';
import { scenarioData } from '@/data/ecosData';
import Timer from '@/components/Timer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formatTimestamp = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

type ScenarioStep = typeof scenarioData.steps[number];

const resolveStepItems = (step: ScenarioStep): string[] => {
  if (Array.isArray(step.questions)) {
    return step.questions;
  }
  if (Array.isArray(step.actions)) {
    return step.actions;
  }
  if (Array.isArray(step.elements)) {
    return step.elements;
  }
  return [];
};

const resolveStepLabel = (step: ScenarioStep) => {
  if (step.questions) {
    return 'Questions clés';
  }
  if (step.actions) {
    return 'Actions attendues';
  }
  if (step.elements) {
    return 'Synthèse à délivrer';
  }
  return 'Points clés';
};

const getStepIcon = (step: ScenarioStep): LucideIcon | undefined => step.icon;

const EcosEightMinuteTemplate: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const generatedAt = useMemo(() => new Date(), []);
  const activeStep = scenarioData.steps[activeStepIndex];
  const StepIcon = getStepIcon(activeStep);
  const items = resolveStepItems(activeStep);
  const stepLabel = resolveStepLabel(activeStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white print:bg-white print:text-black">
      <div className="print-area print-surface pt-6 pb-16">
        <div className="container mx-auto px-4 lg:px-8 space-y-8 print:px-0">
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl print:bg-white print:border-slate-300 print:shadow-none print:backdrop-blur-none">
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 print:p-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-emerald-200/80 font-medium print:text-black">Gabarit ECOS 8 minutes</p>
                <h1 className="text-3xl font-bold mt-2 text-white print:text-black">{scenarioData.title}</h1>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 text-sm text-emerald-100 print:text-black">
                <div>
                  <span className="font-semibold text-white/90 print:text-black">ID Item</span>
                  <p className="tabular-nums">{scenarioData.id}</p>
                </div>
                <div>
                  <span className="font-semibold text-white/90 print:text-black">Horodatage</span>
                  <p className="tabular-nums">{formatTimestamp(generatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 bg-white/5 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between print:bg-transparent print:border-slate-200 print:p-4">
              <div className="text-sm text-emerald-100 max-w-2xl leading-relaxed print:text-black">
                Retrouvez la structure orale standard « Je dis / Je fais / Je conclus ». Sélectionnez un item pour afficher sa fiche détaillée, et utilisez la minuterie pour garder le rythme imposé de 8 minutes.
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => window.print()}
                className="gap-2 text-white border-white/30 hover:bg-white/10 print:hidden"
              >
                <Printer className="h-4 w-4" />
                Imprimer la fiche
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <div className="space-y-6">
              <Timer label="Minuterie 8 minutes" className="print:border print:border-slate-300" />

              <Card className="rounded-2xl bg-white/10 border border-white/10 shadow-xl backdrop-blur-xl print:bg-white print:border-slate-300 print:shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-white print:text-black">Navigation par item</CardTitle>
                  <CardDescription className="text-emerald-100/80 text-sm print:text-black">
                    Un clic affiche instantanément le gabarit de l'item sélectionné.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scenarioData.steps.map((step, index) => {
                    const Icon = getStepIcon(step);
                    const isActive = index === activeStepIndex;
                    return (
                      <button
                        key={step.title}
                        type="button"
                        onClick={() => setActiveStepIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-2xl border px-4 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-slate-900',
                          isActive
                            ? 'border-emerald-300/80 bg-emerald-400/20 text-white shadow-lg'
                            : 'border-white/10 bg-white/5 text-emerald-100 hover:bg-white/10',
                          'print:border-slate-300 print:bg-white print:text-black print:shadow-none'
                        )}
                        aria-pressed={isActive}
                      >
                        {Icon && (
                          <span className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm',
                            isActive ? 'text-white' : 'text-emerald-100',
                            'print:text-black print:bg-slate-100'
                          )}>
                            <Icon className="h-5 w-5" />
                          </span>
                        )}
                        <div className="flex-1 text-left">
                          <p className="text-lg font-semibold tracking-tight print:text-black">{step.title}</p>
                          <p className="text-sm text-emerald-100/80 print:text-black">{step.subtitle}</p>
                        </div>
                        {isActive && (
                          <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-200/40 print:bg-slate-100 print:text-black print:border-slate-300">
                            Actif
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden print:bg-white print:border-slate-300 print:shadow-none">
              <CardHeader className="space-y-4 border-b border-white/10 bg-white/5 print:bg-transparent print:border-slate-200">
                <div className="flex items-center gap-3">
                  {StepIcon && (
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-100 print:bg-slate-100 print:text-black">
                      <StepIcon className="h-6 w-6" />
                    </span>
                  )}
                  <div>
                    <CardTitle className="text-2xl text-white print:text-black">{activeStep.title}</CardTitle>
                    <CardDescription className="text-emerald-100/80 text-base print:text-black">
                      {activeStep.subtitle}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-emerald-100/80 print:text-black">
                  <Badge variant="secondary" className="bg-white/10 border-white/10 text-white/90 print:bg-slate-100 print:text-black print:border-slate-300">
                    Scénario {scenarioData.specialty}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 border-white/10 text-white/90 print:bg-slate-100 print:text-black print:border-slate-300">
                    Item {activeStepIndex + 1} sur {scenarioData.steps.length}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 border-white/10 text-white/90 print:bg-slate-100 print:text-black print:border-slate-300">
                    Temps restant: 8 min
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 print:p-4">
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-white tracking-tight print:text-black">{stepLabel}</h2>
                  <ul className="space-y-2 text-sm text-emerald-100/90 leading-relaxed print:text-black">
                    {items.map((content, index) => (
                      <li
                        key={`${activeStep.title}-${index}`}
                        className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3 border border-white/5 print:bg-white print:border-slate-200"
                      >
                        <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-emerald-400/20 text-emerald-100 text-xs font-semibold tabular-nums print:bg-slate-100 print:text-black">
                          {index + 1}
                        </span>
                        <p className="flex-1 text-base leading-relaxed text-white/90 print:text-black">{content}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="grid gap-3 text-sm text-emerald-100/80 print:text-black">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 leading-relaxed print:bg-white print:border-slate-200">
                    <h3 className="text-sm font-semibold uppercase tracking-wide mb-2 text-emerald-100 print:text-black">Conseils rapides</h3>
                    <p>
                      Reformulez brièvement les éléments clés avant de conclure. Respirez entre chaque partie pour rythmer votre passage et valider mentalement que vous avez couvert les items essentiels.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 leading-relaxed print:bg-white print:border-slate-200">
                    <h3 className="text-sm font-semibold uppercase tracking-wide mb-2 text-emerald-100 print:text-black">Bonnes pratiques</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Annoncez la structure dès le départ pour rassurer le jury.</li>
                      <li>Reliez chaque action à une justification clinique concise.</li>
                      <li>Concluez en proposant une conduite à tenir hiérarchisée.</li>
                    </ul>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosEightMinuteTemplate;
