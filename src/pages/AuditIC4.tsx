
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditIC4 } from '@/components/edn/audit/AuditIC4';
import { AuditComparatif } from '@/components/edn/audit/AuditComparatif';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuditIC4Page = () => {
  const [activeTab, setActiveTab] = useState('audit');

  const handleExportReport = () => {
    // Génération du rapport d'audit (fonctionnalité future)
    console.log('Export du rapport d\'audit IC-4');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/edn" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux items EDN</span>
            </Link>
            <div className="h-6 border-l border-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800">Audit IC-4 : Qualité et sécurité des soins</h1>
          </div>
          
          <Button onClick={handleExportReport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter rapport</span>
          </Button>
        </div>

        {/* Onglets d'audit */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audit" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Audit détaillé</span>
              </TabsTrigger>
              <TabsTrigger value="comparatif" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analyse comparative</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="audit" className="mt-6">
              <AuditIC4 />
            </TabsContent>
            
            <TabsContent value="comparatif" className="mt-6">
              <AuditComparatif itemCode="IC-4" />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuditIC4Page;
