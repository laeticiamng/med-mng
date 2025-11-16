/**
 * Page de Test et Vérification EDN
 * Accessible via /edn-test
 */

import { EdnCompletenessVerification } from '@/components/test/EdnCompletenessVerification';
import { MigrationApplier } from '@/components/test/MigrationApplier';
import { LyricsGenerationTest } from '@/components/test/LyricsGenerationTest';
import { BatchLyricsGenerator } from '@/components/test/BatchLyricsGenerator';
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

        <Tabs defaultValue="migration" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="migration">
              🔧 Migration
            </TabsTrigger>
            <TabsTrigger value="verification">
              📊 Complétude
            </TabsTrigger>
            <TabsTrigger value="lyrics">
              🎵 Test Paroles
            </TabsTrigger>
            <TabsTrigger value="batch">
              🚀 Génération Batch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="migration">
            <MigrationApplier />
          </TabsContent>

          <TabsContent value="verification">
            <EdnCompletenessVerification />
          </TabsContent>

          <TabsContent value="lyrics">
            <LyricsGenerationTest />
          </TabsContent>

          <TabsContent value="batch">
            <BatchLyricsGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
