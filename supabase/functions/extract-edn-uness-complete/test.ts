/**
 * Tests unitaires pour extract-edn-uness-complete
 *
 * Pour exécuter les tests:
 * deno test --allow-all test.ts
 */

import { assertEquals, assertExists, assert } from "https://deno.land/std@0.190.0/testing/asserts.ts";

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_HTML_WITH_H1 = `
  <html>
    <head><title>Test</title></head>
    <body>
      <h1>Item 1 - Cardiologie et Maladies Vasculaires</h1>
      <div>Content</div>
    </body>
  </html>
`;

const MOCK_HTML_WITH_RANGS = `
  <html>
    <body>
      <h2>Rang A</h2>
      <ul>
        <li>Connaissance importante numéro 1 de rang A</li>
        <li>Connaissance importante numéro 2 de rang A</li>
        <li>Connaissance importante numéro 3 de rang A</li>
      </ul>

      <h2>Rang B</h2>
      <ul>
        <li>Connaissance importante numéro 1 de rang B</li>
        <li>Connaissance importante numéro 2 de rang B</li>
      </ul>
    </body>
  </html>
`;

const MOCK_HTML_WITH_RANGS_TABLE = `
  <html>
    <body>
      <table>
        <tr><th>Rang A</th></tr>
        <tr><td>Connaissance de cardiologie importante pour le diagnostic</td></tr>
        <tr><td>Connaissance de physiologie cardiaque essentielle</td></tr>
      </table>
    </body>
  </html>
`;

// ============================================================================
// HELPER FUNCTIONS (Copie des fonctions à tester)
// ============================================================================

function extractIntitule(html: string, itemId: number): string {
  const patterns = [
    /<h1[^>]*class="[^"]*titre[^"]*"[^>]*>([^<]+)<\/h1>/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<title[^>]*>([^<]+)<\/title>/i,
    /<div[^>]*class="[^"]*intitule[^"]*"[^>]*>([^<]+)<\/div>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const intitule = match[1]
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/Item \d+ - /, '');

      if (intitule.length > 5) {
        return intitule;
      }
    }
  }

  return `Item ${itemId}`;
}

function cleanObjectiveText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s*[-•*]\s*/, '')
    .trim();
}

function isValidObjective(text: string): boolean {
  if (!text || text.length < 15) {
    return false;
  }

  const excludePatterns = [
    /^(rang|objectif|connaissance|item)\s*$/i,
    /^\s*[a-z]\s*$/i,
    /^[\s\d\-•*]+$/,
    /^(table des matières|sommaire|introduction)/i,
    /^\s*(voir|cf\.|référence)\s/i
  ];

  for (const pattern of excludePatterns) {
    if (pattern.test(text)) {
      return false;
    }
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 2).length;
  if (wordCount < 3) {
    return false;
  }

  return true;
}

interface EdnItem {
  item_id: number;
  intitule: string;
  rangs_a: string[];
  rangs_b: string[];
  contenu_complet_html: string;
  extraction_status: 'success' | 'partial' | 'failed' | 'pending';
  metadata?: {
    extraction_date: string;
    content_length: number;
    rangs_a_count: number;
    rangs_b_count: number;
    version: string;
    quality_score: number;
  };
}

function validateEdnItem(item: EdnItem): { valid: boolean; warnings: string[]; score: number } {
  const warnings: string[] = [];
  let score = 100;

  if (!item.intitule || item.intitule.length < 10) {
    warnings.push(`Item ${item.item_id}: Intitulé trop court ou manquant`);
    score -= 20;
  }

  if (item.rangs_a.length === 0 && item.rangs_b.length === 0) {
    warnings.push(`Item ${item.item_id}: Aucun rang A ou B trouvé`);
    score -= 30;
  }

  if (!item.contenu_complet_html || item.contenu_complet_html.length < 100) {
    warnings.push(`Item ${item.item_id}: Contenu HTML incomplet`);
    score -= 25;
  }

  const hasGenericRangA = item.rangs_a.some(r => r.includes('Extraction nécessitant une révision manuelle'));
  const hasGenericRangB = item.rangs_b.some(r => r.includes('Extraction nécessitant une révision manuelle'));

  if (hasGenericRangA || hasGenericRangB) {
    warnings.push(`Item ${item.item_id}: Rangs génériques détectés - révision manuelle requise`);
    score -= 15;
  }

  return {
    valid: score >= 40,
    warnings,
    score: Math.max(0, score)
  };
}

