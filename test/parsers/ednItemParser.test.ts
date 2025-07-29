/**
 * 🧪 TESTS UNITAIRES - Parser EDN Items
 * Point 2.1 du ticket global : Couverture complète des parseurs critiques
 */

import { EDNItemParser, ParsedEDNItem } from '../../src/parsers/ednItemParser';
import { ItemEDNV2 } from '../../src/schemas/itemEDNSchema';

describe('🔍 EDNItemParser - Tests critiques', () => {
  
  // Mock data v2 valide
  const validItemV2: ItemEDNV2 = {
    item_metadata: {
      version: 'v2.1',
      code: 'IC-001',
      title: 'Communication médecin-malade',
      subtitle: 'Relation thérapeutique',
      slug: 'ic-001-communication',
      category: 'fondamentaux',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T12:00:00Z'
    },
    content: {
      rang_a: {
        theme: 'Communication de base',
        competences: [
          {
            competence_id: 'IC001-A-01',
            concept: 'Écoute active',
            definition: 'Technique de communication thérapeutique',
            exemple: 'Reformulation empathique',
            piege: 'Interruption du patient',
            mnemo: 'ECOUTER = E.C.O.U.T.E.R',
            subtilite: 'Silence thérapeutique',
            application: 'Consultation première',
            vigilance: 'Non-verbal contradictoire',
            paroles_chantables: [
              'Écouter c\'est soigner déjà',
              'L\'empathie guide ma voix'
            ]
          }
        ]
      },
      rang_b: {
        theme: 'Communication complexe',
        competences: [
          {
            competence_id: 'IC001-B-01',
            concept: 'Annonce difficile',
            definition: 'Communication de mauvaises nouvelles',
            exemple: 'Protocole SPIKES',
            piege: 'Évitement émotionnel',
            mnemo: 'SPIKES = S.P.I.K.E.S',
            subtilite: 'Gestion du déni',
            application: 'Annonce diagnostic',
            vigilance: 'Réaction famille',
            paroles_chantables: [
              'Annoncer avec délicatesse',
              'La vérité avec tendresse'
            ]
          }
        ]
      }
    },
    generation_config: {
      music_enabled: true,
      bd_enabled: true,
      quiz_enabled: true,
      interactive_enabled: true
    }
  };

  // Mock data v1 legacy
  const validItemV1 = {
    item_code: 'IC-002',
    title: 'Item legacy',
    subtitle: 'Format ancien',
    slug: 'ic-002-legacy',
    tableau_rang_a: {
      theme: 'Legacy Rang A',
      lignes: [['Concept 1', 'Déf 1', 'Ex 1']],
      colonnes: [
        { nom: 'Concept', couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-800' }
      ]
    },
    tableau_rang_b: {
      theme: 'Legacy Rang B',
      lignes: [['Concept 2', 'Déf 2', 'Ex 2']],
      colonnes: [
        { nom: 'Concept', couleur: 'bg-green-600', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' }
      ]
    },
    paroles_musicales: ['Paroles legacy'],
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  };

  describe('🎯 Détection de format', () => {
    
    test('✅ Détecte correctement un item v2', () => {
      expect(EDNItemParser.isItemV2(validItemV2)).toBe(true);
    });

    test('✅ Détecte correctement un item v1', () => {
      expect(EDNItemParser.isItemV2(validItemV1)).toBe(false);
    });

    test('❌ Rejette un objet invalide', () => {
      expect(EDNItemParser.isItemV2({})).toBe(false);
      expect(EDNItemParser.isItemV2(null)).toBe(false);
      expect(EDNItemParser.isItemV2(undefined)).toBe(false);
    });

    test('❌ Rejette une version incorrecte', () => {
      const invalidVersion = {
        ...validItemV2,
        item_metadata: { ...validItemV2.item_metadata, version: 'v1.0' }
      };
      expect(EDNItemParser.isItemV2(invalidVersion)).toBe(false);
    });
  });

  describe('🔧 Parser V2 (format moderne)', () => {
    
    test('✅ Parse correctement un item v2 complet', () => {
      const result = EDNItemParser.parseItemV2(validItemV2, 'test-id-123');
      
      // Métadonnées
      expect(result.id).toBe('test-id-123');
      expect(result.item_code).toBe('IC-001');
      expect(result.title).toBe('Communication médecin-malade');
      expect(result.subtitle).toBe('Relation thérapeutique');
      expect(result.slug).toBe('ic-001-communication');
      
      // Tableau Rang A
      expect(result.tableau_rang_a.theme).toBe('Communication de base');
      expect(result.tableau_rang_a.lignes).toHaveLength(1);
      expect(result.tableau_rang_a.lignes[0]).toEqual([
        'Écoute active',
        'Technique de communication thérapeutique',
        'Reformulation empathique',
        'Interruption du patient',
        'ECOUTER = E.C.O.U.T.E.R',
        'Silence thérapeutique',
        'Consultation première',
        'Non-verbal contradictoire'
      ]);
      expect(result.tableau_rang_a.colonnes).toHaveLength(8);
      
      // Tableau Rang B
      expect(result.tableau_rang_b.theme).toBe('Communication complexe');
      expect(result.tableau_rang_b.lignes).toHaveLength(1);
      
      // Paroles musicales
      expect(result.paroles_musicales).toHaveLength(2);
      expect(result.paroles_musicales[0]).toContain('Écouter c\'est soigner déjà');
      expect(result.paroles_musicales[1]).toContain('Annoncer avec délicatesse');
      
      // Configuration
      expect(result.generation_config.music_enabled).toBe(true);
      expect(result.generation_config.quiz_enabled).toBe(true);
      
      // Timestamps
      expect(result.created_at).toBe('2024-01-01T10:00:00Z');
      expect(result.updated_at).toBe('2024-01-01T12:00:00Z');
    });

    test('🔧 Génère correctement les questions de quiz', () => {
      const result = EDNItemParser.parseItemV2(validItemV2, 'test-quiz');
      
      expect(result.quiz_questions).toBeDefined();
      expect(result.quiz_questions.questions).toHaveLength(2); // 1 rang A + 1 rang B
      
      const firstQuestion = result.quiz_questions.questions[0];
      expect(firstQuestion.id).toBe('IC-001_Q1');
      expect(firstQuestion.question).toContain('écoute active');
      expect(firstQuestion.options).toHaveLength(4);
      expect(firstQuestion.correct_answer).toBe(0);
      expect(firstQuestion.explanation).toBe('Silence thérapeutique');
    });

    test('🎬 Génère correctement la scène immersive', () => {
      const result = EDNItemParser.parseItemV2(validItemV2, 'test-scene');
      
      expect(result.scene_immersive).toEqual({
        type: 'medical_scenario',
        theme: 'Communication médecin-malade',
        category: 'fondamentaux',
        interactions_enabled: true
      });
    });
  });

  describe('🔧 Parser V1 (rétrocompatibilité)', () => {
    
    test('✅ Parse correctement un item v1 legacy', () => {
      const result = EDNItemParser.parseAnyItem(validItemV1, 'legacy-id');
      
      expect(result.id).toBe('legacy-id');
      expect(result.item_code).toBe('IC-002');
      expect(result.title).toBe('Item legacy');
      expect(result.tableau_rang_a.theme).toBe('Legacy Rang A');
      expect(result.tableau_rang_b.theme).toBe('Legacy Rang B');
      expect(result.paroles_musicales).toEqual(['Paroles legacy']);
    });
  });

  describe('🛡️ Cas d\'erreur et edge cases', () => {
    
    test('❌ Gère un item v2 malformé', () => {
      const malformedItem = {
        item_metadata: { version: 'v2.1' }, // Métadonnées incomplètes
        content: {} // Contenu vide
      };
      
      expect(() => {
        EDNItemParser.parseItemV2(malformedItem as any, 'malformed');
      }).toThrow();
    });

    test('❌ Gère un item v1 avec données manquantes', () => {
      const incompleteItem = {
        // Données minimales manquantes
      };
      
      const result = EDNItemParser.parseAnyItem(incompleteItem, 'incomplete');
      
      expect(result.id).toBe('incomplete');
      expect(result.item_code).toBe('IC-?');
      expect(result.title).toBe('Titre non défini');
      expect(result.slug).toBe('item-undefined');
      expect(result.tableau_rang_a.lignes).toEqual([]);
      expect(result.tableau_rang_b.lignes).toEqual([]);
      expect(result.paroles_musicales).toEqual([]);
    });

    test('🔄 Router automatiquement vers le bon parser', () => {
      const resultV2 = EDNItemParser.parseAnyItem(validItemV2, 'auto-v2');
      const resultV1 = EDNItemParser.parseAnyItem(validItemV1, 'auto-v1');
      
      expect(resultV2.item_code).toBe('IC-001'); // v2
      expect(resultV1.item_code).toBe('IC-002'); // v1
    });

    test('🎵 Extrait les paroles même si certaines compétences n\'en ont pas', () => {
      const itemWithMissingLyrics = {
        ...validItemV2,
        content: {
          rang_a: {
            theme: 'Test',
            competences: [
              {
                ...validItemV2.content.rang_a.competences[0],
                paroles_chantables: []
              }
            ]
          },
          rang_b: {
            theme: 'Test B',
            competences: [
              {
                ...validItemV2.content.rang_b.competences[0],
                paroles_chantables: ['Seule parole restante']
              }
            ]
          }
        }
      };
      
      const result = EDNItemParser.parseItemV2(itemWithMissingLyrics, 'missing-lyrics');
      expect(result.paroles_musicales).toEqual(['Seule parole restante']);
    });
  });

  describe('📊 Tests de performance et limites', () => {
    
    test('⚡ Parse rapidement un gros item v2', () => {
      const bigItem = {
        ...validItemV2,
        content: {
          rang_a: {
            theme: 'Grand Rang A',
            competences: Array(100).fill(validItemV2.content.rang_a.competences[0])
          },
          rang_b: {
            theme: 'Grand Rang B',
            competences: Array(100).fill(validItemV2.content.rang_b.competences[0])
          }
        }
      };
      
      const start = performance.now();
      const result = EDNItemParser.parseItemV2(bigItem, 'big-item');
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Moins de 100ms
      expect(result.tableau_rang_a.lignes).toHaveLength(100);
      expect(result.tableau_rang_b.lignes).toHaveLength(100);
    });

    test('🎯 Limite le nombre de questions de quiz', () => {
      const itemManyCompetences = {
        ...validItemV2,
        content: {
          rang_a: {
            theme: 'Beaucoup de compétences',
            competences: Array(10).fill(validItemV2.content.rang_a.competences[0])
          },
          rang_b: {
            theme: 'Encore plus',
            competences: Array(10).fill(validItemV2.content.rang_b.competences[0])
          }
        }
      };
      
      const result = EDNItemParser.parseItemV2(itemManyCompetences, 'many-comp');
      expect(result.quiz_questions.questions).toHaveLength(5); // Limité à 5
    });
  });
});