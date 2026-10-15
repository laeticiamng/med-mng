import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// En-tête d'item EDN (EdnItemLayout.tsx) : texte --primary-foreground sur un dégradé
// --accent-text → --primary. Le contraste doit rester AA (4,5:1) aux deux extrémités,
// en thème clair comme en mode « Contraste élevé ».

const css = readFileSync(resolve(__dirname, '../index.css'), 'utf8');

function bloc(selecteur: string): string {
  const debut = css.indexOf(`${selecteur} {`);
  if (debut < 0) throw new Error(`bloc introuvable : ${selecteur}`);
  return css.slice(debut, css.indexOf('}', debut));
}

function jeton(source: string, nom: string): [number, number, number] {
  const m = source.match(new RegExp(`--${nom}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`jeton introuvable : --${nom}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function rvb([h, s, l]: [number, number, number]): number[] {
  const sat = s / 100;
  const lum = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lum, 1 - lum);
  return [0, 8, 4].map((n) => lum - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
}

function luminance(c: number[]): number {
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: [number, number, number], b: [number, number, number]): number {
  const [la, lb] = [luminance(rvb(a)), luminance(rvb(b))].sort((x, y) => y - x);
  return (la + 0.05) / (lb + 0.05);
}

describe("contraste de l'en-tête d'item", () => {
  it('thème clair : texte blanc sur le départ vert du dégradé ≥ 4,5:1', () => {
    const racine = bloc(':root');
    expect(contraste(jeton(racine, 'primary-foreground'), jeton(racine, 'accent-text'))).toBeGreaterThanOrEqual(4.5);
  });

  it('contraste élevé : texte sur les deux extrémités du dégradé ≥ 4,5:1', () => {
    const hc = bloc('html.high-contrast');
    const texte = jeton(hc, 'primary-foreground');
    expect(contraste(texte, jeton(hc, 'accent-text'))).toBeGreaterThanOrEqual(4.5);
    expect(contraste(texte, jeton(hc, 'primary'))).toBeGreaterThanOrEqual(4.5);
  });

  it('contraste élevé : texte accent sur le fond noir ≥ 4,5:1', () => {
    const hc = bloc('html.high-contrast');
    expect(contraste(jeton(hc, 'accent-text'), jeton(hc, 'background'))).toBeGreaterThanOrEqual(4.5);
  });
});
