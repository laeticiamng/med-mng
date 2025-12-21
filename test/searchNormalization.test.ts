import { normalizeSearchText } from '@/utils/searchNormalization';

describe('normalizeSearchText', () => {
  it('normalizes accents and case', () => {
    expect(normalizeSearchText('Cardiologie')).toBe('cardiologie');
    expect(normalizeSearchText('Élévation')).toBe('elevation');
    expect(normalizeSearchText('PNEUMO')).toBe('pneumo');
  });
});
