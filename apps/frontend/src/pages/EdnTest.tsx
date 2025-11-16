/**
 * Page de Test et Vérification EDN
 * Accessible via /edn-test
 */

import { EdnCompletenessVerification } from '@/components/test/EdnCompletenessVerification';
import { EdnExtractionTest } from '@/components/test/EdnExtractionTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EdnTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tests & Vérification EDN</h1>
          <p className="text-gray-600 mt-2">
            Outils de test pour vérifier la complétude et l'extraction des items EDN
          </p>
        </div>

        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="verification">
              📊 Vérification Complétude
            </TabsTrigger>
            <TabsTrigger value="extraction">
              🔄 Test Extraction UNESS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification">
            <EdnCompletenessVerification />
          </TabsContent>

          <TabsContent value="extraction">
            <EdnExtractionTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
