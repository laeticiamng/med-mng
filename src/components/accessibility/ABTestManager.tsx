import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FlaskConical, Trophy, TrendingUp, Calendar, Play, StopCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Template {
  id: string;
  name: string;
  subject: string;
}

interface ABTest {
  id: string;
  name: string;
  template_a_id: string;
  template_b_id: string;
  status: string;
  start_date: string;
  end_date: string;
  winner_template_id: string | null;
  total_sent_a: number;
  total_sent_b: number;
  total_opened_a: number;
  total_opened_b: number;
  open_rate_a: number;
  open_rate_b: number;
  template_a?: { name: string };
  template_b?: { name: string };
}

export const ABTestManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const [newTest, setNewTest] = useState({
    name: '',
    template_a_id: '',
    template_b_id: '',
    duration_days: 7,
  });

  useEffect(() => {
    loadTemplates();
    loadABTests();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('id, name, subject')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive",
      });
      return;
    }

    setTemplates(data || []);
  };

  const loadABTests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_ab_tests' as any)
      .select(`
        *,
        template_a:email_templates!template_a_id(name),
        template_b:email_templates!template_b_id(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les tests A/B",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setABTests(data as any || []);
    setLoading(false);
  };

  const createABTest = async () => {
    if (!newTest.name || !newTest.template_a_id || !newTest.template_b_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (newTest.template_a_id === newTest.template_b_id) {
      toast({
        title: "Erreur",
        description: "Les deux templates doivent être différents",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + newTest.duration_days);

    const { error } = await supabase
      .from('email_ab_tests' as any)
      .insert({
        name: newTest.name,
        template_a_id: newTest.template_a_id,
        template_b_id: newTest.template_b_id,
        end_date: endDate.toISOString(),
        status: 'active',
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le test A/B",
        variant: "destructive",
      });
      setCreating(false);
      return;
    }

    toast({
      title: "Succès",
      description: "Test A/B créé avec succès",
    });

    setNewTest({
      name: '',
      template_a_id: '',
      template_b_id: '',
      duration_days: 7,
    });

    loadABTests();
    setCreating(false);
  };

  const stopTest = async (testId: string) => {
    const { error } = await supabase
      .from('email_ab_tests' as any)
      .update({ status: 'cancelled' })
      .eq('id', testId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'arrêter le test",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Test arrêté",
      description: "Le test A/B a été arrêté",
    });

    loadABTests();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="gap-1"><Play className="h-3 w-3" />Actif</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="gap-1"><Trophy className="h-3 w-3" />Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="gap-1"><StopCircle className="h-3 w-3" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Création d'un nouveau test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Nouveau Test A/B
          </CardTitle>
          <CardDescription>
            Créez un test pour comparer deux templates et identifier le plus performant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="test-name">Nom du test</Label>
              <Input
                id="test-name"
                placeholder="Ex: Test sujet personnalisé vs générique"
                value={newTest.name}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée (jours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={newTest.duration_days}
                onChange={(e) => setNewTest({ ...newTest, duration_days: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-a">Template A</Label>
              <Select
                value={newTest.template_a_id}
                onValueChange={(value) => setNewTest({ ...newTest, template_a_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le template A" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-b">Template B</Label>
              <Select
                value={newTest.template_b_id}
                onValueChange={(value) => setNewTest({ ...newTest, template_b_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le template B" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={createABTest} disabled={creating} className="w-full">
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <FlaskConical className="h-4 w-4 mr-2" />
                Créer le test A/B
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Liste des tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tests A/B
          </CardTitle>
          <CardDescription>
            Suivez les performances de vos tests et identifiez les gagnants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : abTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun test A/B en cours
            </div>
          ) : (
            <div className="space-y-4">
              {abTests.map((test) => (
                <Card key={test.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{test.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {test.status === 'active' && (
                              <span>{getDaysRemaining(test.end_date)} jours restants</span>
                            )}
                            {test.status === 'completed' && (
                              <span>Terminé le {new Date(test.end_date).toLocaleDateString('fr-FR')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(test.status)}
                          {test.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => stopTest(test.id)}
                            >
                              <StopCircle className="h-4 w-4 mr-1" />
                              Arrêter
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Template A */}
                        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Template A</h4>
                            {test.winner_template_id === test.template_a_id && (
                              <Badge variant="default" className="gap-1">
                                <Trophy className="h-3 w-3" />
                                Gagnant
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {test.template_a?.name || 'Template A'}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Envoyés:</span>
                              <span className="font-medium">{test.total_sent_a}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Ouverts:</span>
                              <span className="font-medium">{test.total_opened_a}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Taux d'ouverture:</span>
                              <span className="text-primary">{test.open_rate_a}%</span>
                            </div>
                            <Progress value={test.open_rate_a} className="h-2 mt-2" />
                          </div>
                        </div>

                        {/* Template B */}
                        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Template B</h4>
                            {test.winner_template_id === test.template_b_id && (
                              <Badge variant="default" className="gap-1">
                                <Trophy className="h-3 w-3" />
                                Gagnant
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {test.template_b?.name || 'Template B'}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Envoyés:</span>
                              <span className="font-medium">{test.total_sent_b}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Ouverts:</span>
                              <span className="font-medium">{test.total_opened_b}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Taux d'ouverture:</span>
                              <span className="text-primary">{test.open_rate_b}%</span>
                            </div>
                            <Progress value={test.open_rate_b} className="h-2 mt-2" />
                          </div>
                        </div>
                      </div>

                      {test.winner_template_id && test.status === 'completed' && (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-sm text-center">
                            <Trophy className="h-4 w-4 inline mr-1" />
                            Le template{' '}
                            <span className="font-semibold">
                              {test.winner_template_id === test.template_a_id ? 'A' : 'B'}
                            </span>
                            {' '}a gagné avec un taux d'ouverture de{' '}
                            <span className="font-semibold">
                              {test.winner_template_id === test.template_a_id
                                ? test.open_rate_a
                                : test.open_rate_b}
                              %
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
