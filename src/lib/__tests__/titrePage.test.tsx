import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SEOHead } from '@/components/seo/SEOHead';
import { TITRE_ACCUEIL, titrePage } from '../titrePage';

describe('titrePage', () => {
  it('formate « <Page> · Med MNG »', () => {
    expect(titrePage('Tarifs')).toBe('Tarifs · Med MNG');
    expect(titrePage('Flashcards | Med MNG')).toBe('Flashcards · Med MNG');
    expect(titrePage('Mes Favoris - Med MNG')).toBe('Mes Favoris · Med MNG');
    expect(titrePage('IC-1 · Musique')).toBe('IC-1 · Musique · Med MNG');
  });
  it('donne le titre d’accueil pour « Med MNG » ou vide, sans « par EmotionsCare »', () => {
    expect(titrePage('Med MNG')).toBe(TITRE_ACCUEIL);
    expect(titrePage('')).toBe(TITRE_ACCUEIL);
    expect(titrePage(TITRE_ACCUEIL)).toBe(TITRE_ACCUEIL);
    expect(titrePage('Med MNG par EmotionsCare')).toBe(TITRE_ACCUEIL);
  });
  it('SEOHead met à jour le titre du document', async () => {
    render(
      <HelmetProvider>
        <SEOHead title="Tarifs" description="d" />
      </HelmetProvider>
    );
    await waitFor(() => expect(document.title).toBe('Tarifs · Med MNG'));
  });
});
