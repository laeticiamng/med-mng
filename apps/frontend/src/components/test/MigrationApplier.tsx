/**
 * Migration Applier Component
 * Permet d'appliquer la migration EDN directement depuis l'interface web
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MIGRATION_SQL = `
-- =============================================
-- MIGRATION: Ajout Fonctionnalités Complètes EDN
-- =============================================

-- SECTION 1: PAROLES MUSICALES SEPAREES PAR RANG
ALTER TABLE edn_items_complete
ADD COLUMN IF NOT EXISTS paroles_rang_a text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS paroles_rang_b text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS paroles_rang_ab text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN edn_items_complete.paroles_rang_a IS
'Paroles musicales fixes pour mémoriser UNIQUEMENT le Rang A (compétences fondamentales)';

COMMENT ON COLUMN edn_items_complete.paroles_rang_b IS
'Paroles musicales fixes pour mémoriser UNIQUEMENT le Rang B (compétences avancées)';

COMMENT ON COLUMN edn_items_complete.paroles_rang_ab IS
'Paroles musicales fixes pour mémoriser les Rangs A et B ENSEMBLE (synthèse complète)';

CREATE INDEX IF NOT EXISTS idx_edn_paroles_rang_a
ON edn_items_complete USING gin(paroles_rang_a);

CREATE INDEX IF NOT EXISTS idx_edn_paroles_rang_b
ON edn_items_complete USING gin(paroles_rang_b);

CREATE INDEX IF NOT EXISTS idx_edn_paroles_rang_ab
ON edn_items_complete USING gin(paroles_rang_ab);

UPDATE edn_items_complete
SET paroles_rang_ab = paroles_musicales
WHERE paroles_musicales IS NOT NULL
  AND array_length(paroles_musicales, 1) > 0
  AND (paroles_rang_ab IS NULL OR array_length(paroles_rang_ab, 1) = 0);

-- SECTION 2: LIEN ITEM EDN <-> CHANSON SUNO
ALTER TABLE med_mng_songs
ADD COLUMN IF NOT EXISTS item_code text,
ADD COLUMN IF NOT EXISTS rang_type text,
ADD COLUMN IF NOT EXISTS is_static boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS generation_source text DEFAULT 'suno';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_med_mng_songs_item_code'
  ) THEN
    ALTER TABLE med_mng_songs
    ADD CONSTRAINT fk_med_mng_songs_item_code
      FOREIGN KEY (item_code)
      REFERENCES edn_items_complete(item_code)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_rang_type'
  ) THEN
    ALTER TABLE med_mng_songs
    ADD CONSTRAINT chk_rang_type
      CHECK (rang_type IN ('A', 'B', 'AB') OR rang_type IS NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_generation_source'
  ) THEN
    ALTER TABLE med_mng_songs
    ADD CONSTRAINT chk_generation_source
      CHECK (generation_source IN ('suno', 'manual', 'ai_generated', 'custom'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_med_mng_songs_item_code
ON med_mng_songs(item_code);

CREATE INDEX IF NOT EXISTS idx_med_mng_songs_rang_type
ON med_mng_songs(rang_type);

CREATE INDEX IF NOT EXISTS idx_med_mng_songs_static
ON med_mng_songs(is_static);

CREATE UNIQUE INDEX IF NOT EXISTS idx_med_mng_songs_static_unique
ON med_mng_songs(item_code, rang_type)
WHERE is_static = true AND item_code IS NOT NULL AND rang_type IS NOT NULL;

COMMENT ON COLUMN med_mng_songs.item_code IS
'Code de l''item EDN associé (ex: IC-001, IC-002, ..., IC-367)';

COMMENT ON COLUMN med_mng_songs.rang_type IS
'Type de rang couvert: A (rang A uniquement), B (rang B uniquement), AB (les deux rangs)';

COMMENT ON COLUMN med_mng_songs.is_static IS
'true = chanson fixe réutilisable pour cet item+rang, false = générée dynamiquement par utilisateur';

COMMENT ON COLUMN med_mng_songs.generation_source IS
'Source de génération: suno (API Suno), manual (créée manuellement), ai_generated (IA autre), custom (personnalisée)';

-- SECTION 3: LIEN ITEM EDN <-> BANDE DESSINEE
ALTER TABLE comic_panels
ADD COLUMN IF NOT EXISTS item_code text,
ADD COLUMN IF NOT EXISTS rang_type text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_comic_panels_item_code'
  ) THEN
    ALTER TABLE comic_panels
    ADD CONSTRAINT fk_comic_panels_item_code
      FOREIGN KEY (item_code)
      REFERENCES edn_items_complete(item_code)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_comic_rang_type'
  ) THEN
    ALTER TABLE comic_panels
    ADD CONSTRAINT chk_comic_rang_type
      CHECK (rang_type IN ('A', 'B', 'AB') OR rang_type IS NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_comic_panels_item_code
ON comic_panels(item_code);

CREATE INDEX IF NOT EXISTS idx_comic_panels_rang_type
ON comic_panels(rang_type);

CREATE INDEX IF NOT EXISTS idx_comic_panels_static
ON comic_panels(is_static);

CREATE UNIQUE INDEX IF NOT EXISTS idx_comic_panels_unique
ON comic_panels(item_code, rang_type, panel_number)
WHERE item_code IS NOT NULL AND rang_type IS NOT NULL;

COMMENT ON COLUMN comic_panels.item_code IS
'Code de l''item EDN associé (ex: IC-001)';

COMMENT ON COLUMN comic_panels.rang_type IS
'Type de rang illustré: A (rang A uniquement), B (rang B uniquement), AB (les deux rangs)';
`.trim();

export const MigrationApplier = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [migrationApplied, setMigrationApplied] = useState<boolean | null>(null);

  const checkMigrationStatus = async () => {
    try {
      // Vérifier si les colonnes existent en essayant de sélectionner
      const { data, error } = await supabase
        .from('edn_items_complete')
        .select('paroles_rang_a, paroles_rang_b, paroles_rang_ab')
        .limit(1);

      if (error) {
        // Si erreur, les colonnes n'existent probablement pas
        setMigrationApplied(false);
      } else {
        // Succès = colonnes existent
        setMigrationApplied(true);
      }
    } catch (err) {
      setMigrationApplied(false);
    }
  };

  useState(() => {
    checkMigrationStatus();
  }, []);

  const applyMigration = async () => {
    setIsApplying(true);
    setError(null);
    setSuccess(false);

    try {
      // Note: L'exécution de SQL arbitraire via le client Supabase n'est pas possible
      // Cette fonction montre plutôt les instructions à l'utilisateur
      toast.error('Migration SQL doit être appliquée via le Dashboard Supabase');

      setError(
        'Pour des raisons de sécurité, les migrations doivent être appliquées via le Dashboard Supabase SQL Editor ou le CLI Supabase.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    toast.success('SQL copié dans le presse-papier !');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Application de la Migration EDN
            </CardTitle>
            <CardDescription>
              Migration 20251116220000: Colonnes paroles séparées + liens Suno + liens BD
            </CardDescription>
          </div>
          {migrationApplied !== null && (
            <Alert className={migrationApplied ? 'border-green-500' : 'border-orange-500'}>
              <AlertTitle className="flex items-center gap-2 text-sm">
                {migrationApplied ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Migration Appliquée
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Migration Non Appliquée
                  </>
                )}
              </AlertTitle>
            </Alert>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!migrationApplied && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Requise</AlertTitle>
            <AlertDescription>
              La migration doit être appliquée pour activer les fonctionnalités complètes EDN.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>
              Migration appliquée avec succès ! Rafraîchissez la page de vérification.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-secondary p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Options d'Application:</h3>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-medium mb-2">Option 1: Dashboard Supabase (Recommandé)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Ouvrir <a href="https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/sql" target="_blank" rel="noopener noreferrer" className="text-primary underline">Dashboard Supabase SQL Editor</a></li>
                <li>Cliquer sur "Copy SQL" ci-dessous</li>
                <li>Coller dans l'éditeur SQL</li>
                <li>Cliquer sur "Run"</li>
                <li>Rafraîchir cette page pour vérifier</li>
              </ol>
              <Button onClick={copyToClipboard} className="mt-3" variant="outline">
                📋 Copier le SQL
              </Button>
            </div>

            <div className="border-l-4 border-secondary pl-4">
              <h4 className="font-medium mb-2">Option 2: CLI Supabase</h4>
              <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`cd /home/user/med-mng
npx supabase db push`}
              </pre>
            </div>

            <div className="border-l-4 border-muted pl-4">
              <h4 className="font-medium mb-2">Option 3: Voir le SQL complet</h4>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-primary">
                  Cliquez pour voir le SQL (pour inspection)
                </summary>
                <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto mt-2 max-h-96">
                  {MIGRATION_SQL}
                </pre>
              </details>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={checkMigrationStatus} variant="outline">
            🔄 Vérifier l'État
          </Button>
          <Button
            onClick={applyMigration}
            disabled={isApplying || migrationApplied === true}
          >
            {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {migrationApplied ? '✅ Déjà Appliquée' : 'Appliquer la Migration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
