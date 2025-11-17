import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Target, AlertTriangle } from 'lucide-react';
import { PerformanceBudget } from '@shared/services/performanceAnalyticsService';

interface PerformanceBudgetsManagerProps {
  budgets: PerformanceBudget[];
  onCreateBudget: (budget: Omit<PerformanceBudget, 'id'>) => Promise<void>;
  onUpdateBudget: (id: string, updates: Partial<PerformanceBudget>) => Promise<void>;
}

export const PerformanceBudgetsManager: React.FC<PerformanceBudgetsManagerProps> = ({
  budgets,
  onCreateBudget,
  onUpdateBudget,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<PerformanceBudget | null>(null);
  const [formData, setFormData] = useState<Omit<PerformanceBudget, 'id'>>({
    name: '',
    metric_type: 'web_vital',
    metric_name: '',
    target_value: 0,
    warning_threshold: 0,
    critical_threshold: 0,
    active: true,
  });

  const metricTypes = [
    { value: 'web_vital', label: 'Web Vital' },
    { value: 'api_call', label: 'Appel API' },
    { value: 'database_query', label: 'Requête DB' },
    { value: 'custom', label: 'Personnalisé' },
  ];

  const webVitalMetrics = [
    { value: 'LCP', label: 'Largest Contentful Paint' },
    { value: 'FID', label: 'First Input Delay' },
    { value: 'CLS', label: 'Cumulative Layout Shift' },
    { value: 'TTFB', label: 'Time to First Byte' },
  ];

  const apiMetrics = [
    { value: 'response_time', label: 'Temps de réponse' },
    { value: 'error_rate', label: 'Taux d\'erreur' },
    { value: 'throughput', label: 'Débit' },
  ];

  const dbMetrics = [
    { value: 'execution_time', label: 'Temps d\'exécution' },
    { value: 'query_count', label: 'Nombre de requêtes' },
    { value: 'connection_time', label: 'Temps de connexion' },
  ];

  const getMetricOptions = (type: string) => {
    switch (type) {
      case 'web_vital':
        return webVitalMetrics;
      case 'api_call':
        return apiMetrics;
      case 'database_query':
        return dbMetrics;
      default:
        return [];
    }
  };

  const getUnit = (metricType: string, metricName: string) => {
    if (metricType === 'web_vital' && metricName === 'CLS') return 'score';
    if (metricType === 'api_call' && metricName === 'error_rate') return '%';
    if (metricType === 'api_call' && metricName === 'throughput') return 'req/s';
    return 'ms';
  };

  const handleCreateBudget = async () => {
    try {
      await onCreateBudget(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget?.id) return;
    
    try {
      await onUpdateBudget(editingBudget.id, formData);
      setEditingBudget(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  const handleToggleActive = async (budget: PerformanceBudget) => {
    if (!budget.id) return;
    
    try {
      await onUpdateBudget(budget.id, { active: !budget.active });
    } catch (error) {
      console.error('Failed to toggle budget:', error);
    }
  };

  const startEdit = (budget: PerformanceBudget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      metric_type: budget.metric_type,
      metric_name: budget.metric_name,
      target_value: budget.target_value,
      warning_threshold: budget.warning_threshold,
      critical_threshold: budget.critical_threshold,
      active: budget.active,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      metric_type: 'web_vital',
      metric_name: '',
      target_value: 0,
      warning_threshold: 0,
      critical_threshold: 0,
      active: true,
    });
  };

  const getBudgetStatus = (budget: PerformanceBudget) => {
    if (!budget.active) return { label: 'Inactif', color: 'bg-gray-100 text-gray-800' };
    return { label: 'Actif', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Budgets de Performance</h3>
          <p className="text-sm text-muted-foreground">
            Définissez et surveillez les seuils de performance critiques
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un Budget de Performance</DialogTitle>
              <DialogDescription>
                Définissez un nouveau budget pour surveiller une métrique spécifique
              </DialogDescription>
            </DialogHeader>
            <BudgetForm
              formData={formData}
              setFormData={setFormData}
              metricTypes={metricTypes}
              getMetricOptions={getMetricOptions}
              getUnit={getUnit}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateBudget}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des budgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budgets Configurés ({budgets.length})
          </CardTitle>
          <CardDescription>
            Gérez vos budgets de performance et leurs seuils d'alerte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Métrique</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Warning</TableHead>
                <TableHead>Critique</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => {
                const status = getBudgetStatus(budget);
                const unit = getUnit(budget.metric_type, budget.metric_name);
                
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{budget.metric_name}</div>
                        <div className="text-sm text-muted-foreground">{budget.metric_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>{budget.target_value}{unit}</TableCell>
                    <TableCell className="text-yellow-600">
                      {budget.warning_threshold}{unit}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {budget.critical_threshold}{unit}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={budget.active}
                          onCheckedChange={() => handleToggleActive(budget)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {budgets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Aucun budget configuré. Créez votre premier budget pour commencer la surveillance.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le Budget</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres du budget de performance
            </DialogDescription>
          </DialogHeader>
          <BudgetForm
            formData={formData}
            setFormData={setFormData}
            metricTypes={metricTypes}
            getMetricOptions={getMetricOptions}
            getUnit={getUnit}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBudget(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateBudget}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Composant formulaire réutilisable
interface BudgetFormProps {
  formData: Omit<PerformanceBudget, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<PerformanceBudget, 'id'>>>;
  metricTypes: Array<{ value: string; label: string }>;
  getMetricOptions: (type: string) => Array<{ value: string; label: string }>;
  getUnit: (metricType: string, metricName: string) => string;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  formData,
  setFormData,
  metricTypes,
  getMetricOptions,
  getUnit,
}) => {
  const unit = getUnit(formData.metric_type, formData.metric_name);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du budget</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ex: Budget LCP Homepage"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metric_type">Type de métrique</Label>
          <Select
            value={formData.metric_type}
            onValueChange={(value) => setFormData({ ...formData, metric_type: value, metric_name: '' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metric_name">Métrique</Label>
        <Select
          value={formData.metric_name}
          onValueChange={(value) => setFormData({ ...formData, metric_name: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une métrique" />
          </SelectTrigger>
          <SelectContent>
            {getMetricOptions(formData.metric_type).map((metric) => (
              <SelectItem key={metric.value} value={metric.value}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_value">Valeur cible ({unit})</Label>
          <Input
            id="target_value"
            type="number"
            value={formData.target_value}
            onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 2500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warning_threshold">Seuil warning ({unit})</Label>
          <Input
            id="warning_threshold"
            type="number"
            value={formData.warning_threshold}
            onChange={(e) => setFormData({ ...formData, warning_threshold: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 3000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="critical_threshold">Seuil critique ({unit})</Label>
          <Input
            id="critical_threshold"
            type="number"
            value={formData.critical_threshold}
            onChange={(e) => setFormData({ ...formData, critical_threshold: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 4000"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label htmlFor="active">Budget actif</Label>
      </div>

      {formData.warning_threshold <= formData.target_value && (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Le seuil warning devrait être supérieur à la valeur cible
        </div>
      )}

      {formData.critical_threshold <= formData.warning_threshold && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Le seuil critique devrait être supérieur au seuil warning
        </div>
      )}
    </div>
  );
};