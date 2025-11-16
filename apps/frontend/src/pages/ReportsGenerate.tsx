import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileText } from 'lucide-react';
import { useState } from 'react';

export default function ReportsGenerate() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    navigate(ROUTE_PATHS.reports);
  };

  return (
    <>
      <Helmet><title>Générer un Rapport | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link to={ROUTE_PATHS.reports}><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Générer un Rapport</h1>

          <Card>
            <CardHeader><CardTitle>Configuration du Rapport</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label>Type de Rapport</Label>
                <Select><SelectTrigger><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Rapport Mensuel</SelectItem>
                    <SelectItem value="quarterly">Rapport Trimestriel</SelectItem>
                    <SelectItem value="annual">Rapport Annuel</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2"><Label>Période</Label>
                <Select><SelectTrigger><SelectValue placeholder="Sélectionnez une période" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7">7 derniers jours</SelectItem>
                    <SelectItem value="last30">30 derniers jours</SelectItem>
                    <SelectItem value="thismonth">Ce mois</SelectItem>
                    <SelectItem value="lastmonth">Mois dernier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3"><Label>Sections à Inclure</Label>
                {['Activité utilisateurs', 'Challenges complétés', 'Sessions d\'étude', 'Badges débloqués', 'Statistiques générales'].map((section) => (
                  <div key={section} className="flex items-center gap-2">
                    <Checkbox id={section} defaultChecked />
                    <label htmlFor={section} className="text-sm">{section}</label>
                  </div>
                ))}
              </div>

              <div className="space-y-2"><Label>Format d'Export</Label>
                <Select defaultValue="pdf"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? 'Génération en cours...' : <><FileText className="w-4 h-4 mr-2" />Générer le Rapport</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
