import { useState } from 'react';
import { Shield, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateCVSS, getPatchPriority, CVSSMetrics, metricLabels } from '@/utils/cvssCalculator';
import { useCVSSAssessments } from '@/hooks/useCVSSAssessments';

export const CVSSCalculator = () => {
  const { createAssessment, isCreating } = useCVSSAssessments();
  
  const [vulnerabilityName, setVulnerabilityName] = useState('');
  const [description, setDescription] = useState('');
  const [cveId, setCveId] = useState('');
  const [notes, setNotes] = useState('');
  
  const [metrics, setMetrics] = useState<CVSSMetrics>({
    attackVector: 'N',
    attackComplexity: 'L',
    privilegesRequired: 'N',
    userInteraction: 'N',
    scope: 'U',
    confidentialityImpact: 'N',
    integrityImpact: 'N',
    availabilityImpact: 'N',
    exploitCodeMaturity: 'X',
    remediationLevel: 'X',
    reportConfidence: 'X',
    confidentialityRequirement: 'X',
    integrityRequirement: 'X',
    availabilityRequirement: 'X',
  });

  const score = calculateCVSS(metrics);
  const priority = getPatchPriority(score);

  const updateMetric = <K extends keyof CVSSMetrics>(key: K, value: CVSSMetrics[K]) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!vulnerabilityName) {
      return;
    }
    
    createAssessment({
      vulnerability_name: vulnerabilityName,
      description,
      cve_id: cveId,
      metrics,
      notes,
    });
    
    // Reset form
    setVulnerabilityName('');
    setDescription('');
    setCveId('');
    setNotes('');
    setMetrics({
      attackVector: 'N',
      attackComplexity: 'L',
      privilegesRequired: 'N',
      userInteraction: 'N',
      scope: 'U',
      confidentialityImpact: 'N',
      integrityImpact: 'N',
      availabilityImpact: 'N',
      exploitCodeMaturity: 'X',
      remediationLevel: 'X',
      reportConfidence: 'X',
      confidentialityRequirement: 'X',
      integrityRequirement: 'X',
      availabilityRequirement: 'X',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Score CVSS v3.1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-primary to-accent rounded-lg text-primary-foreground">
                <div className="text-sm opacity-90 mb-2">Score de Base</div>
                <div className="text-5xl font-bold">{score.baseScore}</div>
                <Badge variant={getSeverityColor(score.baseSeverity)} className="mt-3">
                  {score.baseSeverity}
                </Badge>
              </div>
              
              {score.temporalScore && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Score Temporel</div>
                  <div className="text-3xl font-bold text-foreground">{score.temporalScore}</div>
                </div>
              )}
              
              {score.environmentalScore && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Score Environnemental</div>
                  <div className="text-3xl font-bold text-foreground">{score.environmentalScore}</div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm font-medium mb-2">Priorisation du Patch</div>
                <Badge variant={priority.color as any} className="mb-2">{priority.label}</Badge>
                <div className="text-sm text-muted-foreground">
                  Délai: {priority.deadline} jour{priority.deadline > 1 ? 's' : ''}
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm font-medium mb-2">Métriques Calculées</div>
                <div className="space-y-1 text-sm">
                  <div>Impact: <span className="font-mono">{score.impactScore}</span></div>
                  <div>Exploitabilité: <span className="font-mono">{score.exploitabilityScore}</span></div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="text-xs font-medium mb-1">Vecteur CVSS</div>
                <code className="text-xs break-all">{score.vectorString}</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations sur la Vulnérabilité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vuln-name">Nom de la Vulnérabilité *</Label>
            <Input
              id="vuln-name"
              value={vulnerabilityName}
              onChange={(e) => setVulnerabilityName(e.target.value)}
              placeholder="Ex: SQL Injection in login form"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cve-id">CVE ID</Label>
            <Input
              id="cve-id"
              value={cveId}
              onChange={(e) => setCveId(e.target.value)}
              placeholder="Ex: CVE-2024-1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez la vulnérabilité..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Base Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques de Base</CardTitle>
          <CardDescription>Caractéristiques intrinsèques de la vulnérabilité</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Attack Vector (AV)</Label>
            <Select value={metrics.attackVector} onValueChange={(v: any) => updateMetric('attackVector', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.attackVector).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Attack Complexity (AC)</Label>
            <Select value={metrics.attackComplexity} onValueChange={(v: any) => updateMetric('attackComplexity', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.attackComplexity).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Privileges Required (PR)</Label>
            <Select value={metrics.privilegesRequired} onValueChange={(v: any) => updateMetric('privilegesRequired', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.privilegesRequired).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>User Interaction (UI)</Label>
            <Select value={metrics.userInteraction} onValueChange={(v: any) => updateMetric('userInteraction', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.userInteraction).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scope (S)</Label>
            <Select value={metrics.scope} onValueChange={(v: any) => updateMetric('scope', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.scope).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Confidentiality Impact (C)</Label>
            <Select value={metrics.confidentialityImpact} onValueChange={(v: any) => updateMetric('confidentialityImpact', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.impact).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Integrity Impact (I)</Label>
            <Select value={metrics.integrityImpact} onValueChange={(v: any) => updateMetric('integrityImpact', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.impact).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Availability Impact (A)</Label>
            <Select value={metrics.availabilityImpact} onValueChange={(v: any) => updateMetric('availabilityImpact', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels.impact).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des notes supplémentaires..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={!vulnerabilityName || isCreating}
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Enregistrer l'Évaluation
        </Button>
      </div>
    </div>
  );
};
