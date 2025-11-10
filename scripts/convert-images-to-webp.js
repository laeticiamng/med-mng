/**
 * Script de conversion d'images en WebP
 * Convertit automatiquement toutes les images JPG, JPEG et PNG en WebP
 * pour améliorer les performances et réduire la taille des fichiers
 * 
 * Usage: node scripts/convert-images-to-webp.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIRS = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../src/assets'),
];

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];

// Configuration WebP
const WEBP_CONFIG = {
  quality: 85, // Qualité de 1 à 100
  effort: 6,   // Effort de compression de 0 à 6 (plus élevé = meilleure compression mais plus lent)
  lossless: false,
};

/**
 * Récupère tous les fichiers d'un dossier récursivement
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Convertit une image en WebP
 */
async function convertToWebP(inputPath) {
  const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  // Ne pas reconvertir si le fichier WebP existe déjà et est plus récent
  if (fs.existsSync(outputPath)) {
    const inputStat = fs.statSync(inputPath);
    const outputStat = fs.statSync(outputPath);
    
    if (outputStat.mtime > inputStat.mtime) {
      console.log(`⏭️  Skip: ${path.basename(outputPath)} (déjà à jour)`);
      return { skipped: true };
    }
  }

  try {
    const metadata = await sharp(inputPath).metadata();
    
    await sharp(inputPath)
      .webp(WEBP_CONFIG)
      .toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

    console.log(
      `✅ ${path.basename(inputPath)} → ${path.basename(outputPath)} ` +
      `(${formatBytes(originalSize)} → ${formatBytes(webpSize)}, -${savings}%)`
    );

    return {
      original: inputPath,
      webp: outputPath,
      originalSize,
      webpSize,
      savings: parseFloat(savings),
    };
  } catch (error) {
    console.error(`❌ Erreur lors de la conversion de ${inputPath}:`, error.message);
    return { error: true };
  }
}

/**
 * Formate la taille en bytes en format lisible
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Script principal
 */
async function main() {
  console.log('🖼️  CONVERSION D\'IMAGES EN WEBP\n');
  console.log('Configuration:');
  console.log(`  • Qualité: ${WEBP_CONFIG.quality}/100`);
  console.log(`  • Effort: ${WEBP_CONFIG.effort}/6`);
  console.log(`  • Lossless: ${WEBP_CONFIG.lossless ? 'Oui' : 'Non'}\n`);
  console.log('─'.repeat(70));

  let allFiles = [];
  IMAGE_DIRS.forEach(dir => {
    const files = getAllFiles(dir);
    allFiles = allFiles.concat(files);
  });

  if (allFiles.length === 0) {
    console.log('\n⚠️  Aucune image trouvée à convertir.');
    return;
  }

  console.log(`\n📁 ${allFiles.length} image(s) trouvée(s)\n`);

  const results = [];
  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of allFiles) {
    const result = await convertToWebP(file);
    
    if (result.skipped) {
      skipped++;
    } else if (result.error) {
      errors++;
    } else {
      results.push(result);
      totalOriginalSize += result.originalSize;
      totalWebpSize += result.webpSize;
      converted++;
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log('\n📊 RÉSUMÉ:\n');
  console.log(`  ✅ Converties: ${converted}`);
  console.log(`  ⏭️  Ignorées: ${skipped}`);
  console.log(`  ❌ Erreurs: ${errors}`);
  
  if (converted > 0) {
    const totalSavings = ((totalOriginalSize - totalWebpSize) / totalOriginalSize * 100).toFixed(1);
    console.log(`\n  💾 Économie totale: ${formatBytes(totalOriginalSize - totalWebpSize)} (-${totalSavings}%)`);
    console.log(`  📦 Taille originale: ${formatBytes(totalOriginalSize)}`);
    console.log(`  🎯 Taille WebP: ${formatBytes(totalWebpSize)}`);
  }

  console.log('\n' + '─'.repeat(70));
  console.log('\n✨ Conversion terminée!\n');

  if (converted > 0) {
    console.log('💡 Conseil: Utilisez le composant <OptimizedImage /> avec webp={true}');
    console.log('   pour bénéficier automatiquement des images WebP avec fallback.\n');
  }
}

main().catch(console.error);
