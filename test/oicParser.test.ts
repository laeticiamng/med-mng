import { parseOICContent } from '../supabase/functions/extract-edn-objectifs/oic-parser';

describe('parseOICContent', () => {
  it('parses a valid OIC page', () => {
    const page = {
      title: 'OIC-001-05-A-01',
      revisions: [
        { slots: { main: { content: "| Intitulé = Test Intitule | Description = Exemple de description" } } }
      ]
    };
    const result = parseOICContent(page);
    expect(result).toBeTruthy();
    expect(result!.objectif_id).toBe('OIC-001-05-A-01');
    expect(result!.intitule).toBe('Test Intitule');
    expect(result!.rubrique).toBe('Pharmacologie');
    expect(result!.ordre).toBe(1);
  });

  it('returns null when title does not match pattern', () => {
    const page = {
      title: 'Invalid-Title',
      revisions: [{ slots: { main: { content: '| something' } } }]
    };
    expect(parseOICContent(page)).toBeNull();
  });

  it('handles old revision format', () => {
    const page = {
      title: 'OIC-002-06-B-02',
      revisions: [
        { '*': "| Intitulé = Old Format" }
      ]
    } as any;
    const res = parseOICContent(page);
    expect(res).toBeTruthy();
    expect(res!.item_parent).toBe('002');
    expect(res!.rang).toBe('B');
    expect(res!.ordre).toBe(2);
  });

  it('returns null when content is missing', () => {
    const page = { title: 'OIC-001-05-A-01', revisions: [{}] };
    expect(parseOICContent(page)).toBeNull();
  });

  it('uses default description when none found', () => {
    const page = {
      title: 'OIC-003-01-A-03',
      revisions: [
        { slots: { main: { content: "| Intitulé = My Title" } } }
      ]
    };
    const res = parseOICContent(page)!;
    expect(res.description).toBe(`Description de l'objectif OIC-003-01-A-03`);
  });
});
