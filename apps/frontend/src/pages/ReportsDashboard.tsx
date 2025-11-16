import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Download, Eye, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function ReportsDashboard() {
  const reports = [
    { id: 1, name: 'Rapport Mensuel Mars 2024', type: 'monthly', created: '2024-03-31', size: '2.4 MB', status: 'ready' },
    { id: 2, name: 'Analyse Performances Q1', type: 'quarterly', created: '2024-03-25', size: '5.1 MB', status: 'ready' },
    { id: 3, name: 'Export Utilisateurs', type: 'custom', created: '2024-03-20', size: '1.2 MB', status: 'ready' },
  ];

  return (
    <>
      <Helmet><title>Rapports | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-4xl font-bold text-gray-900">Rapports</h1><p className="text-lg text-gray-600">Générez et consultez vos rapports</p></div>
            <Link to={ROUTE_PATHS.reportsGenerate}><Button><Plus className="w-4 h-4 mr-2" />Nouveau Rapport</Button></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card><CardHeader><div className="flex items-center gap-3"><BarChart3 className="w-8 h-8 text-blue-600" /><div><CardTitle className="text-2xl">24</CardTitle><p className="text-sm text-gray-600">Rapports générés</p></div></div></CardHeader></Card>
            <Card><CardHeader><div className="flex items-center gap-3"><PieChart className="w-8 h-8 text-green-600" /><div><CardTitle className="text-2xl">156</CardTitle><p className="text-sm text-gray-600">Exports ce mois</p></div></div></CardHeader></Card>
            <Card><CardHeader><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-purple-600" /><div><CardTitle className="text-2xl">87%</CardTitle><p className="text-sm text-gray-600">Amélioration</p></div></div></CardHeader></Card>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><FileText className="w-6 h-6 text-blue-600" /></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{report.created}</span><span>•</span><span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{report.type}</Badge>
                      <Link to={ROUTE_PATHS.reportViewer.replace(':reportId', report.id.toString())}><Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />Voir</Button></Link>
                      <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
