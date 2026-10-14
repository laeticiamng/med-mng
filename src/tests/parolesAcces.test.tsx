import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useActivityTracking', () => ({ useActivityTracking: () => ({ logActivity: vi.fn() }) }));
vi.mock('@/components/layout/PremiumPageLayout', () => ({
  PremiumPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/seo/SEOHead', () => ({ SEOHead: () => null }));

import FAQ from '@/pages/FAQ';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { ACCES_PAROLES } from '@/config/offre';
import { createFAQPageSchema } from '@/components/seo/jsonLdSchemas';
import { createHowToSchema } from '@/components/seo/geoSchemas';

/**
 * Défaut D6 (QA du 14.10.2026) : la FAQ affirmait que les paroles « sont disponibles pour les
 * 367 items », alors qu'un compte gratuit voit les paroles verrouillées hors des 10 items
 * d'essai. Formulation unique, exacte, partout où l'accès aux paroles est décrit.
 */
const PHRASE =
  "Les paroles des 10 items d'essai sont gratuites ; celles des 367 items sont incluses dans Med MNG Premium.";

const lire = (p: string) => readFileSync(resolve(__dirname, '../..', p), 'utf8');

describe('accès aux paroles : un seul énoncé, exact (D6)', () => {
  it('la phrase de référence est exactement celle demandée', () => {
    expect(ACCES_PAROLES).toBe(PHRASE);
  });

  it('page FAQ rendue : réponse « Comment sont générées les chansons ? » et couverture des items', () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>
    );
    fireEvent.click(getByText('Comment sont générées les chansons ?'));
    fireEvent.click(getByText('Les 367 items EDN sont-ils tous couverts ?'));
    const texte = (container.textContent ?? '').replace(/\s+/g, ' ');
    expect(texte).toContain(PHRASE);
    expect(texte).not.toMatch(/paroles sont disponibles pour les 367 items/);
    expect(texte).not.toMatch(/paroles restent disponibles/);
  });

  it('FAQ des tarifs rendue : la réponse sur la musique IA donne la même phrase', () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <PricingFAQ />
      </MemoryRouter>
    );
    fireEvent.click(getByText('Comment fonctionne la musique IA pour réviser ?'));
    expect((container.textContent ?? '').replace(/\s+/g, ' ')).toContain(PHRASE);
  });

  it('données structurées (JSON-LD FAQ et HowTo) : même phrase, plus d’affirmation ambiguë', () => {
    const faq = JSON.stringify(createFAQPageSchema());
    const howTo = JSON.stringify(createHowToSchema());
    expect(faq).toContain(PHRASE);
    expect(howTo).toContain(PHRASE);
    expect(faq + howTo).not.toMatch(/paroles (sont|restent) disponibles/);
  });

  it('aucun texte du site ne dit que les paroles sont disponibles pour les 367 items sans réserve', () => {
    const fichiers = (dossier: string): string[] =>
      readdirSync(dossier).flatMap((nom) => {
        const chemin = join(dossier, nom);
        if (statSync(chemin).isDirectory()) return fichiers(chemin);
        return /\.(tsx?|json)$/.test(nom) && !/\.test\./.test(nom) ? [chemin] : [];
      });
    const fautifs = fichiers(resolve(__dirname, '..'))
      .filter((f) => /paroles (sont|restent) disponibles/i.test(readFileSync(f, 'utf8')));
    expect(fautifs).toEqual([]);
  });

  it('prix, quota et items d’essai inchangés', () => {
    const faqTarifs = lire('src/components/pricing/PricingFAQ.tsx');
    expect(faqTarifs).toContain('69 € par an');
    expect(faqTarifs).toContain('9,90 € par mois');
    const cgv = lire('src/pages/CGV.tsx');
    expect(cgv).toContain('Contenu immersif des 367 items EDN : paroles de chanson');
    expect(cgv).toContain('le contenu immersif complet de 10 items d\'essai');
  });
});
