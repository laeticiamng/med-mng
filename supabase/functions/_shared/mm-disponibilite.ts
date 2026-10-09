/**
 * Disponibilité de la génération audio Med MNG — SOURCE UNIQUE (serveur + site).
 *
 * 09.10.2026, décision CEO : suspension CIBLÉE des nouvelles générations audio tant que
 * les droits commerciaux du moteur (Suno via l'intermédiaire sunoapi.org) ne sont pas
 * établis par écrit (voir SOURCE_DE_VERITE, « Moteur musical »). Le moteur et son
 * intégration sont conservés : la reprise = passer GENERATION_AUDIO_DISPONIBLE à true,
 * redéployer mm-generate-music et republier le site.
 *
 * Restent disponibles : paroles, fiches, récits, planches, quiz, export des paroles et
 * écoute des chansons déjà créées.
 */
export const GENERATION_AUDIO_DISPONIBLE = false;

export const MESSAGE_GENERATION_SUSPENDUE =
  "La génération audio est momentanément suspendue, le temps de finaliser les licences du moteur musical. Les paroles, les fiches, les quiz et vos chansons déjà créées restent disponibles.";
