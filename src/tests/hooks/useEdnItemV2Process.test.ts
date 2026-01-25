import { useEdnItemV2Process } from '@/hooks/useEdnItemV2Process';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useEdnItemV2Process', () => {
  // ===== NULL / UNDEFINED HANDLING =====
  describe('Null and undefined handling', () => {
    it('returns null when item is null', () => {
      const { result } = renderHook(() => useEdnItemV2Process(null));
      expect(result.current).toBeNull();
    });

    it('returns null when item is undefined', () => {
      const { result } = renderHook(() => useEdnItemV2Process(undefined));
      expect(result.current).toBeNull();
    });
  });

  // ===== LEGACY ITEM PASSTHROUGH =====
  describe('Legacy item passthrough', () => {
    it('returns original item when no payload_v2 exists', () => {
      const legacyItem = {
        id: 'legacy-1',
        item_code: 'IC-001',
        title: 'Legacy Item',
        tableau_rang_a: { theme: 'Theme A', sections: [] },
        tableau_rang_b: { theme: 'Theme B', sections: [] },
      };

      const { result } = renderHook(() => useEdnItemV2Process(legacyItem));
      expect(result.current).toEqual(legacyItem);
    });

    it('returns original item when payload_v2 is empty object', () => {
      const item = {
        id: 'item-1',
        payload_v2: {},
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));
      expect(result.current).toEqual(item);
    });

    it('returns original item when payload_v2.content is missing', () => {
      const item = {
        id: 'item-1',
        payload_v2: {
          item_metadata: { code: 'IC-001' },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));
      expect(result.current).toEqual(item);
    });

    it('returns original item when payload_v2.content.rang_a is missing', () => {
      const item = {
        id: 'item-1',
        payload_v2: {
          content: {
            rang_b: { theme: 'B', competences: [] },
          },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));
      expect(result.current).toEqual(item);
    });

    it('returns original item when payload_v2.content.rang_b is missing', () => {
      const item = {
        id: 'item-1',
        payload_v2: {
          content: {
            rang_a: { theme: 'A', competences: [] },
          },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));
      expect(result.current).toEqual(item);
    });
  });

  // ===== EMPTY COMPETENCES =====
  describe('Empty competences handling', () => {
    it('returns original item when both rang_a and rang_b have no competences', () => {
      const item = {
        id: 'item-1',
        payload_v2: {
          content: {
            rang_a: { theme: 'Theme A', competences: [] },
            rang_b: { theme: 'Theme B', competences: [] },
          },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));
      expect(result.current).toEqual(item);
    });
  });

  // ===== V2 TRANSFORMATION =====
  describe('V2 data transformation', () => {
    const createV2Item = (rangACompetences: any[] = [], rangBCompetences: any[] = []) => ({
      id: 'v2-item-1',
      item_code: 'IC-001',
      payload_v2: {
        item_metadata: {
          code: 'IC-001',
          title: 'Test Item',
          category: 'organisation_systeme',
          difficulty: 'AB',
          version: 'v2.0.0',
          slug: 'ic-001',
        },
        content: {
          rang_a: {
            theme: 'Theme Rang A',
            competences: rangACompetences,
          },
          rang_b: {
            theme: 'Theme Rang B',
            competences: rangBCompetences,
          },
        },
        generation_config: {
          music_enabled: true,
          bd_enabled: true,
          quiz_enabled: true,
          interactive_enabled: true,
        },
      },
    });

    const createCompetence = (id: string, paroles: string[] = []) => ({
      competence_id: id,
      concept: `Concept ${id}`,
      definition: `Definition ${id}`,
      exemple: `Exemple ${id}`,
      piege: `Piege ${id}`,
      mnemo: `Mnemo ${id}`,
      subtilite: `Subtilite ${id}`,
      application: `Application ${id}`,
      vigilance: `Vigilance ${id}`,
      paroles_chantables: paroles,
    });

    it('transforms V2 item with rang_a competences only', () => {
      const item = createV2Item([createCompetence('COMP_A1')], []);

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.tableau_rang_a).toBeDefined();
      expect(result.current.tableau_rang_a.theme).toBe('Theme Rang A');
      expect(result.current.tableau_rang_a.sections).toHaveLength(1);
      expect(result.current.tableau_rang_a.sections[0].concepts).toHaveLength(1);
    });

    it('transforms V2 item with rang_b competences only', () => {
      const item = createV2Item([], [createCompetence('COMP_B1')]);

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.tableau_rang_b).toBeDefined();
      expect(result.current.tableau_rang_b.theme).toBe('Theme Rang B');
      expect(result.current.tableau_rang_b.sections).toHaveLength(1);
      expect(result.current.tableau_rang_b.sections[0].concepts).toHaveLength(1);
    });

    it('transforms V2 item with both rang competences', () => {
      const item = createV2Item(
        [createCompetence('COMP_A1'), createCompetence('COMP_A2')],
        [createCompetence('COMP_B1')]
      );

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.tableau_rang_a.sections[0].concepts).toHaveLength(2);
      expect(result.current.tableau_rang_b.sections[0].concepts).toHaveLength(1);
    });

    it('preserves original item properties during transformation', () => {
      const item = {
        ...createV2Item([createCompetence('COMP_A1')], []),
        custom_field: 'custom_value',
        another_field: 123,
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.custom_field).toBe('custom_value');
      expect(result.current.another_field).toBe(123);
      expect(result.current.id).toBe('v2-item-1');
    });
  });

  // ===== PAROLES MUSICALES EXTRACTION =====
  describe('Paroles musicales extraction', () => {
    const createV2ItemWithParoles = (rangAParoles: string[][], rangBParoles: string[][]) => ({
      id: 'paroles-item',
      payload_v2: {
        content: {
          rang_a: {
            theme: 'A',
            competences: rangAParoles.map((paroles, i) => ({
              competence_id: `A${i}`,
              concept: 'C',
              definition: 'D',
              exemple: 'E',
              piege: 'P',
              mnemo: 'M',
              subtilite: 'S',
              application: 'A',
              vigilance: 'V',
              paroles_chantables: paroles,
            })),
          },
          rang_b: {
            theme: 'B',
            competences: rangBParoles.map((paroles, i) => ({
              competence_id: `B${i}`,
              concept: 'C',
              definition: 'D',
              exemple: 'E',
              piege: 'P',
              mnemo: 'M',
              subtilite: 'S',
              application: 'A',
              vigilance: 'V',
              paroles_chantables: paroles,
            })),
          },
        },
      },
    });

    it('extracts paroles_musicales from rang_a competences', () => {
      const item = createV2ItemWithParoles([['Parole A1', 'Parole A2']], []);

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.paroles_musicales).toEqual(['Parole A1', 'Parole A2']);
    });

    it('extracts paroles_musicales from rang_b competences', () => {
      const item = createV2ItemWithParoles([], [['Parole B1']]);

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.paroles_musicales).toEqual(['Parole B1']);
    });

    it('combines paroles_musicales from both rangs', () => {
      const item = createV2ItemWithParoles(
        [['Parole A1'], ['Parole A2']],
        [['Parole B1', 'Parole B2']]
      );

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.paroles_musicales).toEqual([
        'Parole A1',
        'Parole A2',
        'Parole B1',
        'Parole B2',
      ]);
    });

    it('handles empty paroles_chantables arrays', () => {
      const item = createV2ItemWithParoles([[], []], [[]]);

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.paroles_musicales).toEqual([]);
    });

    it('handles undefined paroles_chantables gracefully', () => {
      const item = {
        id: 'undefined-paroles',
        payload_v2: {
          content: {
            rang_a: {
              theme: 'A',
              competences: [
                {
                  competence_id: 'A1',
                  concept: 'C',
                  definition: 'D',
                  exemple: 'E',
                  piege: 'P',
                  mnemo: 'M',
                  subtilite: 'S',
                  application: 'A',
                  vigilance: 'V',
                  // paroles_chantables is undefined
                },
              ],
            },
            rang_b: {
              theme: 'B',
              competences: [],
            },
          },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));

      // Should not crash and should return empty array
      expect(result.current.paroles_musicales).toEqual([]);
    });

    it('filters out falsy values from paroles_musicales', () => {
      const item = {
        id: 'falsy-paroles',
        payload_v2: {
          content: {
            rang_a: {
              theme: 'A',
              competences: [
                {
                  competence_id: 'A1',
                  concept: 'C',
                  definition: 'D',
                  exemple: 'E',
                  piege: 'P',
                  mnemo: 'M',
                  subtilite: 'S',
                  application: 'A',
                  vigilance: 'V',
                  paroles_chantables: ['Valid', '', null, undefined, 'Also Valid'] as any,
                },
              ],
            },
            rang_b: {
              theme: 'B',
              competences: [],
            },
          },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.paroles_musicales).toEqual(['Valid', 'Also Valid']);
    });
  });

  // ===== MEMOIZATION =====
  describe('Memoization behavior', () => {
    it('returns same reference when item has not changed', () => {
      const item = {
        id: 'memo-test',
        item_code: 'IC-001',
      };

      const { result, rerender } = renderHook(
        ({ item }) => useEdnItemV2Process(item),
        { initialProps: { item } }
      );

      const firstResult = result.current;
      rerender({ item });
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('returns new reference when item changes', () => {
      const item1 = { id: 'item-1', item_code: 'IC-001' };
      const item2 = { id: 'item-2', item_code: 'IC-002' };

      const { result, rerender } = renderHook(
        ({ item }) => useEdnItemV2Process(item),
        { initialProps: { item: item1 } }
      );

      const firstResult = result.current;
      rerender({ item: item2 });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });
  });

  // ===== EDGE CASES =====
  describe('Edge cases', () => {
    it('handles item with existing tableau_rang_a when payload_v2 has no rang_a competences', () => {
      const item = {
        id: 'existing-tableau',
        tableau_rang_a: { theme: 'Existing', sections: [{ title: 'Section 1' }] },
        payload_v2: {
          content: {
            rang_a: { theme: 'V2 Theme', competences: [] },
            rang_b: { theme: 'V2 Theme B', competences: [{ 
              competence_id: 'B1',
              concept: 'C',
              definition: 'D',
              exemple: 'E',
              piege: 'P',
              mnemo: 'M',
              subtilite: 'S',
              application: 'A',
              vigilance: 'V',
              paroles_chantables: [],
            }] },
          },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));

      // Should preserve existing tableau_rang_a when V2 has no rang_a competences
      expect(result.current.tableau_rang_a).toEqual({ theme: 'Existing', sections: [{ title: 'Section 1' }] });
    });

    it('handles deeply nested null values', () => {
      const item = {
        id: 'deep-null',
        payload_v2: {
          content: {
            rang_a: {
              theme: null as any,
              competences: null as any,
            },
            rang_b: {
              theme: 'B',
              competences: [],
            },
          },
        },
      };

      // Should not throw
      expect(() => {
        renderHook(() => useEdnItemV2Process(item));
      }).not.toThrow();
    });

    it('handles very large competences arrays', () => {
      const manyCompetences = Array.from({ length: 100 }, (_, i) => ({
        competence_id: `COMP_${i}`,
        concept: `Concept ${i}`,
        definition: `Definition ${i}`,
        exemple: `Exemple ${i}`,
        piege: `Piege ${i}`,
        mnemo: `Mnemo ${i}`,
        subtilite: `Subtilite ${i}`,
        application: `Application ${i}`,
        vigilance: `Vigilance ${i}`,
        paroles_chantables: [`Parole ${i}`],
      }));

      const item = {
        id: 'large-item',
        payload_v2: {
          content: {
            rang_a: { theme: 'A', competences: manyCompetences },
            rang_b: { theme: 'B', competences: [] },
          },
        },
      };

      const { result } = renderHook(() => useEdnItemV2Process(item));

      expect(result.current.tableau_rang_a.sections[0].concepts).toHaveLength(100);
      expect(result.current.paroles_musicales).toHaveLength(100);
    });
  });
});
