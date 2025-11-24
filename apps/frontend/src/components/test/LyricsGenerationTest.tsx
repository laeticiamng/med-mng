import logger from '@/lib/logger';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Input } from '@/components/ui/input';
import { previewLyricsForItem } from '../../../../../packages/shared/src/utils/generateAllAdvancedLyrics';
import { Loader2 } from 'lucide-react';

export const LyricsGenerationTest = () => {
  const [itemCode, setItemCode] = useState('IC-001');
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | 'AB'>('A');
  const [lyrics, setLyrics] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setLyrics(null);

    try {
      logger.debug(`🎵 Génération paroles pour ${itemCode} Rang ${selectedRang}`);
      const generatedLyrics = await previewLyricsForItem(itemCode, selectedRang);
      setLyrics(generatedLyrics);
    } catch (err) {
      logger.error('Erreur génération:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const stats = lyrics ? {
    totalLines: lyrics.filter(l => !l.startsWith('[') && l !== '---' && l !== '[Pause]').length,
    totalChars: lyrics.join('\n').length,
    coupletCount: lyrics.filter(l => l.includes('[Couplet')).length,
    hasRefrain: lyrics.some(l => l.includes('[Refrain]'))
  } : null;

  return (
    <div className="space-y-6">
      <PremiumCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🎵 Test de Génération de Paroles
        </h2>
        <p className="text-gray-600 mb-6">
          Testez la génération de paroles avec le script OpenAI (style Nekfeu, 1 refrain + 4 couplets)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Item Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Item EDN
            </label>
            <Input
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              placeholder="IC-001"
              className="w-full"
            />
          </div>

          {/* Rang Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rang
            </label>
            <div className="flex gap-2">
              {(['A', 'B', 'AB'] as const).map((rang) => (
                <Button
                  key={rang}
                  onClick={() => setSelectedRang(rang)}
                  variant={selectedRang === rang ? 'default' : 'outline'}
                  className="flex-1"
                >
                  Rang {rang}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={loading || !itemCode}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                '🎵 Générer Paroles'
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium">❌ Erreur:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <PremiumCard className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLines}</div>
              <div className="text-sm text-gray-600">Lignes</div>
            </PremiumCard>
            <PremiumCard className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalChars}</div>
              <div className="text-sm text-gray-600">Caractères</div>
            </PremiumCard>
            <PremiumCard className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.coupletCount}</div>
              <div className="text-sm text-gray-600">Couplets</div>
            </PremiumCard>
            <PremiumCard className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {stats.hasRefrain ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Refrain</div>
            </PremiumCard>
          </div>
        )}

        {/* Conformity Checks */}
        {stats && (
          <PremiumCard variant="elevated" className="p-4 mb-6 bg-blue-50">
            <h3 className="font-semibold text-gray-900 mb-3">
              ✓ Conformité Cahier des Charges
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={stats.hasRefrain ? 'text-green-600' : 'text-red-600'}>
                  {stats.hasRefrain ? '✅' : '❌'}
                </span>
                <span className="text-sm">Refrain répétitif présent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={stats.coupletCount >= 3 ? 'text-green-600' : 'text-red-600'}>
                  {stats.coupletCount >= 3 ? '✅' : '❌'}
                </span>
                <span className="text-sm">Au moins 3 couplets (4 couplets = {stats.coupletCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={stats.totalChars <= 5000 ? 'text-green-600' : 'text-red-600'}>
                  {stats.totalChars <= 5000 ? '✅' : '❌'}
                </span>
                <span className="text-sm">Moins de 5000 caractères ({stats.totalChars}/5000)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={stats.totalLines >= 15 ? 'text-green-600' : 'text-red-600'}>
                  {stats.totalLines >= 15 ? '✅' : '❌'}
                </span>
                <span className="text-sm">Au moins 15 lignes ({stats.totalLines} lignes)</span>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Lyrics Display */}
        {lyrics && (
          <PremiumCard className="p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">
              📝 Paroles Générées ({itemCode} - Rang {selectedRang})
            </h3>
            <div className="font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
              {lyrics.map((line, index) => {
                if (line.startsWith('[')) {
                  return (
                    <div key={index} className="font-bold text-blue-600 mt-3 mb-1">
                      {line}
                    </div>
                  );
                } else if (line === '---' || line === '[Pause]') {
                  return <div key={index} className="h-2" />;
                } else {
                  return (
                    <div key={index} className="text-gray-700 pl-4">
                      {line}
                    </div>
                  );
                }
              })}
            </div>
          </PremiumCard>
        )}
      </PremiumCard>

      {/* Info Card */}
      <PremiumCard className="p-6 bg-purple-50">
        <h3 className="font-semibold text-gray-900 mb-3">
          ℹ️ À propos du générateur
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Script:</strong> generateAdvancedLyrics.ts (OpenAI)
          </p>
          <p>
            <strong>Style:</strong> Nekfeu avec assonances (-on, -é, -er, -ir, -ain)
          </p>
          <p>
            <strong>Structure:</strong> 1 refrain répétitif + 4 couplets
          </p>
          <p>
            <strong>Contenu:</strong> Compétences OIC réelles du rang sélectionné
          </p>
          <p>
            <strong>Limite:</strong> 5000 caractères max (optimisé pour Suno)
          </p>
        </div>
      </PremiumCard>
    </div>
  );
};
