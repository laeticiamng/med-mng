import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MusicGenerationWaveform } from '@/components/edn/music/MusicGenerationWaveform';
import { convertirTripletHsl, couleurCanvas } from './couleurCanvas';

describe('convertirTripletHsl', () => {
  it('convertit un triplet de variable CSS en couleur lisible par le canvas', () => {
    expect(convertirTripletHsl('217 91% 60%')).toBe('hsla(217, 91%, 60%, 1)');
    expect(convertirTripletHsl(' 217 91% 60% ', 0.3)).toBe('hsla(217, 91%, 60%, 0.3)');
    expect(convertirTripletHsl('142.1 76.2% 36.3%', 0.5)).toBe('hsla(142.1, 76.2%, 36.3%, 0.5)');
  });

  it('renvoie un gris neutre si la variable est absente ou illisible', () => {
    expect(convertirTripletHsl('', 0.2)).toBe('hsla(215, 16%, 47%, 0.2)');
    expect(convertirTripletHsl(null)).toBe('hsla(215, 16%, 47%, 1)');
    expect(convertirTripletHsl('var(--primary)')).toBe('hsla(215, 16%, 47%, 1)');
  });

  it('borne l’opacité entre 0 et 1', () => {
    expect(convertirTripletHsl('0 0% 0%', 4)).toBe('hsla(0, 0%, 0%, 1)');
    expect(convertirTripletHsl('0 0% 0%', -1)).toBe('hsla(0, 0%, 0%, 0)');
  });
});

describe('couleurCanvas', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--primary');
  });

  it('lit la variable sur la racine du document', () => {
    document.documentElement.style.setProperty('--primary', '217 91% 60%');
    expect(couleurCanvas('primary', 0.1)).toBe('hsla(217, 91%, 60%, 0.1)');
    expect(couleurCanvas('--primary')).toBe('hsla(217, 91%, 60%, 1)');
  });
});

describe('MusicGenerationWaveform (régression : clic « Générer la chanson »)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('ne passe jamais de variable CSS au canvas (addColorStop lèverait une SyntaxError)', () => {
    const couleurs: string[] = [];
    const contexte = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
      createLinearGradient: vi.fn(() => ({
        addColorStop: (_pos: number, couleur: string) => {
          // Comportement du navigateur : une couleur CSS non résolue est refusée.
          if (couleur.includes('var(')) throw new SyntaxError(`couleur illisible : ${couleur}`);
          couleurs.push(couleur);
        },
      })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => contexte as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);

    expect(() => render(<MusicGenerationWaveform isGenerating progress={40} />)).not.toThrow();
    expect(couleurs.length).toBeGreaterThan(0);
    expect(couleurs.every((c) => c.startsWith('hsla('))).toBe(true);
  });
});
