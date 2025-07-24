import EDNItemParser from '../src/parsers/ednItemParser';
import { createEmptyItemEDN } from '../src/schemas/itemEDNSchema';

describe('EDNItemParser', () => {
  const baseItem = createEmptyItemEDN('IC-001', 'Test Item', 'organisation_systeme');
  baseItem.content.rang_a.competences.push({
    competence_id: 'COMP_A',
    concept: 'Concept A',
    definition: 'Definition A',
    exemple: 'Example A',
    piege: 'Piege A',
    mnemo: 'Mnemo A',
    subtilite: 'Subtilite A',
    application: 'Application A',
    vigilance: 'Vigilance A',
    paroles_chantables: ['Parole A']
  });
  baseItem.content.rang_b.competences.push({
    competence_id: 'COMP_B',
    concept: 'Concept B',
    definition: 'Definition B',
    exemple: 'Example B',
    piege: 'Piege B',
    mnemo: 'Mnemo B',
    subtilite: 'Subtilite B',
    application: 'Application B',
    vigilance: 'Vigilance B',
    paroles_chantables: []
  });

  it('parses a v2 item correctly', () => {
    const parsed = EDNItemParser.parseItemV2(baseItem, '123');
    expect(parsed.id).toBe('123');
    expect(parsed.item_code).toBe('IC-001');
    expect(parsed.tableau_rang_a.lignes.length).toBe(1);
    expect(parsed.tableau_rang_b.lignes.length).toBe(1);
    expect(parsed.paroles_musicales.length).toBe(1);
    expect(parsed.scene_immersive.type).toBe('medical_scenario');
    expect(parsed.quiz_questions.questions.length).toBeGreaterThan(0);
  });

  it('parseAnyItem falls back to legacy parser', () => {
    const legacy = {
      item_code: 'IC-002',
      title: 'Legacy',
      slug: 'legacy-item',
      tableau_rang_a: { theme: 'A', lignes: [], colonnes: [] },
      tableau_rang_b: { theme: 'B', lignes: [], colonnes: [] },
      paroles_musicales: []
    };
    const parsed = EDNItemParser.parseAnyItem(legacy, 'legacy');
    expect(parsed.id).toBe('legacy');
    expect(parsed.item_code).toBe('IC-002');
    expect(parsed.tableau_rang_a.theme).toBe('A');
  });
});
