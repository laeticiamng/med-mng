import logger from '@/lib/logger';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    table_name: string;
    record_id: string;
    field_name: string;
    current_value: any;
  };
}

export const QuickEditModal: React.FC<QuickEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [formData, setFormData] = useState({
    table_name: initialData?.table_name || '',
    record_id: initialData?.record_id || '',
    field_name: initialData?.field_name || '',
    new_value: initialData?.current_value || '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-quick-edit', {
        body: {
          action: 'update',
          ...formData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Modification appliquée avec succès');
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      logger.error('Erreur quick edit:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const commonTables = [
    'edn_items_immersive',
    'ecos_situations_complete',
    'oic_competences',
    'profiles',
    'med_mng_songs'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>✏️ Correction Rapide</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="table_name">Table</Label>
              <Select
                value={formData.table_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, table_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une table" />
                </SelectTrigger>
                <SelectContent>
                  {commonTables.map(table => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="record_id">ID Enregistrement</Label>
              <Input
                id="record_id"
                value={formData.record_id}
                onChange={(e) => setFormData(prev => ({ ...prev, record_id: e.target.value }))}
                placeholder="UUID de l'enregistrement"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="field_name">Champ à modifier</Label>
            <Input
              id="field_name"
              value={formData.field_name}
              onChange={(e) => setFormData(prev => ({ ...prev, field_name: e.target.value }))}
              placeholder="Nom du champ (ex: title, description...)"
              required
            />
          </div>

          <div>
            <Label htmlFor="new_value">Nouvelle valeur</Label>
            <Textarea
              id="new_value"
              value={formData.new_value}
              onChange={(e) => setFormData(prev => ({ ...prev, new_value: e.target.value }))}
              placeholder="Nouvelle valeur pour le champ"
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="reason">Raison de la modification</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Pourquoi cette modification ? (optionnel)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Application...' : 'Appliquer la modification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};