// ============================================================================
// TESTS
// ============================================================================

Deno.test("extractIntitule - should extract title from h1", () => {
  const result = extractIntitule(MOCK_HTML_WITH_H1, 1);
  assertEquals(result, "Cardiologie et Maladies Vasculaires");
});

Deno.test("extractIntitule - should return fallback for invalid HTML", () => {
  const result = extractIntitule("<html><body></body></html>", 42);
  assertEquals(result, "Item 42");
});

Deno.test("extractIntitule - should remove 'Item X -' prefix", () => {
  const html = "<h1>Item 5 - Neurologie</h1>";
  const result = extractIntitule(html, 5);
  assertEquals(result, "Neurologie");
});

Deno.test("cleanObjectiveText - should remove HTML tags", () => {
  const html = "<p>Test <strong>important</strong></p>";
  const result = cleanObjectiveText(html);
  assertEquals(result, "Test important");
});

Deno.test("cleanObjectiveText - should normalize whitespace", () => {
  const html = "Test   multiple    spaces";
  const result = cleanObjectiveText(html);
  assertEquals(result, "Test multiple spaces");
});

Deno.test("cleanObjectiveText - should remove bullets", () => {
  const html = "• Connaissance importante";
  const result = cleanObjectiveText(html);
  assertEquals(result, "Connaissance importante");
});

Deno.test("isValidObjective - should accept valid objective", () => {
  const text = "Connaissance importante pour le diagnostic médical";
  const result = isValidObjective(text);
  assertEquals(result, true);
});

Deno.test("isValidObjective - should reject too short text", () => {
  const text = "Court";
  const result = isValidObjective(text);
  assertEquals(result, false);
});

Deno.test("isValidObjective - should reject excluded patterns", () => {
  assertEquals(isValidObjective("rang"), false);
  assertEquals(isValidObjective("objectif"), false);
  assertEquals(isValidObjective("Table des matières"), false);
});

Deno.test("isValidObjective - should reject text with too few words", () => {
  const text = "Un deux"; // Seulement 2 mots
  const result = isValidObjective(text);
  assertEquals(result, false);
});

Deno.test("validateEdnItem - should score perfect item at 100", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Cardiologie et Maladies Vasculaires",
    rangs_a: ["Connaissance A1", "Connaissance A2"],
    rangs_b: ["Connaissance B1"],
    contenu_complet_html: "<html><body>" + "X".repeat(200) + "</body></html>",
    extraction_status: "success"
  };

  const result = validateEdnItem(item);
  assertEquals(result.score, 100);
  assertEquals(result.valid, true);
  assertEquals(result.warnings.length, 0);
});

Deno.test("validateEdnItem - should penalize short intitule", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Court",
    rangs_a: ["Connaissance A1"],
    rangs_b: ["Connaissance B1"],
    contenu_complet_html: "<html><body>" + "X".repeat(200) + "</body></html>",
    extraction_status: "success"
  };

  const result = validateEdnItem(item);
  assertEquals(result.score, 80); // -20 pour intitulé court
  assert(result.warnings.some(w => w.includes("Intitulé trop court")));
});

Deno.test("validateEdnItem - should penalize missing rangs", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Cardiologie et Maladies Vasculaires",
    rangs_a: [],
    rangs_b: [],
    contenu_complet_html: "<html><body>" + "X".repeat(200) + "</body></html>",
    extraction_status: "failed"
  };

  const result = validateEdnItem(item);
  assertEquals(result.score, 70); // -30 pour aucun rang
  assert(result.warnings.some(w => w.includes("Aucun rang")));
});

Deno.test("validateEdnItem - should penalize short content", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Cardiologie et Maladies Vasculaires",
    rangs_a: ["Connaissance A1"],
    rangs_b: ["Connaissance B1"],
    contenu_complet_html: "Short",
    extraction_status: "partial"
  };

  const result = validateEdnItem(item);
  assertEquals(result.score, 75); // -25 pour contenu court
  assert(result.warnings.some(w => w.includes("Contenu HTML incomplet")));
});

