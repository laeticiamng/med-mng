
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AuditGeneral } from '@/components/edn/audit/AuditGeneral';
import { AuditComprehensif } from '@/components/edn/audit/AuditComprehensif';
import { AuditIC1 } from '@/components/edn/audit/AuditIC1';
import { AuditIC2Completeness } from '@/components/edn/audit/AuditIC2Completeness';
import { AuditIC3 } from '@/components/edn/audit/AuditIC3';
import { AuditIC4 } from '@/components/edn/audit/AuditIC4';
import { AuditIC5 } from '@/components/edn/audit/AuditIC5';
import { AuditComparatif } from '@/components/edn/audit/AuditComparatif';
import { AuditDashboard } from '@/components/audit/AuditDashboard';
import { FileText, TrendingUp, Download, ArrowLeft, Award, BarChart3, Database, Target, BookOpen, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuditUnified = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleExportReport = () => {
    console.log('Export du rapport unifié d\'audit');
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
            <h1 className="text-3xl font-bold text-gray-800">Audit Unifié - Analyse Complète</h1>
          </div>
          
          <Button onClick={handleExportReport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter rapport</span>
          </Button>
        </div>

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger value="dashboard" className="flex items-center space-x-1 text-xs">
                <Award className="h-3 w-3" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="comprehensif" className="flex items-center space-x-1 text-xs">
                <Database className="h-3 w-3" />
                <span>Complet</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center space-x-1 text-xs">
                <BarChart3 className="h-3 w-3" />
                <span>Général</span>
              </TabsTrigger>
              <TabsTrigger value="ic1" className="flex items-center space-x-1 text-xs">
                <Users className="h-3 w-3" />
                <span>IC-1</span>
              </TabsTrigger>
              <TabsTrigger value="ic2" className="flex items-center space-x-1 text-xs">
                <Shield className="h-3 w-3" />
                <span>IC-2</span>
              </TabsTrigger>
              <TabsTrigger value="ic3" className="flex items-center space-x-1 text-xs">
                <Target className="h-3 w-3" />
                <span>IC-3</span>
              </TabsTrigger>
              <TabsTrigger value="ic4" className="flex items-center space-x-1 text-xs">
                <BookOpen className="h-3 w-3" />
                <span>IC-4</span>
              </TabsTrigger>
              <TabsTrigger value="ic5" className="flex items-center space-x-1 text-xs">
                <FileText className="h-3 w-3" />
                <span>IC-5</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6">
              <AuditDashboard />
            </TabsContent>
            
            <TabsContent value="comprehensif" className="mt-6">
              <AuditComprehensif />
            </TabsContent>
            
            <TabsContent value="general" className="mt-6">
              <AuditGeneral />
            </TabsContent>
            
            <TabsContent value="ic1" className="mt-6">
              <AuditIC1 />
            </TabsContent>
            
            <TabsContent value="ic2" className="mt-6">
              <AuditIC2Completeness />
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
          </Tabs>
        </Card>

        {/* Section comparative en bas */}
        <Card className="mt-6 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Analyse Comparative</h2>
          </div>
          <AuditComparatif />
        </Card>
      </div>
    </div>
  );
};

export default AuditUnified;
