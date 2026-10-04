import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatientCard } from '../PatientCard';

vi.mock('@/hooks/useActivityTracking', () => ({ useActivityTracking: () => ({ logActivity: vi.fn() }) }));
vi.mock('@/hooks/useGamification', () => ({
  useGamification: () => ({ stats: null, loadStats: vi.fn(), addPoints: vi.fn() }),
}));

const patient = {
  name: 'Patient(e)',
  age: null,
  sex: null,
  avatar: '🏥',
  background: 'Urgences, Cardiologie',
  dossierHtml:
    '<h2>Situation de départ</h2><p>Monsieur Martin, 58 ans, douleur thoracique.</p>' +
    '<h3>Antécédents</h3><ul><li>Tabagisme actif</li></ul>' +
    '<img src=x onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">lien</a>',
};

describe('PatientCard — dossier de la situation ECOS', () => {
  it('affiche la présentation, les antécédents et les thèmes', () => {
    render(<PatientCard patient={patient} />);
    expect(screen.getByLabelText('Dossier du patient')).toBeInTheDocument();
    expect(screen.getByText(/Monsieur Martin, 58 ans/)).toBeInTheDocument();
    expect(screen.getByText('Tabagisme actif')).toBeInTheDocument();
    expect(screen.getByText('Urgences, Cardiologie')).toBeInTheDocument();
  });

  it('retire scripts, images, liens et attributs du HTML de la base', () => {
    const { container } = render(<PatientCard patient={patient} />);
    const dossier = container.querySelector('[aria-label="Dossier du patient"]') as HTMLElement;
    expect(dossier.querySelector('script, img, a')).toBeNull();
    expect(dossier.innerHTML).not.toMatch(/onerror|javascript:/);
  });

  it("n'affiche pas de dossier vide", () => {
    render(<PatientCard patient={{ ...patient, dossierHtml: null }} />);
    expect(screen.queryByLabelText('Dossier du patient')).toBeNull();
  });
});
