
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AuditGeneral } from '@/components/edn/audit/AuditGeneral';
import { AuditIC1 } from '@/components/edn/audit/AuditIC1';
import { AuditComparatif } from '@/components/edn/audit/AuditComparatif';
import { AuditIC3 } from '@/components/edn/audit/AuditIC3';
import { AuditIC4 } from '@/components/edn/audit/AuditIC4';
import { AuditIC5 } from '@/components/edn/audit/AuditIC5';
import { FileText, TrendingUp, Download, ArrowLeft, Award, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuditGeneralPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  const handleExportReport = () => {
    console.log('Export du rapport général d\'audit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/edn" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux items EDN</span>
            </Link>
            <div className="h-6 border-l border-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800">Audit Général - Items IC</h1>
          </div>
          
          <Button onClick={handleExportReport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter rapport</span>
          </Button>
        </div>

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Vue Générale</span>
              </TabsTrigger>
              <TabsTrigger value="ic1" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>IC-1</span>
              </TabsTrigger>
              <TabsTrigger value="ic3" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>IC-3</span>
              </TabsTrigger>
              <TabsTrigger value="ic4" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>IC-4</span>
              </TabsTrigger>
              <TabsTrigger value="ic5" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>IC-5</span>
              </TabsTrigger>
              <TabsTrigger value="comparatif" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Comparatif</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-6">
              <AuditGeneral />
            </TabsContent>
            
            <TabsContent value="ic1" className="mt-6">
              <AuditIC1 />
            </TabsContent>
            
            <TabsContent value="ic3" className="mt-6">
              <AuditIC3 />
            </TabsContent>
            
            <TabsContent value="ic4" className="mt-6">
              <AuditIC4 />
            </TabsContent>
            
            <TabsContent value="ic5" className="mt-6">
              <AuditIC5 />
            </TabsContent>
            
            <TabsContent value="comparatif" className="mt-6">
              <AuditComparatif />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuditGeneralPage;
