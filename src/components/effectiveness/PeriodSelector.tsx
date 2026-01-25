import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import React from 'react';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface PeriodSelectorProps {
  period1: DateRange;
  period2: DateRange;
  onPeriod1Change: (period: DateRange) => void;
  onPeriod2Change: (period: DateRange) => void;
}

const getPredefinedRanges = (): { label: string; getValue: () => DateRange }[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      label: 'Cette semaine',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        return { start, end: today, label: 'Cette semaine' };
      },
    },
    {
      label: 'Semaine dernière',
      getValue: () => {
        const end = new Date(today);
        end.setDate(today.getDate() - today.getDay() - 1);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        return { start, end, label: 'Semaine dernière' };
      },
    },
    {
      label: 'Ce mois-ci',
      getValue: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start, end: today, label: 'Ce mois-ci' };
      },
    },
    {
      label: 'Mois dernier',
      getValue: () => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start, end, label: 'Mois dernier' };
      },
    },
    {
      label: '7 derniers jours',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        return { start, end: today, label: '7 derniers jours' };
      },
    },
    {
      label: '30 derniers jours',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - 30);
        return { start, end: today, label: '30 derniers jours' };
      },
    },
    {
      label: '90 derniers jours',
      getValue: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - 90);
        return { start, end: today, label: '90 derniers jours' };
      },
    },
  ];
};

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period1,
  period2,
  onPeriod1Change,
  onPeriod2Change,
}) => {
  const ranges = getPredefinedRanges();

  const handlePeriod1Select = (label: string) => {
    const range = ranges.find((r) => r.label === label);
    if (range) {
      onPeriod1Change(range.getValue());
    }
  };

  const handlePeriod2Select = (label: string) => {
    const range = ranges.find((r) => r.label === label);
    if (range) {
      onPeriod2Change(range.getValue());
    }
  };

  const formatDateRange = (range: DateRange) => {
    return `${range.start.toLocaleDateString('fr-FR')} - ${range.end.toLocaleDateString('fr-FR')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Comparaison de périodes
        </CardTitle>
        <CardDescription>
          Sélectionnez deux périodes pour comparer leurs performances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Période 1 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Période 1 (référence)
              </label>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Avant
              </span>
            </div>
            <Select value={period1.label} onValueChange={handlePeriod1Select}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                {ranges.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formatDateRange(period1)}
            </p>
          </div>

          {/* Période 2 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Période 2 (comparaison)
              </label>
              <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                Après
              </span>
            </div>
            <Select value={period2.label} onValueChange={handlePeriod2Select}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                {ranges.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formatDateRange(period2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