Deno.test("validateEdnItem - should penalize generic rangs", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Cardiologie et Maladies Vasculaires",
    rangs_a: ["Connaissances de rang A pour l'item 1 - Extraction nécessitant une révision manuelle"],
    rangs_b: ["Connaissance B1"],
    contenu_complet_html: "<html><body>" + "X".repeat(200) + "</body></html>",
    extraction_status: "partial"
  };

  const result = validateEdnItem(item);
  assertEquals(result.score, 85); // -15 pour rangs génériques
  assert(result.warnings.some(w => w.includes("Rangs génériques")));
});

Deno.test("validateEdnItem - should mark as invalid if score < 40", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Court",
    rangs_a: [],
    rangs_b: [],
    contenu_complet_html: "Short",
    extraction_status: "failed"
  };

  const result = validateEdnItem(item);
  assertEquals(result.score, 25); // -20 -30 -25 = 25
  assertEquals(result.valid, false);
  assertEquals(result.warnings.length, 3);
});

Deno.test("validateEdnItem - cumulative penalties", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "C", // Court
    rangs_a: ["Connaissances de rang A pour l'item 1 - Extraction nécessitant une révision manuelle"],
    rangs_b: [],
    contenu_complet_html: "X", // Court
    extraction_status: "failed"
  };

  const result = validateEdnItem(item);
  // -20 (intitulé) -25 (contenu) -15 (générique) = 40
  assertEquals(result.score, 40);
  assertEquals(result.valid, true); // Seuil à 40
  assertEquals(result.warnings.length, 3);
});

// ============================================================================
// TESTS D'INTÉGRATION (nécessitent credentials réels)
// ============================================================================

Deno.test({
  name: "Integration - Full extraction test",
  ignore: true, // Activer seulement si credentials disponibles
  async fn() {
    // Ce test nécessite des credentials UNESS réels
    // et peut être exécuté manuellement
    console.log("⚠️ Test d'intégration ignoré - nécessite credentials UNESS");
  }
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

Deno.test("Performance - cleanObjectiveText on large text", () => {
  const largeHtml = "<p>" + "X ".repeat(10000) + "</p>";
  const start = performance.now();
  const result = cleanObjectiveText(largeHtml);
  const duration = performance.now() - start;

  assert(duration < 100, `cleanObjectiveText trop lent: ${duration}ms`);
  assertExists(result);
});

Deno.test("Performance - validateEdnItem", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Cardiologie et Maladies Vasculaires",
    rangs_a: Array(100).fill("Connaissance importante"),
    rangs_b: Array(50).fill("Connaissance importante"),
    contenu_complet_html: "<html><body>" + "X".repeat(50000) + "</body></html>",
    extraction_status: "success"
  };

  const start = performance.now();
  const result = validateEdnItem(item);
  const duration = performance.now() - start;

  assert(duration < 50, `validateEdnItem trop lent: ${duration}ms`);
  assertEquals(result.valid, true);
});

// ============================================================================
// EDGE CASES
// ============================================================================

Deno.test("Edge case - Empty HTML", () => {
  const result = extractIntitule("", 1);
  assertEquals(result, "Item 1");
});

Deno.test("Edge case - Malformed HTML", () => {
  const html = "<h1>Unclosed tag";
  const result = extractIntitule(html, 1);
  assertEquals(result, "Unclosed tag");
});

Deno.test("Edge case - Special characters in objective", () => {
  const text = "Connaissance avec caractères spéciaux: é, è, à, ç, ê";
  const result = isValidObjective(text);
  assertEquals(result, true);
});

Deno.test("Edge case - validateEdnItem with undefined metadata", () => {
  const item: EdnItem = {
    item_id: 1,
    intitule: "Cardiologie",
    rangs_a: ["A1"],
    rangs_b: ["B1"],
    contenu_complet_html: "X".repeat(200),
    extraction_status: "success",
    metadata: undefined
  };

  const result = validateEdnItem(item);
  assertEquals(result.valid, true);
  assertEquals(result.score, 100);
});

console.log("\n✅ Tous les tests sont définis et prêts à être exécutés\n");
console.log("Pour exécuter les tests:");
console.log("  deno test --allow-all test.ts\n");
