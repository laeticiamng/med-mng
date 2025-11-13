import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface QualityThreshold {
  id: string;
  project_name: string;
  bugs_threshold: number;
  vulnerabilities_threshold: number;
  code_smells_threshold: number;
  coverage_threshold: number;
  maintainability_threshold: string;
  security_threshold: string;
  notify_on_critical: boolean;
  notify_on_high: boolean;
  notify_on_medium: boolean;
}

export const ThresholdSettings: React.FC = () => {
  const [thresholds, setThresholds] = useState<QualityThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quality_thresholds')
        .select('*')
        .order('project_name');

      if (error) throw error;
      setThresholds(data || []);
    } catch (err) {
      console.error('Error loading thresholds:', err);
      toast.error('Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  const createThreshold = async () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const { error } = await supabase
        .from('quality_thresholds')
        .insert({ project_name: newProjectName.trim() });

      if (error) throw error;

      toast.success('Threshold configuration created');
      setNewProjectName('');
      loadThresholds();
    } catch (err: any) {
      console.error('Error creating threshold:', err);
      toast.error('Failed to create threshold: ' + err.message);
    }
  };

  const updateThreshold = async (threshold: QualityThreshold) => {
    try {
      const { error } = await supabase
        .from('quality_thresholds')
        .update({
          bugs_threshold: threshold.bugs_threshold,
          vulnerabilities_threshold: threshold.vulnerabilities_threshold,
          code_smells_threshold: threshold.code_smells_threshold,
          coverage_threshold: threshold.coverage_threshold,
          maintainability_threshold: threshold.maintainability_threshold,
          security_threshold: threshold.security_threshold,
          notify_on_critical: threshold.notify_on_critical,
          notify_on_high: threshold.notify_on_high,
          notify_on_medium: threshold.notify_on_medium,
        })
        .eq('id', threshold.id);

      if (error) throw error;

      toast.success('Threshold updated successfully');
    } catch (err: any) {
      console.error('Error updating threshold:', err);
      toast.error('Failed to update threshold: ' + err.message);
    }
  };

  const handleFieldChange = (id: string, field: keyof QualityThreshold, value: any) => {
    setThresholds(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quality Thresholds</CardTitle>
              <CardDescription>
                Configure alert thresholds for each project
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadThresholds}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="New project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <Button onClick={createThreshold}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>

          <div className="space-y-6">
            {thresholds.map((threshold) => (
              <Card key={threshold.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{threshold.project_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Bugs Threshold</Label>
                        <Input
                          type="number"
                          value={threshold.bugs_threshold}
                          onChange={(e) =>
                            handleFieldChange(threshold.id, 'bugs_threshold', parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Vulnerabilities Threshold</Label>
                        <Input
                          type="number"
                          value={threshold.vulnerabilities_threshold}
                          onChange={(e) =>
                            handleFieldChange(threshold.id, 'vulnerabilities_threshold', parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Code Smells Threshold</Label>
                        <Input
                          type="number"
                          value={threshold.code_smells_threshold}
                          onChange={(e) =>
                            handleFieldChange(threshold.id, 'code_smells_threshold', parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Coverage Threshold (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={threshold.coverage_threshold}
                          onChange={(e) =>
                            handleFieldChange(threshold.id, 'coverage_threshold', parseFloat(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Maintainability Threshold</Label>
                        <Input
                          value={threshold.maintainability_threshold}
                          onChange={(e) =>
                            handleFieldChange(threshold.id, 'maintainability_threshold', e.target.value)
                          }
                          placeholder="A, B, C, D, E"
                        />
                      </div>
                      <div>
                        <Label>Security Threshold</Label>
                        <Input
                          value={threshold.security_threshold}
                          onChange={(e) =>
                            handleFieldChange(threshold.id, 'security_threshold', e.target.value)
                          }
                          placeholder="A, B, C, D, E"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Label>Notify on Critical</Label>
                        <Switch
                          checked={threshold.notify_on_critical}
                          onCheckedChange={(checked) =>
                            handleFieldChange(threshold.id, 'notify_on_critical', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Notify on High</Label>
                        <Switch
                          checked={threshold.notify_on_high}
                          onCheckedChange={(checked) =>
                            handleFieldChange(threshold.id, 'notify_on_high', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Notify on Medium</Label>
                        <Switch
                          checked={threshold.notify_on_medium}
                          onCheckedChange={(checked) =>
                            handleFieldChange(threshold.id, 'notify_on_medium', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => updateThreshold(threshold)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
