import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Progress } from '@/components/ui/progress';
import {
  verifyCompleteEDNCompleteness,
  exportCompletenessReportToCSV,
  getItemsWithoutOICA,
  getItemsWithoutOICB,
  getItemsWithoutParoles,
  getItemsWithoutQuiz,
  GlobalCompletenessReport,
  ItemCompletenessDetail
} from '../../../../../packages/shared/src/utils/verifyCompleteCompleteness';
import { Loader2, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const CompleteCompletenessVerification = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GlobalCompletenessReport | null>(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(true);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await verifyCompleteEDNCompleteness();
      setReport(result);
    } catch (error) {
      console.error('Erreur vérification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;

    const csv = exportCompletenessReportToCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edn-completeness-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (hasElement: boolean) => {
    return hasElement ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const itemsToDisplay = report
    ? showIncompleteOnly
      ? report.incomplete_items_details
      : report.items_details
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PremiumCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔍 Vérification Complète Item par Item
        </h2>
        <p className="text-gray-600 mb-6">
          Analyse détaillée de la complétude de chaque item EDN avec toutes ses compétences OIC.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={handleVerify}
            disabled={loading}
            size="lg"
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              '🔍 Lancer la Vérification Complète'
            )}
          </Button>

          {report && (
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </PremiumCard>

      {/* Global Stats */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PremiumCard variant="elevated" className="p-6">
              <div className="text-3xl font-bold text-blue-600">{report.total_items}</div>
              <div className="text-sm text-gray-600">Items EDN Total</div>
            </PremiumCard>

            <PremiumCard variant="elevated" className="p-6">
              <div className="text-3xl font-bold text-green-600">{report.complete_items}</div>
              <div className="text-sm text-gray-600">Items Complets (≥85%)</div>
              <div className="text-xs text-gray-500 mt-1">
                {((report.complete_items / report.total_items) * 100).toFixed(1)}%
              </div>
            </PremiumCard>

            <PremiumCard variant="elevated" className="p-6">
              <div className="text-3xl font-bold text-red-600">{report.incomplete_items}</div>
              <div className="text-sm text-gray-600">Items Incomplets</div>
              <div className="text-xs text-gray-500 mt-1">
                {((report.incomplete_items / report.total_items) * 100).toFixed(1)}%
              </div>
            </PremiumCard>

            <PremiumCard variant="elevated" className="p-6">
              <div className="text-3xl font-bold text-purple-600">
                {report.average_completeness.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Score Moyen</div>
            </PremiumCard>
          </div>

          {/* Detailed Stats */}
          <PremiumCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📊 Statistiques Détaillées
            </h3>

            <div className="space-y-4">
              {/* OIC Rang A */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Compétences OIC Rang A</span>
                  <span>{report.items_with_all_oic_a}/{report.total_items}</span>
                </div>
                <Progress
                  value={(report.items_with_all_oic_a / report.total_items) * 100}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((report.items_with_all_oic_a / report.total_items) * 100).toFixed(1)}%
                </div>
              </div>

              {/* OIC Rang B */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Compétences OIC Rang B</span>
                  <span>{report.items_with_all_oic_b}/{report.total_items}</span>
                </div>
                <Progress
                  value={(report.items_with_all_oic_b / report.total_items) * 100}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((report.items_with_all_oic_b / report.total_items) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Paroles Rang A */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Paroles Rang A</span>
                  <span>{report.items_with_paroles_a}/{report.total_items}</span>
                </div>
                <Progress
                  value={(report.items_with_paroles_a / report.total_items) * 100}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((report.items_with_paroles_a / report.total_items) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Paroles Rang B */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Paroles Rang B</span>
                  <span>{report.items_with_paroles_b}/{report.total_items}</span>
                </div>
                <Progress
                  value={(report.items_with_paroles_b / report.total_items) * 100}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((report.items_with_paroles_b / report.total_items) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Paroles Rang AB */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Paroles Rang A+B</span>
                  <span>{report.items_with_paroles_ab}/{report.total_items}</span>
                </div>
                <Progress
                  value={(report.items_with_paroles_ab / report.total_items) * 100}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((report.items_with_paroles_ab / report.total_items) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Quiz */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Quiz</span>
                  <span>{report.items_with_quiz}/{report.total_items}</span>
                </div>
                <Progress
                  value={(report.items_with_quiz / report.total_items) * 100}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((report.items_with_quiz / report.total_items) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Comics */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Bandes Dessinées</span>
                  <span>{report.items_with_comic}/{report.total_items}</span>
                </div>
                <Progress
                  value={(report.items_with_comic / report.total_items) * 100}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((report.items_with_comic / report.total_items) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Items List */}
          <PremiumCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                📋 Détails par Item
              </h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showIncompleteOnly}
                    onChange={(e) => setShowIncompleteOnly(e.target.checked)}
                    className="rounded"
                  />
                  Incomplets uniquement
                </label>
                <span className="text-sm text-gray-600">
                  {itemsToDisplay.length} item(s)
                </span>
              </div>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {itemsToDisplay.map((item, index) => (
                <AccordionItem key={item.item_code} value={item.item_code}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center gap-2 flex-1">
                        {item.is_complete ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        )}
                        <div className="text-left">
                          <div className="font-medium">{item.item_code} - {item.title}</div>
                          {item.specialite && (
                            <div className="text-xs text-gray-500">{item.specialite}</div>
                          )}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(item.completeness_score)}`}>
                        {item.completeness_score}%
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="pl-9 pt-2 space-y-3">
                      {/* Compétences OIC */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.oic_competences_rang_a.complete)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">Compétences OIC Rang A</div>
                            <div className="text-xs text-gray-600">
                              {item.oic_competences_rang_a.count} compétence(s)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.oic_competences_rang_b.complete)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">Compétences OIC Rang B</div>
                            <div className="text-xs text-gray-600">
                              {item.oic_competences_rang_b.count} compétence(s)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Paroles */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.has_paroles_rang_a)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">Paroles Rang A</div>
                            <div className="text-xs text-gray-600">
                              {item.paroles_lines_a} ligne(s)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.has_paroles_rang_b)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">Paroles Rang B</div>
                            <div className="text-xs text-gray-600">
                              {item.paroles_lines_b} ligne(s)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.has_paroles_rang_ab)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">Paroles Rang A+B</div>
                            <div className="text-xs text-gray-600">
                              {item.paroles_lines_ab} ligne(s)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quiz & Comic */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.has_quiz)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">Quiz</div>
                            <div className="text-xs text-gray-600">
                              {item.quiz_questions_count} question(s)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.has_comic)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">Bande Dessinée</div>
                            <div className="text-xs text-gray-600">
                              {item.comic_panels_count} panneau(x)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Missing Elements */}
                      {item.missing_elements.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="text-sm font-medium text-yellow-800 mb-1">
                            ⚠️ Éléments manquants:
                          </div>
                          <div className="text-xs text-yellow-700">
                            {item.missing_elements.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </PremiumCard>
        </>
      )}
    </div>
  );
};
