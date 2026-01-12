import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableauCompetencesOICWithRealData } from '@/components/edn/tableau/TableauCompetencesOICWithRealData';

describe('TableauCompetencesOICWithRealData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charge et affiche une compétence OIC', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          objectif_id: 'OIC-001-01-A',
          intitule: 'Compétence A',
          description: 'Description A',
          rubrique: 'Rubrique A'
        }
      ])
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<TableauCompetencesOICWithRealData itemCode="IC-1" rang="A" />);

    expect(await screen.findByText('Compétence A')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('item_parent=in.'),
      expect.anything()
    );
  });
});
