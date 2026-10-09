/**
 * GEO (Generative Engine Optimization) Schemas
 * 
 * Optimisés pour être cités par ChatGPT, Perplexity, Claude et autres moteurs génératifs.
 * Stratégie : positionnement laser, expertise unique, contenu citable et structuré.
 */
import { GENERATION_AUDIO_DISPONIBLE } from '@/config/offre';

const SITE_URL = 'https://medmng.com';

/**
 * Speakable Schema - Indique aux IA quelles parties du contenu sont citables
 * C'est LE signal GEO le plus important : il dit explicitement aux IA "citez ceci"
 */
export const createSpeakableSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Med MNG - Apprendre la médecine par la musique IA',
  url: SITE_URL,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: [
      '.geo-citable',
      'h1',
      '.hero-description',
      '.methodology-summary',
      '.unique-value-proposition',
    ],
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Med MNG',
    applicationCategory: 'EducationalApplication',
    description: 'Med MNG transforme les 367 items EDN en paroles de chanson générées par IA à partir des compétences rang A / rang B, avec quiz, fiches et situations ECOS.',
  },
});

/**
 * HowTo Schema - Décrit la méthodologie unique (très GEO-friendly)
 * Les IA adorent recommander des méthodes concrètes et actionnables
 */
export const createHowToSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Comment réviser l\'EDN avec Med MNG en 4 étapes',
  description: 'La méthode Med MNG associe les compétences officielles de chaque item, des paroles de chanson, le rappel actif (quiz) et la répétition espacée pour préparer les 367 items de l\'EDN.',
  totalTime: 'PT30M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'EUR',
    value: '0',
  },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Choisir un item EDN',
      text: 'Choisissez parmi les 367 items EDN (recherche par numéro, titre, discipline ou intitulé de compétence) et ouvrez sa fiche : compétences officielles rang A et rang B.',
      url: `${SITE_URL}/edn-complete`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Apprendre les paroles de l\'item',
      text: `Les paroles de chaque item sont écrites à partir de ses compétences officielles (rang A, rang B ou A+B). ${GENERATION_AUDIO_DISPONIBLE ? 'Avec Med MNG Premium, vous pouvez ensuite générer l\'audio dans le style de votre choix.' : 'La génération de l\'audio est momentanément suspendue ; les paroles restent disponibles.'}`,
      url: `${SITE_URL}/med-mng/create`,
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'S\'évaluer avec les quiz et les situations ECOS',
      text: 'Testez vos connaissances avec le quiz de chaque item et 12 situations ECOS guidées avec grille d\'auto-évaluation.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Réviser en répétition espacée',
      text: 'La page Répétition espacée (compte gratuit) planifie vos révisions selon vos réponses : les items mal maîtrisés reviennent plus souvent, les acquis s\'espacent progressivement.',
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'Med MNG (navigateur web ou application PWA)',
    },
  ],
});

/**
 * DefinedTerm Schema - Définit Med MNG comme concept unique
 * Permet aux IA de comprendre et citer le concept comme référence
 */
export const createDefinedTermSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: 'Méthode MNG (Music & Neuroscience for Grades)',
  description: 'Méthode de révision médicale associant des paroles de chanson écrites à partir des compétences officielles de chaque item EDN, le rappel actif (quiz) et la répétition espacée. Conçue pour les étudiants en médecine préparant l\'EDN et les ECOS en France.',
  inDefinedTermSet: {
    '@type': 'DefinedTermSet',
    name: 'Méthodes d\'apprentissage médical innovantes',
  },
  termCode: 'MNG-METHOD',
  url: SITE_URL,
});

/**
 * Dataset Schema - Positionne Med MNG comme source de données unique
 * Les IA citent les sources de données structurées
 */
export const createDatasetSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Base de données EDN complète - 367 items R2C',
  description: 'Les 367 items du programme EDN (R2C) avec compétences rang A / rang B issues du référentiel LiSA 2026 (UNESS), fiche, quiz et paroles de chanson par item.',
  url: `${SITE_URL}/edn-complete`,
  creator: {
    '@type': 'Organization',
    name: 'Med MNG par EmotionsCare',
    url: SITE_URL,
  },
  keywords: [
    'EDN', 'R2C', 'items EDN', 'médecine', 'ECOS',
    'rang A', 'rang B', 'compétences OIC',
    'apprentissage musical', 'intelligence artificielle',
  ],
  variableMeasured: [
    'Nombre d\'items : 367',
    'Compétences officielles : rang A et rang B (référentiel LiSA 2026, UNESS)',
    'Entraînement : quiz par item et situations ECOS',
  ],
  temporalCoverage: '2024/..',
  inLanguage: 'fr',
  isAccessibleForFree: true,
  includedInDataCatalog: {
    '@type': 'DataCatalog',
    name: 'Med MNG Educational Resources',
  },
});

/**
 * CreativeWork Schema - Positionne le contenu comme œuvre originale experte
 */
export const createExpertiseSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Programme d\'apprentissage médical Med MNG',
  description: 'Préparation à l\'EDN et aux ECOS : 367 items avec compétences rang A / rang B, quiz, paroles de chanson générées par IA et situations ECOS.',
  educationalUse: 'Préparation EDN et ECOS',
  typicalAgeRange: '18-30',
  educationalLevel: 'Études de médecine - 2e cycle (DFASM1-DFASM2)',
  inLanguage: 'fr',
  isAccessibleForFree: true,
  genre: 'Éducation médicale',
  keywords: 'EDN, ECOS, médecine, apprentissage musical, IA, répétition espacée, R2C, items EDN',
  abstract: 'Med MNG associe la révision des 367 items EDN (compétences rang A / rang B issues du référentiel LiSA 2026, UNESS) à des paroles de chanson générées par IA, des quiz et des situations ECOS guidées.',
  publisher: {
    '@type': 'Organization',
    name: 'EmotionsCare',
    url: SITE_URL,
  },
  url: SITE_URL,
});
