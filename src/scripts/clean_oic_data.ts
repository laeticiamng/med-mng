import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface CleaningReport {
  total_processed: number;
  html_entities_fixed: number;
  fragments_fixed: number;
  empty_descriptions_handled: number;
  intitules_fixed: number;
  mediawiki_tables_converted: number;
  entries_reextracted: number;
  errors: Array<{
    objectif_id: string;
    error: string;
  }>;
  timestamp: string;
}

class OICDataCleaner {
  private supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  private report: CleaningReport = {
    total_processed: 0,
    html_entities_fixed: 0,
    fragments_fixed: 0,
    empty_descriptions_handled: 0,
    intitules_fixed: 0,
    mediawiki_tables_converted: 0,
    entries_reextracted: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  async run() {
    console.log('🧹 NETTOYAGE DES DONNÉES OIC');
    console.log('============================\n');

    try {
      console.log('📊 Analyse des données problématiques...');
      await this.analyzeProblems();

      console.log('\n🔧 Nettoyage des entités HTML...');
      await this.cleanHTMLEntities();

      console.log('\n🔧 Correction des fragments incomplets...');
      await this.fixFragments();

      console.log('\n🔧 Correction des intitulés corrompus...');
      await this.fixCorruptedTitles();

      console.log('\n🔁 Ré-extraction des entrées problématiques...');
      await this.reExtractProblematicEntries();

      console.log('\n🔧 Conversion des tables MediaWiki...');
      await this.convertMediaWikiTables();

      console.log('\n🔧 Gestion des descriptions vides...');
      await this.handleEmptyDescriptions();

      console.log('\n📄 Génération du rapport...');
      await this.generateReport();

      console.log('\n✅ NETTOYAGE TERMINÉ!');
      console.log(`   Total traité: ${this.report.total_processed}`);
      console.log(`   HTML corrigé: ${this.report.html_entities_fixed}`);
      console.log(`   Fragments corrigés: ${this.report.fragments_fixed}`);
      console.log(`   Intitulés corrigés: ${this.report.intitules_fixed}`);
      console.log(`   Tables converties: ${this.report.mediawiki_tables_converted}`);
      console.log(`   Entrées ré-extraites: ${this.report.entries_reextracted}`);
      console.log(`   Erreurs: ${this.report.errors.length}`);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    }
  }

  private async analyzeProblems() {
    const { _data, _error } = await this.supabase
      .from('oic_competences')
      .select('objectif_id')
      .or(`
        description.like.%&lt;%,
        description.like.%&gt;%,
        description.like.%&nbsp;%,
        description.like.-%,
        description.like.*%,
        description.is.null,
        intitule.like.%[[%]]%,
        description.like.%{|%
      `);

    if (_error) throw _error;
    console.log(`   → ${_data?.length || 0} compétences avec problèmes détectés`);
  }

  private async cleanHTMLEntities() {
    const { _data, _error } = await this.supabase
      .from('oic_competences')
      .select('objectif_id, intitule, description')
      .or(
        'description.like.%&lt;%, description.like.%&gt;%, description.like.%&nbsp;%, description.like.%&quot;%, description.like.%&apos;%, description.like.%&amp;%'
      );

    if (_error) throw _error;
    if (!_data || _data.length === 0) return;

    console.log(`   → ${_data.length} compétences avec entités HTML à nettoyer`);

    for (const comp of _data) {
      try {
        const cleanedDescription = this.decodeHTMLEntities(comp.description || '');
        const cleanedIntitule = this.decodeHTMLEntities(comp.intitule);

        await this.supabase
          .from('oic_competences')
          .update({
            description: cleanedDescription || null,
            intitule: cleanedIntitule,
            extraction_status: 'cleaned',
          })
          .eq('objectif_id', comp.objectif_id);

        this.report.html_entities_fixed++;
        this.report.total_processed++;
      } catch (err) {
        this.report.errors.push({
          objectif_id: comp.objectif_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  private decodeHTMLEntities(text: string): string {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
      .replace(/<br\s*\/?>(\r?\n)?/gi, '\n')
      .replace(/<sup>([^<]+)<\/sup>/gi, '^$1')
      .replace(/<sub>([^<]+)<\/sub>/gi, '_$1')
      .replace(/<u>([^<]+)<\/u>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  private async fixFragments() {
    const { _data, _error } = await this.supabase
      .from('oic_competences')
      .select('objectif_id, description, raw_json')
      .or('description.like.-%, description.like.*%')
      .filter('description', 'not.is', null);

    if (_error) throw _error;
    if (!_data || _data.length === 0) return;

    console.log(`   → ${_data.length} fragments à corriger`);

    for (const comp of _data) {
      try {
        let fixedDescription = comp.description || '';

        fixedDescription = fixedDescription.replace(/^[-*•]\s*/, '');

        if (comp.raw_json?.content) {
          const listRebuild = this.normalizeListDescription(
            fixedDescription,
            comp.raw_json.content
          );
          if (listRebuild && listRebuild.length > fixedDescription.length) {
            fixedDescription = listRebuild;
          }
        }

        if (fixedDescription.length < 50 && comp.raw_json?.content) {
          const fullContent = this.extractFullDescription(
            comp.raw_json.content,
            fixedDescription
          );
          if (fullContent && fullContent.length > fixedDescription.length) {
            fixedDescription = fullContent;
          }
        }

        await this.supabase
          .from('oic_competences')
          .update({
            description: fixedDescription,
            extraction_status: 'cleaned',
          })
          .eq('objectif_id', comp.objectif_id);

        this.report.fragments_fixed++;
        this.report.total_processed++;
      } catch (err) {
        this.report.errors.push({
          objectif_id: comp.objectif_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  private extractFullDescription(content: string, fragment: string): string | null {
    const fragmentIndex = content.indexOf(fragment);
    if (fragmentIndex === -1) return null;

    let start = fragmentIndex;
    for (let i = fragmentIndex - 1; i >= 0; i--) {
      if (content[i] === '.' || content[i] === '\n' || content[i] === '|') {
        start = i + 1;
        break;
      }
    }

    let end = fragmentIndex + fragment.length;
    for (let i = end; i < content.length; i++) {
      if (content[i] === '.' || content[i] === '\n' || content[i] === '|') {
        end = i;
        break;
      }
    }

    return content.substring(start, end).trim();
  }

  private extractListItems(content: string): string[] {
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^([*#;:]+)\s+/.test(line))
      .map((line) => line.replace(/^([*#;:]+)\s+/, ''))
      .map((line) => this.decodeHTMLEntities(this.cleanMediaWikiLinks(line)))
      .map((line) => line.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
  }

  private normalizeListDescription(description: string, content: string): string {
    const listItems = this.extractListItems(content);
    if (!listItems.length) return description;
    if (description.length < 50 || /^[-*•]\s+/.test(description)) {
      return listItems.join('; ');
    }
    return description;
  }

  private async fixCorruptedTitles() {
    const { _data, _error } = await this.supabase
      .from('oic_competences')
      .select('objectif_id, intitule')
      .like('intitule', '%[[%]]%');

    if (_error) throw _error;
    if (!_data || _data.length === 0) return;

    console.log(`   → ${_data.length} intitulés corrompus à corriger`);

    for (const comp of _data) {
      try {
        const fixedIntitule = this.cleanMediaWikiLinks(comp.intitule);

        await this.supabase
          .from('oic_competences')
          .update({
            intitule: fixedIntitule,
            extraction_status: 'cleaned',
          })
          .eq('objectif_id', comp.objectif_id);

        this.report.intitules_fixed++;
        this.report.total_processed++;
      } catch (err) {
        this.report.errors.push({
          objectif_id: comp.objectif_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  private async reExtractProblematicEntries() {
    const { _data, _error } = await this.supabase
      .from('oic_competences')
      .select('objectif_id, intitule, description, raw_json')
      .or(`
        description.like.%&lt;%,
        description.like.%&gt;%,
        description.like.%&nbsp;%,
        description.like.%{|%,
        description.like.-%,
        description.like.*%,
        description.is.null,
        intitule.like.%[[%]]%
      `);

    if (_error) throw _error;
    if (!_data || _data.length === 0) return;

    console.log(`   → ${_data.length} entrées à ré-extraire via raw_json`);

    for (const comp of _data) {
      try {
        const rawContent = this.extractContentFromRawJson(comp.raw_json);
        if (!rawContent) {
          continue;
        }

        const extracted = this.extractFromRawContent(
          rawContent,
          comp.intitule,
          comp.description
        );

        if (!extracted) {
          continue;
        }

        const updatedDescription = this.convertMediaWikiTable(
          this.decodeHTMLEntities(extracted.description)
        );
        const updatedIntitule = this.decodeHTMLEntities(extracted.intitule);

        await this.supabase
          .from('oic_competences')
          .update({
            intitule: updatedIntitule,
            description: updatedDescription || null,
            extraction_status: 'reextracted',
          })
          .eq('objectif_id', comp.objectif_id);

        this.report.entries_reextracted++;
        this.report.total_processed++;
      } catch (err) {
        this.report.errors.push({
          objectif_id: comp.objectif_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  private extractContentFromRawJson(rawJson: any): string | null {
    if (!rawJson) return null;
    return (
      rawJson?.revisions?.[0]?.slots?.main?.content ||
      rawJson?.revisions?.[0]?.['*'] ||
      rawJson?.revisions?.[0]?.content ||
      rawJson?.content ||
      null
    );
  }

  private extractFromRawContent(
    content: string,
    fallbackIntitule: string,
    fallbackDescription: string | null
  ) {
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
      /'''(.+?)'''/,
      /<th[^>]*>[Ii]ntitulé<\/th>\s*<td[^>]*>([^<]+)/,
      /==\s*(.+?)\s*==/,
      /^\s*(.*?)$/m
    ];

    let intitule = fallbackIntitule;
    for (const pattern of intitulePatterns) {
      const match = pattern.exec(content);
      if (match && match[1] && match[1].trim()) {
        intitule = match[1].trim();
        break;
      }
    }

    const descPatterns = [
      /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/,
      /\|\s*[Dd]éfinition\s*=\s*([^\n\|]+)/,
      /<th[^>]*>[Dd]escription<\/th>\s*<td[^>]*>([^<]+)/,
      /\n\n(.+?)(?=\n\n|\[\[|==|$)/s
    ];

    let description = fallbackDescription ?? '';
    for (const pattern of descPatterns) {
      const match = pattern.exec(content);
      if (match && match[1] && match[1].trim()) {
        description = match[1].trim();
        break;
      }
    }

    if (!description && !intitule) {
      return null;
    }

    const cleanedDescription = description
      .replace(/\[\[(.+?)\|(.+?)\]\]/g, '$2')
      .replace(/\[\[(.+?)\]\]/g, '$1')
      .replace(/'''(.+?)'''/g, '$1')
      .replace(/''(.+?)''/g, '$1')
      .replace(/{{.+?}}/g, '')
      .replace(/<ref.*?\/>/g, '')
      .replace(/<.*?>/g, '')
      .trim();

    return {
      intitule: intitule.substring(0, 500),
      description: cleanedDescription.substring(0, 2000),
    };
  }

  private cleanMediaWikiLinks(text: string): string {
    return text
      .replace(/\[\[([^\|\]]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async convertMediaWikiTables() {
    const { _data, _error } = await this.supabase
      .from('oic_competences')
      .select('objectif_id, description')
      .like('description', '%{|%');

    if (_error) throw _error;
    if (!_data || _data.length === 0) return;

    console.log(`   → ${_data.length} tables MediaWiki à convertir`);

    for (const comp of _data) {
      try {
        const convertedDescription = this.convertMediaWikiTable(comp.description || '');

        await this.supabase
          .from('oic_competences')
          .update({
            description: convertedDescription,
            extraction_status: 'cleaned',
          })
          .eq('objectif_id', comp.objectif_id);

        this.report.mediawiki_tables_converted++;
        this.report.total_processed++;
      } catch (err) {
        this.report.errors.push({
          objectif_id: comp.objectif_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  private convertMediaWikiTable(text: string): string {
    return text.replace(/\{\|[\s\S]*?\|\}/g, (table) => this.convertSingleTableToHtml(table));
  }

  private convertSingleTableToHtml(tableText: string): string {
    const lines = tableText.split('\n');
    const rows: Array<{ cells: string[]; isHeader: boolean }> = [];
    let currentRow: { cells: string[]; isHeader: boolean } = { cells: [], isHeader: false };

    const pushRow = () => {
      if (currentRow.cells.length > 0) {
        rows.push(currentRow);
        currentRow = { cells: [], isHeader: false };
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('{|')) {
        continue;
      }
      if (trimmed.startsWith('|}')) {
        pushRow();
        break;
      }
      if (trimmed.startsWith('|-')) {
        pushRow();
        continue;
      }

      const isHeader = trimmed.startsWith('!');
      if (trimmed.startsWith('|') || trimmed.startsWith('!')) {
        const cellContent = trimmed.slice(1).trim();
        const parts = cellContent.split(/!!|\|\|/g);
        const cleanedParts = parts
          .map((cell) => cell.replace(/^[^|]*\|\s*/, '').trim())
          .filter(Boolean);

        if (cleanedParts.length > 0) {
          currentRow.isHeader = currentRow.isHeader || isHeader;
          currentRow.cells.push(...cleanedParts);
        }
      }
    }

    if (rows.length === 0) {
      return tableText;
    }

    const headerRows = rows.filter((row) => row.isHeader);
    const bodyRows = rows.filter((row) => !row.isHeader);

    const thead = headerRows.length
      ? `<thead>${headerRows
          .map(
            (row) =>
              `<tr>${row.cells.map((cell) => `<th>${cell}</th>`).join('')}</tr>`
          )
          .join('')}</thead>`
      : '';

    const tbodyRows = (bodyRows.length ? bodyRows : rows).map(
      (row) => `<tr>${row.cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
    );

    return `<table class="wikitable">${thead}<tbody>${tbodyRows.join('')}</tbody></table>`;
  }

  private async handleEmptyDescriptions() {
    const { _data, _error } = await this.supabase
      .from('oic_competences')
      .select('objectif_id, intitule, rubrique')
      .or('description.is.null, description.eq.');

    if (_error) throw _error;
    if (!_data || _data.length === 0) return;

    console.log(`   → ${_data.length} descriptions vides à gérer`);

    for (const comp of _data) {
      try {
        const generatedDescription = `Compétence en ${comp.rubrique || 'médecine'}: ${comp.intitule}`;

        await this.supabase
          .from('oic_competences')
          .update({
            description: generatedDescription,
            extraction_status: 'generated',
          })
          .eq('objectif_id', comp.objectif_id);

        this.report.empty_descriptions_handled++;
        this.report.total_processed++;
      } catch (err) {
        this.report.errors.push({
          objectif_id: comp.objectif_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }

  private async generateReport() {
    const filename = `oic_cleaning_report_${new Date().toISOString().split('T')[0]}.json`;
    await writeFile(filename, JSON.stringify(this.report, null, 2));
    console.log(`\n📄 Rapport de nettoyage sauvegardé: ${filename}`);

    const { _data: finalStats } = await this.supabase
      .from('oic_competences')
      .select('extraction_status')
      .order('extraction_status');

    if (finalStats) {
      const statusCounts = finalStats.reduce((acc: Record<string, number>, row: any) => {
        acc[row.extraction_status] = (acc[row.extraction_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n📊 Statut final des données:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }
  }
}

const SQL_QUERIES = `
-- Statistiques globales de qualité
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN description IS NULL OR TRIM(description) = '' THEN 1 END) as descriptions_vides,
  COUNT(CASE WHEN LENGTH(TRIM(description)) < 50 THEN 1 END) as descriptions_courtes,
  COUNT(CASE WHEN description LIKE '%&lt;%' THEN 1 END) as html_corrompu,
  COUNT(CASE WHEN description LIKE '-%' OR description LIKE '*%' THEN 1 END) as fragments,
  COUNT(CASE WHEN intitule LIKE '%[[%]]%' THEN 1 END) as intitules_corrompus,
  COUNT(CASE WHEN extraction_status = 'cleaned' THEN 1 END) as nettoyes,
  COUNT(CASE WHEN extraction_status = 'generated' THEN 1 END) as generes
FROM oic_competences;

-- Top 10 des items avec le plus de problèmes
SELECT 
  item_parent,
  COUNT(*) as total_competences,
  COUNT(CASE WHEN extraction_status != 'complete' THEN 1 END) as problematiques
FROM oic_competences
GROUP BY item_parent
HAVING COUNT(CASE WHEN extraction_status != 'complete' THEN 1 END) > 0
ORDER BY problematiques DESC
LIMIT 10;

-- Exemples de chaque type de problème
-- HTML corrompu
SELECT objectif_id, intitule, LEFT(description, 100) as description_preview
FROM oic_competences 
WHERE description LIKE '%&lt;%' 
LIMIT 5;

-- Fragments
SELECT objectif_id, intitule, description
FROM oic_competences 
WHERE description LIKE '-%' OR description LIKE '*%'
LIMIT 5;

-- Intitulés corrompus
SELECT objectif_id, intitule
FROM oic_competences 
WHERE intitule LIKE '%[[%]]%'
LIMIT 5;
`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('💡 Requêtes SQL utiles pour le monitoring:');
  console.log(SQL_QUERIES);
  console.log('\n' + '='.repeat(50) + '\n');

  const cleaner = new OICDataCleaner();
  cleaner.run().catch(console.error);
}
