interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  createdAt: string;
  closedAt?: string;
  merged: boolean;
}

interface AccessibilityViolation {
  type: string;
  count: number;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  prNumbers: number[];
}

interface DeveloperMetrics {
  login: string;
  totalPRs: number;
  passedPRs: number;
  failedPRs: number;
  avgFixTime: number;
  conformityRate: number;
}

interface AccessibilityMetrics {
  blockedPRs: PullRequest[];
  violations: AccessibilityViolation[];
  developers: DeveloperMetrics[];
  avgFixTime: number;
  totalPRs: number;
  passedPRs: number;
  failedPRs: number;
  conformityRate: number;
}

/**
 * Génère un timestamp formaté pour les noms de fichiers
 */
const generateTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
};

/**
 * Échappe les caractères spéciaux pour CSV
 */
const escapeCsvValue = (value: string | number): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Exporte les métriques globales en CSV
 */
const exportGlobalMetricsCSV = (metrics: AccessibilityMetrics): string => {
  const timestamp = new Date().toISOString();
  
  let csv = 'RAPPORT D\'ACCESSIBILITÉ - MÉTRIQUES GLOBALES\n';
  csv += `Généré le,${timestamp}\n\n`;
  
  csv += 'Métrique,Valeur\n';
  csv += `Total PRs analysées,${metrics.totalPRs}\n`;
  csv += `PRs conformes,${metrics.passedPRs}\n`;
  csv += `PRs échouées,${metrics.failedPRs}\n`;
  csv += `PRs bloquées,${metrics.blockedPRs.length}\n`;
  csv += `Taux de conformité,%${metrics.conformityRate.toFixed(2)}\n`;
  csv += `Temps de correction moyen (heures),${metrics.avgFixTime.toFixed(2)}\n`;
  
  return csv;
};

/**
 * Exporte les violations en CSV
 */
const exportViolationsCSV = (violations: AccessibilityViolation[]): string => {
  let csv = '\n\nVIOLATIONS PAR TYPE\n';
  csv += 'Type de violation,Nombre d\'occurrences,Sévérité,PRs concernées\n';
  
  violations.forEach(violation => {
    const prList = violation.prNumbers.join(';');
    csv += `${escapeCsvValue(violation.type)},${violation.count},${violation.severity},${prList}\n`;
  });
  
  return csv;
};

/**
 * Exporte les PRs bloquées en CSV
 */
const exportBlockedPRsCSV = (blockedPRs: PullRequest[]): string => {
  let csv = '\n\nPRS BLOQUÉES\n';
  csv += 'Numéro PR,Titre,Auteur,Date de création,Statut\n';
  
  blockedPRs.forEach(pr => {
    const createdDate = new Date(pr.createdAt).toLocaleDateString('fr-FR');
    const status = pr.merged ? 'Mergée' : pr.closedAt ? 'Fermée' : 'Ouverte';
    csv += `#${pr.number},${escapeCsvValue(pr.title)},${pr.author},${createdDate},${status}\n`;
  });
  
  return csv;
};

/**
 * Exporte les métriques par développeur en CSV
 */
const exportDevelopersCSV = (developers: DeveloperMetrics[]): string => {
  let csv = '\n\nMÉTRIQUES PAR DÉVELOPPEUR\n';
  csv += 'Développeur,Total PRs,PRs passées,PRs échouées,Taux de conformité (%),Temps moyen de correction (h)\n';
  
  developers.forEach(dev => {
    csv += `${dev.login},${dev.totalPRs},${dev.passedPRs},${dev.failedPRs},${dev.conformityRate.toFixed(2)},${dev.avgFixTime.toFixed(2)}\n`;
  });
  
  return csv;
};

/**
 * Export complet en CSV
 */
