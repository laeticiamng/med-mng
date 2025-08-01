import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

interface OICCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: string;
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
  raw_json: any;
  hash_content: string;
  extraction_status: string;
  date_import: string;
  updated_at: string;
}

interface ExtractionStats {
  total_pages: number;
  processed: number;
  updated: number;
  errors: number;
  skipped: number;
}

export class OICExtractor {
  private cookies: string;
  private supabase: any;
  private stats: ExtractionStats = {
    total_pages: 0,
    processed: 0,
    updated: 0,
    errors: 0,
    skipped: 0
  };

  constructor(cookies: string) {
    this.cookies = cookies;
    
    // Initialiser Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY requis pour l\'extraction');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async extractAllOICCompetences(): Promise<ExtractionStats> {
    try {
      console.log('🚀 Démarrage extraction OIC avec cookies authentifiés...');
      
      // Récupérer la liste des pages OIC
      const oicPages = await this.fetchOICPagesList();
      this.stats.total_pages = oicPages.length;
      
      console.log(`📊 ${oicPages.length} pages OIC trouvées`);
      
      if (oicPages.length === 0) {
        throw new Error('Aucune page OIC trouvée - vérifier les cookies');
      }

      // Récupérer les compétences existantes pour identifier les manquantes
      const existingCompetences = await this.getExistingCompetences();
      console.log(`📋 ${existingCompetences.length} compétences existantes en base`);
      
      const incompletes = existingCompetences.filter(c => 
        !c.description || c.description.trim() === ''
      );
      console.log(`🔍 ${incompletes.length} compétences sans description à compléter`);

      // Traitement par lots
      const batchSize = 20;
      const competences: OICCompetence[] = [];
      
      for (let i = 0; i < oicPages.length; i += batchSize) {
        const batch = oicPages.slice(i, i + batchSize);
        console.log(`🔄 Traitement lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(oicPages.length/batchSize)}`);
        
        for (const page of batch) {
          try {
            this.stats.processed++;
            
            // Vérifier si cette compétence a besoin d'être mise à jour
            const needsUpdate = this.needsUpdate(page.title, existingCompetences);
            
            if (!needsUpdate) {
              this.stats.skipped++;
              continue;
            }
            
            const competence = await this.extractOICPage(page);
            
            if (competence && competence.description) {
              competences.push(competence);
              this.stats.updated++;
              console.log(`✅ Mis à jour: ${competence.objectif_id}`);
            }
            
          } catch (error) {
            this.stats.errors++;
            console.error(`❌ Erreur page ${page.title}:`, error.message);
          }
        }
        
        // Pause entre les lots
        await this.sleep(500);
      }

      // Sauvegarder en base
      if (competences.length > 0) {
        await this.saveCompetences(competences);
        console.log(`💾 ${competences.length} compétences sauvegardées`);
      }

      // Générer le rapport final
      await this.generateReport();
      
      console.log('🎉 Extraction OIC terminée avec succès');
      return this.stats;
      
    } catch (error) {
      console.error('💥 Erreur extraction OIC:', error);
      throw error;
    }
  }

