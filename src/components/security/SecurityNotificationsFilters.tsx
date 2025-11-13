import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface NotificationFilters {
  severity: 'all' | 'info' | 'warning' | 'critical';
  type: 'all' | 'mass_deletion' | 'unauthorized_access' | 'suspicious_activity' | 'system_alert';
  searchTerm: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  userEmail: string;
}

interface SecurityNotificationsFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
  onExportPDF: () => void;
  resultsCount: number;
}

export const SecurityNotificationsFilters = ({
  filters,
  onFiltersChange,
  onExportPDF,
  resultsCount,
}: SecurityNotificationsFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = (key: keyof NotificationFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: NotificationFilters = {
      severity: 'all',
      type: 'all',
      searchTerm: '',
      dateFrom: undefined,
      dateTo: undefined,
      userEmail: '',
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    localFilters.severity !== 'all' ||
    localFilters.type !== 'all' ||
    localFilters.searchTerm !== '' ||
    localFilters.dateFrom !== undefined ||
    localFilters.dateTo !== undefined ||
    localFilters.userEmail !== '';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* First row: Search and User */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans le titre ou message..."
                value={localFilters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Filtrer par email utilisateur..."
              value={localFilters.userEmail}
              onChange={(e) => updateFilter('userEmail', e.target.value)}
            />
          </div>

          {/* Second row: Severity, Type, Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={localFilters.severity}
              onValueChange={(value: any) => updateFilter('severity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sévérités</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={localFilters.type}
              onValueChange={(value: any) => updateFilter('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type d'alerte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="mass_deletion">Suppression massive</SelectItem>
                <SelectItem value="unauthorized_access">Accès non autorisé</SelectItem>
                <SelectItem value="suspicious_activity">Activité suspecte</SelectItem>
                <SelectItem value="system_alert">Alerte système</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !localFilters.dateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dateFrom ? (
                    format(localFilters.dateFrom, 'P', { locale: fr })
                  ) : (
                    'Date début'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateFrom}
                  onSelect={(date) => updateFilter('dateFrom', date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !localFilters.dateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dateTo ? (
                    format(localFilters.dateTo, 'P', { locale: fr })
                  ) : (
                    'Date fin'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateTo}
                  onSelect={(date) => updateFilter('dateTo', date)}
                  initialFocus
                  locale={fr}
                  disabled={(date) =>
                    localFilters.dateFrom ? date < localFilters.dateFrom : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              {resultsCount} notification{resultsCount > 1 ? 's' : ''} trouvée{resultsCount > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