export const exportMetricsToCSV = (metrics: AccessibilityMetrics): void => {
  let csvContent = exportGlobalMetricsCSV(metrics);
  csvContent += exportViolationsCSV(metrics.violations);
  csvContent += exportBlockedPRsCSV(metrics.blockedPRs);
  csvContent += exportDevelopersCSV(metrics.developers);
  
  // Créer le blob et télécharger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp = generateTimestamp();
  link.setAttribute('href', url);
  link.setAttribute('download', `accessibility-metrics-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export complet en JSON
 */
export const exportMetricsToJSON = (metrics: AccessibilityMetrics): void => {
  const timestamp = new Date().toISOString();
  
  const jsonData = {
    metadata: {
      generatedAt: timestamp,
      reportType: 'Accessibility Metrics Report',
      version: '1.0.0'
    },
    summary: {
      totalPRs: metrics.totalPRs,
      passedPRs: metrics.passedPRs,
      failedPRs: metrics.failedPRs,
      blockedPRsCount: metrics.blockedPRs.length,
      conformityRate: parseFloat(metrics.conformityRate.toFixed(2)),
      avgFixTimeHours: parseFloat(metrics.avgFixTime.toFixed(2))
    },
    violations: metrics.violations.map(v => ({
      type: v.type,
      occurrences: v.count,
      severity: v.severity,
      affectedPRs: v.prNumbers
    })),
    blockedPRs: metrics.blockedPRs.map(pr => ({
      number: pr.number,
      title: pr.title,
      author: pr.author,
      createdAt: pr.createdAt,
      closedAt: pr.closedAt,
      merged: pr.merged,
      status: pr.merged ? 'merged' : pr.closedAt ? 'closed' : 'open'
    })),
    developerMetrics: metrics.developers.map(dev => ({
      username: dev.login,
      totalPRs: dev.totalPRs,
      passedPRs: dev.passedPRs,
      failedPRs: dev.failedPRs,
      conformityRate: parseFloat(dev.conformityRate.toFixed(2)),
      avgFixTimeHours: parseFloat(dev.avgFixTime.toFixed(2))
    }))
  };
  
  // Créer le blob et télécharger
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp2 = generateTimestamp();
  link.setAttribute('href', url);
  link.setAttribute('download', `accessibility-metrics-${timestamp2}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export simplifié pour partage rapide (CSV léger)
 */
export const exportSummaryToCSV = (metrics: AccessibilityMetrics): void => {
  const timestamp = new Date().toISOString();
  
  let csv = 'RÉSUMÉ ACCESSIBILITÉ\n';
  csv += `Date,${timestamp}\n\n`;
  
  csv += 'Indicateur,Valeur\n';
  csv += `Taux de conformité,${metrics.conformityRate.toFixed(1)}%\n`;
  csv += `PRs conformes / Total,${metrics.passedPRs} / ${metrics.totalPRs}\n`;
  csv += `PRs bloquées,${metrics.blockedPRs.length}\n`;
  csv += `Types de violations,${metrics.violations.length}\n`;
  csv += `Développeurs actifs,${metrics.developers.length}\n`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp2 = generateTimestamp();
  link.setAttribute('href', url);
  link.setAttribute('download', `accessibility-summary-${timestamp2}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export mensuel formaté pour rapport (CSV structuré)
 */
export const exportMonthlyReport = (metrics: AccessibilityMetrics): void => {
  const now = new Date();
  const monthYear = now.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  
  let csv = `RAPPORT MENSUEL D'ACCESSIBILITÉ - ${monthYear}\n`;
  csv += `Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}\n\n`;
  
  csv += '═══════════════════════════════════════════════════\n';
  csv += '1. SYNTHÈSE EXÉCUTIVE\n';
  csv += '═══════════════════════════════════════════════════\n\n';
  
  csv += 'Indicateur clé,Valeur,Objectif,Status\n';
  csv += `Taux de conformité,${metrics.conformityRate.toFixed(1)}%,≥ 80%,${metrics.conformityRate >= 80 ? '✓ Atteint' : '✗ Non atteint'}\n`;
  csv += `PRs bloquées,${metrics.blockedPRs.length},≤ 5,${metrics.blockedPRs.length <= 5 ? '✓ Atteint' : '✗ Non atteint'}\n`;
  csv += `Temps de correction,${metrics.avgFixTime.toFixed(1)}h,≤ 24h,${metrics.avgFixTime <= 24 ? '✓ Atteint' : '✗ Non atteint'}\n\n`;
  
  csv += '═══════════════════════════════════════════════════\n';
  csv += '2. VIOLATIONS DÉTECTÉES\n';
  csv += '═══════════════════════════════════════════════════\n\n';
  
  if (metrics.violations.length > 0) {
    csv += 'Rang,Type de violation,Occurrences,Sévérité,Impact\n';
    metrics.violations.forEach((violation, index) => {
      const impact = violation.severity === 'critical' ? 'Critique' : 
                     violation.severity === 'serious' ? 'Élevé' :
                     violation.severity === 'moderate' ? 'Moyen' : 'Faible';
      csv += `${index + 1},${escapeCsvValue(violation.type)},${violation.count},${violation.severity},${impact}\n`;
    });
  } else {
    csv += 'Aucune violation détectée ce mois-ci ✓\n';
  }
  
  csv += '\n═══════════════════════════════════════════════════\n';
  csv += '3. PERFORMANCE PAR DÉVELOPPEUR\n';
  csv += '═══════════════════════════════════════════════════\n\n';
  
  csv += 'Rang,Développeur,Conformité,PRs totales,Note\n';
  metrics.developers.forEach((dev, index) => {
    const note = dev.conformityRate >= 90 ? 'Excellent' :
                 dev.conformityRate >= 70 ? 'Bon' : 'À améliorer';
    csv += `${index + 1},${dev.login},${dev.conformityRate.toFixed(1)}%,${dev.totalPRs},${note}\n`;
  });
  
  csv += '\n═══════════════════════════════════════════════════\n';
  csv += '4. RECOMMANDATIONS\n';
  csv += '═══════════════════════════════════════════════════\n\n';
  
  if (metrics.conformityRate < 80) {
    csv += '• PRIORITÉ HAUTE: Le taux de conformité est sous l\'objectif de 80%\n';
    csv += '  → Formation recommandée sur les standards WCAG/RGAA\n';
  }
  if (metrics.blockedPRs.length > 5) {
    csv += `• ATTENTION: ${metrics.blockedPRs.length} PRs sont actuellement bloquées\n`;
    csv += '  → Revue urgente des PRs bloquées nécessaire\n';
  }
  if (metrics.avgFixTime > 24) {
    csv += `• Le temps moyen de correction (${metrics.avgFixTime.toFixed(1)}h) dépasse l\'objectif\n`;
    csv += '  → Optimiser le processus de correction des violations\n';
  }
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const filename = `rapport-accessibilite-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
