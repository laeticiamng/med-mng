import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
    Clock,
    Download,
    Edit,
    Filter,
    RefreshCw,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { QuickEditModal } from './QuickEditModal';

interface ChangelogEntry {
  id: string;
  action_type: string;
  table_name: string;
  record_id: string;
  field_name?: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  created_at: string;
  profiles?: {
    display_name?: string;
    email?: string;
  };
}

export const ChangelogDashboard: React.FC = () => {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    table_name: '',
    action_type: '',
    search: ''
  });
  const [showQuickEdit, setShowQuickEdit] = useState(false);

  const fetchChangelog = async () => {
    setLoading(true);
    try {
      const { _data, error } = await supabase.functions.invoke('admin-quick-edit', {
        body: { action: 'get_changelog' }
      });

      if (error) throw error;

      if (_data.success) {
        setChangelog(_data.data);
      }
    } catch (error) {
      console.error('Erreur fetch changelog:', error);
      toast.error('Erreur lors du chargement du changelog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelog();
  }, []);

  const filteredChangelog = changelog.filter(entry => {
    if (filters.table_name && entry.table_name !== filters.table_name) return false;
    if (filters.action_type && entry.action_type !== filters.action_type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return entry.reason?.toLowerCase().includes(searchLower) ||
             entry.field_name?.toLowerCase().includes(searchLower) ||
             entry.record_id.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    const colors = {
      update: 'bg-primary text-primary-foreground',
      create: 'bg-success text-success-foreground',
      delete: 'bg-destructive text-destructive-foreground',
      correction: 'bg-warning text-warning-foreground'
    };
    return (
      <Badge className={colors[action as keyof typeof colors] || 'bg-muted text-muted-foreground'}>
        {action}
      </Badge>
    );
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const exportChangelog = () => {
    const csv = [
      ['Date', 'Action', 'Table', 'Enregistrement', 'Champ', 'Ancienne valeur', 'Nouvelle valeur', 'Raison', 'Utilisateur'].join(','),
      ...filteredChangelog.map(entry => [
        new Date(entry.created_at).toLocaleString(),
        entry.action_type,
        entry.table_name,
        entry.record_id,
        entry.field_name || '',
        formatValue(entry.old_value).replace(/,/g, ';'),
        formatValue(entry.new_value).replace(/,/g, ';'),
        entry.reason || '',
        entry.profiles?.display_name || entry.profiles?.email || 'Inconnu'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changelog-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📋 Historique des Modifications</h2>
          <p className="text-muted-foreground">
            Suivi complet de toutes les modifications administratives
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowQuickEdit(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Correction Rapide
          </Button>
          <Button variant="outline" size="sm" onClick={exportChangelog}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchChangelog} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Table</label>
              <Select
                value={filters.table_name}
                onValueChange={(value) => setFilters(prev => ({ ...prev, table_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les tables</SelectItem>
                  {Array.from(new Set(changelog.map(e => e.table_name))).map(table => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Action</label>
              <Select
                value={filters.action_type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, action_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les actions</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Recherche</label>
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des modifications */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Chargement de l'historique...</p>
          </div>
        ) : filteredChangelog.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucune modification trouvée</p>
            </CardContent>
          </Card>
        ) : (
          filteredChangelog.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getActionBadge(entry.action_type)}
                    <span className="font-medium">{entry.table_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {entry.record_id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                </div>

                {entry.field_name && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Champ modifié: {entry.field_name}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Ancienne valeur:</label>
                        <pre className="text-xs bg-destructive/10 p-2 rounded max-h-32 overflow-auto">
                          {formatValue(entry.old_value)}
                        </pre>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Nouvelle valeur:</label>
                        <pre className="text-xs bg-success/10 p-2 rounded max-h-32 overflow-auto">
                          {formatValue(entry.new_value)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {entry.reason && (
                  <div className="mt-3 p-3 bg-primary/10 rounded">
                    <p className="text-sm font-medium">Raison:</p>
                    <p className="text-sm">{entry.reason}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {entry.profiles?.display_name || entry.profiles?.email || 'Utilisateur inconnu'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <QuickEditModal
        isOpen={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        onSuccess={fetchChangelog}
      />
    </div>
  );
};