  private async fetchOICPagesList(): Promise<any[]> {
    const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Cat%C3%A9gorie:Objectif_de_connaissance&cmlimit=500&format=json';
    
    const response = await fetch(apiUrl, {
      headers: {
        'Cookie': this.cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API MediaWiki: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Erreur MediaWiki: ${data.error.info}`);
    }
    
    return data.query?.categorymembers || [];
  }

  private async getExistingCompetences(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('backup_oic_competences')
      .select('objectif_id, description');
    
    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }
    
    return data || [];
  }

  private needsUpdate(pageTitle: string, existingCompetences: any[]): boolean {
    const objectifIdMatch = pageTitle.match(/Objectif_de_connaissance_(\d+_\d+_[A-Z]_\d+)/);
    if (!objectifIdMatch) return false;
    
    const objectifId = objectifIdMatch[1];
    const existing = existingCompetences.find(c => c.objectif_id === objectifId);
    
    // Mettre à jour si pas de description ou description vide
    return !existing || !existing.description || existing.description.trim() === '';
  }

  private async extractOICPage(page: any): Promise<OICCompetence | null> {
    const pageApiUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&titles=${encodeURIComponent(page.title)}&prop=revisions&rvprop=content&format=json`;
    
    const response = await fetch(pageApiUrl, {
      headers: {
        'Cookie': this.cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur fetch page ${page.title}: ${response.status}`);
    }
    
    const data = await response.json();
    const pages = data.query?.pages || {};
    const pageContent = Object.values(pages)[0] as any;
    
    if (!pageContent?.revisions?.[0]?.['*']) {
      return null;
    }
    
    const wikiContent = pageContent.revisions[0]['*'];
    return this.parseOICContent(page.title, wikiContent, pageApiUrl);
  }

  private parseOICContent(title: string, wikiContent: string, sourceUrl: string): OICCompetence | null {
    try {
      // Extraire l'ID de l'objectif
      const objectifIdMatch = title.match(/Objectif_de_connaissance_(\d+_\d+_[A-Z]_\d+)/);
      if (!objectifIdMatch) return null;
      
      const objectifId = objectifIdMatch[1];
      const rang = objectifId.includes('_A_') ? 'A' : 'B';
      
      // Extraire l'item parent (IC-XX)
      const itemMatch = objectifId.match(/^(\d+)_/);
      const itemParent = itemMatch ? `IC-${itemMatch[1]}` : '';
      
      // Extraire l'intitulé
      const intituleMatch = wikiContent.match(/=\s*(.+?)\s*=/) || 
                           wikiContent.match(/'''\s*(.+?)\s*'''/) ||
                           wikiContent.match(/\*\s*(.+?)(?:\n|$)/);
      const intitule = intituleMatch ? intituleMatch[1].trim() : title.replace(/Objectif_de_connaissance_/, '');
      
      // Extraire la rubrique
      const rubriqueMatch = wikiContent.match(/\[\[Catégorie:([^\]]+)\]\]/);
      const rubrique = rubriqueMatch ? rubriqueMatch[1] : 'Objectif_de_connaissance';
      
      // Extraire la description (premier paragraphe significatif)
      const lines = wikiContent.split('\n').filter(line => line.trim());
      const descriptionLines = lines.filter(line => 
        !line.startsWith('=') && 
        !line.startsWith('[[') && 
        !line.startsWith('{') &&
        line.trim().length > 10
      );
      const description = descriptionLines.slice(0, 3).join(' ').substring(0, 500);
      
      // Calculer hash du contenu
      const hashContent = Buffer.from(wikiContent).toString('base64').substring(0, 32);
      
      return {
        objectif_id: objectifId,
        intitule: intitule,
        item_parent: itemParent,
        rang: rang,
        rubrique: rubrique,
        description: description || '',
        ordre: parseInt(objectifId.split('_')[3]) || 0,
        url_source: sourceUrl,
        raw_json: {
          title: title,
          wiki_content: wikiContent,
          extraction_method: 'github_actions_puppeteer'
        },
        hash_content: hashContent,
        extraction_status: 'completed',
        date_import: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erreur parsing OIC:', error);
      return null;
    }
  }

  private async saveCompetences(competences: OICCompetence[]): Promise<void> {
    const { error } = await this.supabase
      .from('backup_oic_competences')
      .upsert(competences, {
        onConflict: 'objectif_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      throw new Error(`Erreur sauvegarde Supabase: ${error.message}`);
    }
  }

  private async generateReport(): Promise<void> {
    const report = {
      success: true,
      message: 'Extraction OIC GitHub Actions terminée',
      stats: this.stats,
      timestamp: new Date().toISOString(),
      method: 'github_actions_puppeteer',
      session_id: Math.random().toString(36).substring(7)
    };
    
    // Sauvegarder le rapport
    const reportPath = '.cache/extraction-report.json';
    const dir = path.dirname(reportPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Rapport sauvegardé: ${reportPath}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Script principal
if (require.main === module) {
  async function main() {
    // Créer le dossier .cache/ en premier
    if (!fs.existsSync('.cache')) {
      fs.mkdirSync('.cache', { recursive: true });
      console.log('📁 Dossier .cache créé pour extraction');
    }
    
    try {
      // Charger les cookies depuis le fichier
      const cookiesPath = '.cache/cookies.txt';
      
      if (!fs.existsSync(cookiesPath)) {
        const errorMsg = `Fichier cookies introuvable: ${cookiesPath}. Exécuter d'abord generate-cas-cookie.ts`;
        console.error('❌', errorMsg);
        fs.writeFileSync('.cache/extraction-error.log', errorMsg);
        throw new Error(errorMsg);
      }
      
      const cookieData = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
      const cookies = cookieData.cookies;
      
      if (!cookies) {
        const errorMsg = 'Cookies vides dans le fichier';
        console.error('❌', errorMsg);
        fs.writeFileSync('.cache/extraction-error.log', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('🍪 Cookies chargés depuis le cache');
      
      // Lancer l'extraction
      const extractor = new OICExtractor(cookies);
      const stats = await extractor.extractAllOICCompetences();
      
      console.log('📊 Statistiques finales:', stats);
      
      // Écrire un fichier de succès
      fs.writeFileSync('.cache/extraction-success.json', JSON.stringify({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      }, null, 2));
      
    } catch (error) {
      console.error('💥 Erreur extraction:', error);
      
      // Toujours écrire un rapport, même en cas d'erreur
      const errorReport = {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync('.cache/extraction-error.json', JSON.stringify(errorReport, null, 2));
      process.exit(1);
    }
  }
  
  main();
}