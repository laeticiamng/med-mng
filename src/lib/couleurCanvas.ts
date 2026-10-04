/**
 * Couleurs du thème pour le <canvas>.
 *
 * Un contexte 2D ne comprend pas les variables CSS : `addColorStop(0,
 * 'hsl(var(--primary) / 0.1)')` lève une SyntaxError (et `fillStyle` ignore la
 * valeur en silence). En production, cette exception remontait jusqu'à la
 * limite d'erreur globale : un clic sur « Générer la chanson » affichait
 * « Oops ! Une erreur est survenue » alors que la génération partait.
 *
 * `couleurCanvas('primary', 0.3)` lit la variable (`217 91% 60%`) sur
 * l'élément racine et renvoie une couleur que le canvas accepte
 * (`hsla(217, 91%, 60%, 0.3)`). Valeur absente ou illisible → gris neutre.
 */
const REPLI = { h: '215', s: '16%', l: '47%' };

export const convertirTripletHsl = (
  triplet: string | null | undefined,
  alpha = 1,
): string => {
  const morceaux = (triplet || '').trim().replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  const valide =
    morceaux.length >= 3 &&
    /^-?\d+(\.\d+)?(deg)?$/.test(morceaux[0]) &&
    /^\d+(\.\d+)?%$/.test(morceaux[1]) &&
    /^\d+(\.\d+)?%$/.test(morceaux[2]);
  const { h, s, l } = valide
    ? { h: morceaux[0].replace('deg', ''), s: morceaux[1], l: morceaux[2] }
    : REPLI;
  const a = Number.isFinite(alpha) ? Math.min(1, Math.max(0, alpha)) : 1;
  return `hsla(${h}, ${s}, ${l}, ${a})`;
};

export const couleurCanvas = (nomVariable: string, alpha = 1): string => {
  let triplet: string | null = null;
  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const nom = nomVariable.startsWith('--') ? nomVariable : `--${nomVariable}`;
      triplet = getComputedStyle(document.documentElement).getPropertyValue(nom);
    }
  } catch {
    triplet = null;
  }
  return convertirTripletHsl(triplet, alpha);
};
