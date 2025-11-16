import { previewLyricsForItem } from './generateAllAdvancedLyrics';

/**
 * Script de test pour vérifier la génération de paroles
 * Usage: Importer et appeler testLyricsGeneration() depuis la console du navigateur
 */
export async function testLyricsGeneration(itemCode: string = 'IC-001') {
  console.log('═══════════════════════════════════════════════════');
  console.log(`🎵 TEST DE GÉNÉRATION DE PAROLES POUR ${itemCode}`);
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Test pour chaque rang
    const rangs: Array<'A' | 'B' | 'AB'> = ['A', 'B', 'AB'];

    for (const rang of rangs) {
      console.log(`\n┌─────────────────────────────────────────┐`);
      console.log(`│  RANG ${rang.padEnd(2)} - Style Nekfeu             │`);
      console.log(`└─────────────────────────────────────────┘\n`);

      const lyrics = await previewLyricsForItem(itemCode, rang);

      // Afficher les paroles avec structure
      console.log('Paroles générées:\n');
      lyrics.forEach((line, index) => {
        // Highlight des sections
        if (line.startsWith('[')) {
          console.log(`\n${line}`);
        } else if (line === '---' || line === '[Pause]') {
          console.log('');
        } else {
          console.log(`  ${line}`);
        }
      });

      // Statistiques
      const totalLines = lyrics.filter(l => !l.startsWith('[') && l !== '---' && l !== '[Pause]').length;
      const totalChars = lyrics.join('\n').length;
      const hasRefrain = lyrics.some(l => l.includes('[Refrain]'));
      const coupletCount = lyrics.filter(l => l.includes('[Couplet')).length;

      console.log(`\n┌─────────────────────────────────────────┐`);
      console.log(`│  STATISTIQUES                           │`);
      console.log(`├─────────────────────────────────────────┤`);
      console.log(`│  Lignes totales: ${totalLines.toString().padEnd(23)}│`);
      console.log(`│  Caractères: ${totalChars.toString().padEnd(27)}│`);
      console.log(`│  Nombre de couplets: ${coupletCount.toString().padEnd(18)}│`);
      console.log(`│  Refrain présent: ${(hasRefrain ? 'Oui' : 'Non').padEnd(21)}│`);
      console.log(`└─────────────────────────────────────────┘`);

      // Vérification conformité cahier des charges
      const checks = {
        '✓ Refrain répétitif présent': hasRefrain,
        '✓ Au moins 3 couplets': coupletCount >= 3,
        '✓ Moins de 5000 caractères': totalChars <= 5000,
        '✓ Au moins 15 lignes': totalLines >= 15
      };

      console.log(`\n┌─────────────────────────────────────────┐`);
      console.log(`│  CONFORMITÉ CAHIER DES CHARGES          │`);
      console.log(`├─────────────────────────────────────────┤`);
      Object.entries(checks).forEach(([check, passed]) => {
        const icon = passed ? '✅' : '❌';
        console.log(`│  ${icon} ${check.padEnd(38)}│`);
      });
      console.log(`└─────────────────────────────────────────┘`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ TEST TERMINÉ AVEC SUCCÈS');
    console.log('═══════════════════════════════════════════════════\n');

    return true;

  } catch (error) {
    console.error('❌ ERREUR PENDANT LE TEST:', error);
    return false;
  }
}

/**
 * Test rapide pour un seul rang
 */
export async function quickTest(itemCode: string = 'IC-001', rang: 'A' | 'B' | 'AB' = 'A') {
  console.log(`\n🎵 Test rapide: ${itemCode} Rang ${rang}\n`);

  const lyrics = await previewLyricsForItem(itemCode, rang);

  console.log('Paroles générées:');
  lyrics.slice(0, 30).forEach((line, index) => {
    console.log(`  ${line}`);
  });

  if (lyrics.length > 30) {
    console.log(`\n... (${lyrics.length - 30} lignes supplémentaires)\n`);
  }

  console.log(`\nTotal: ${lyrics.length} lignes, ${lyrics.join('\n').length} caractères`);

  return lyrics;
}
