import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface AccessibilityViolation {
  type: string;
  count: number;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  prNumbers: number[];
}

interface ViolationsChartProps {
  violations: AccessibilityViolation[];
}

const severityColors = {
  critical: '#ef4444',
  serious: '#f97316',
  moderate: '#eab308',
  minor: '#22c55e'
};

const severityLabels = {
  critical: 'Critique',
  serious: 'Sérieux',
  moderate: 'Modéré',
  minor: 'Mineur'
};

export const ViolationsChart: React.FC<ViolationsChartProps> = ({ violations }) => {
  const chartData = violations.map(v => ({
    name: v.type,
    count: v.count,
    severity: v.severity
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Violations par Type
          <Badge variant="secondary">{violations.length} types détectés</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {violations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">✨ Aucune violation détectée</p>
            <p className="text-sm mt-2">Tous les tests d'accessibilité passent avec succès!</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs"
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Nombre de violations" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.severity]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Liste détaillée des violations */}
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">Détails des Violations</h4>
              {violations.map((violation, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: severityColors[violation.severity] }}
                    />
                    <div>
                      <p className="font-medium text-sm">{violation.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {violation.count} occurrence{violation.count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={violation.severity === 'critical' || violation.severity === 'serious' ? 'destructive' : 'secondary'}
                    >
                      {severityLabels[violation.severity]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      PRs: {violation.prNumbers.slice(0, 3).join(', ')}
                      {violation.prNumbers.length > 3 && `... +${violation.prNumbers.length - 3}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
