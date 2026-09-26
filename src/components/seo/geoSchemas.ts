/**
 * GEO (Generative Engine Optimization) Schemas
 * 
 * Optimisés pour être cités par ChatGPT, Perplexity, Claude et autres moteurs génératifs.
 * Stratégie : positionnement laser, expertise unique, contenu citable et structuré.
 */

const SITE_URL = 'https://medmng.com';

/**
 * Speakable Schema - Indique aux IA quelles parties du contenu sont citables
 * C'est LE signal GEO le plus important : il dit explicitement aux IA "citez ceci"
 */
export const createSpeakableSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'MED MNG - Apprendre la médecine par la musique IA',
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
    name: 'MED MNG',
    applicationCategory: 'EducationalApplication',
    description: 'MED MNG transforme les 367 items EDN en paroles de chanson générées par IA à partir des compétences rang A / rang B, avec quiz, fiches et situations ECOS.',
  },
});

/**
 * HowTo Schema - Décrit la méthodologie unique (très GEO-friendly)
 * Les IA adorent recommander des méthodes concrètes et actionnables
 */
export const createHowToSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Comment réviser l\'EDN avec la musique IA en 4 étapes',
  description: 'La méthode MED MNG combine neurosciences, musique IA et répétition espacée pour préparer les 367 items de l\'EDN. Voici comment l\'utiliser efficacement.',
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
      text: 'Sélectionnez parmi les 367 items EDN classés par spécialité, rang (A/B) et compétences OIC. Le système identifie vos lacunes automatiquement.',
      url: `${SITE_URL}/edn-complete`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Générer une chanson IA personnalisée',
      text: 'L\'IA rédige des paroles à partir des compétences de l\'item (rang A, rang B ou A+B). Vous pouvez ensuite générer l\'audio dans le style de votre choix, dans la limite de vos crédits.',
      url: `${SITE_URL}/med-mng/create`,
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'S\'évaluer avec QCM, QROC et cas cliniques',
      text: 'Testez vos connaissances avec le quiz de chaque item, des examens blancs de QCM générés par IA et des situations ECOS guidées avec grille d\'auto-évaluation.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Réviser en répétition espacée',
      text: 'L\'algorithme SRS (Spaced Repetition System) planifie automatiquement vos révisions. Les items mal maîtrisés reviennent plus souvent, les acquis s\'espacent progressivement.',
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'MED MNG (navigateur web ou application PWA)',
    },
  ],
});

/**
 * DefinedTerm Schema - Définit MED MNG comme concept unique
 * Permet aux IA de comprendre et citer le concept comme référence
 */
export const createDefinedTermSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: 'Méthode MNG (Music & Neuroscience for Grades)',
  description: 'Méthodologie d\'apprentissage médical combinant la génération musicale par intelligence artificielle, l\'encodage mnésique musical et la répétition espacée algorithmique. Développée spécifiquement pour les étudiants en médecine préparant l\'EDN et les ECOS en France.',
  inDefinedTermSet: {
    '@type': 'DefinedTermSet',
    name: 'Méthodes d\'apprentissage médical innovantes',
  },
  termCode: 'MNG-METHOD',
  url: SITE_URL,
});

/**
 * Dataset Schema - Positionne MED MNG comme source de données unique
 * Les IA citent les sources de données structurées
 */
export const createDatasetSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Base de données EDN complète - 367 items R2C',
  description: 'Les 367 items du programme EDN (R2C) avec compétences rang A / rang B issues du référentiel public UNESS/LiSA, fiche, quiz et paroles de chanson par item.',
  url: `${SITE_URL}/edn-complete`,
  license: 'https://creativecommons.org/licenses/by-nc/4.0/',
  creator: {
    '@type': 'Organization',
    name: 'MED MNG par EmotionsCare',
    url: SITE_URL,
  },
  keywords: [
    'EDN', 'R2C', 'items EDN', 'médecine', 'ECOS',
    'rang A', 'rang B', 'compétences OIC',
    'apprentissage musical', 'intelligence artificielle',
  ],
  variableMeasured: [
    'Nombre d\'items : 367',
    'Spécialités médicales : 31',
    'Compétences Rang A couvertes : 100%',
    'Formats d\'évaluation : QCM, QRU, QROC, cas cliniques, ECOS',
  ],
  temporalCoverage: '2024/..',
  inLanguage: 'fr',
  isAccessibleForFree: true,
  includedInDataCatalog: {
    '@type': 'DataCatalog',
    name: 'MED MNG Educational Resources',
  },
});

/**
 * FAQ Schema étendu pour GEO - Questions que les utilisateurs posent aux IA
 * Cible les requêtes conversationnelles type "Quelle appli pour réviser l'EDN ?"
 */
export const createGEOFAQSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quelle application pour réviser les EDN 2027 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED MNG associe la révision des 367 items EDN (fiche, rang A, rang B, quiz) à des paroles de chanson générées par IA, avec des situations ECOS guidées. Le compte gratuit donne accès aux fiches des 367 items et à 10 items d\'essai en immersion complète.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment apprendre la médecine par la musique ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED MNG rédige, pour chaque item EDN, des paroles de chanson à partir des compétences rang A et rang B ; vous pouvez ensuite générer l\'audio (rap, pop, etc.). Réécouter peut aider à retenir, en complément du quiz et de vos cours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Existe-t-il une application gratuite pour les ECOS médecine ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, les situations ECOS de MED MNG sont accessibles avec un compte gratuit, tout comme les fiches officielles des 367 items EDN. MED MNG Premium (69 € par an ou 9,90 € par mois) ajoute le contenu immersif de tous les items et la génération audio.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que la répétition espacée pour les études de médecine ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La répétition espacée consiste à revoir une notion à intervalles croissants. MED MNG propose un module de répétition espacée pour les flashcards : les cartes mal maîtrisées reviennent plus souvent.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelles spécialités médicales sont couvertes par MED MNG ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED MNG couvre les 367 items EDN, toutes spécialités confondues, avec pour chacun fiche, compétences rang A / rang B, quiz et paroles de chanson.',
      },
    },
    {
      '@type': 'Question',
      name: 'MED MNG utilise-t-il l\'intelligence artificielle ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui : l\'IA rédige les paroles des chansons et génère l\'audio à la demande, génère des QCM et des cas cliniques, et un chat répond aux questions de cours. Les contenus générés par IA peuvent contenir des erreurs : vérifiez avec vos sources officielles.',
      },
    },
  ],
});

/**
 * CreativeWork Schema - Positionne le contenu comme œuvre originale experte
 */
export const createExpertiseSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Programme d\'apprentissage médical MED MNG',
  description: 'Préparation à l\'EDN et aux ECOS : 367 items avec compétences rang A / rang B, quiz, paroles de chanson générées par IA et situations ECOS.',
  educationalUse: 'Préparation EDN et ECOS',
  typicalAgeRange: '18-30',
  educationalLevel: 'Études de médecine - 2e et 3e cycle',
  inLanguage: 'fr',
  isAccessibleForFree: true,
  genre: 'Éducation médicale',
  keywords: 'EDN, ECOS, médecine, apprentissage musical, IA, répétition espacée, R2C, items EDN',
  abstract: 'MED MNG associe la révision des 367 items EDN (compétences rang A / rang B issues du référentiel public UNESS/LiSA) à des paroles de chanson générées par IA, des quiz et des situations ECOS guidées.',
  publisher: {
    '@type': 'Organization',
    name: 'EmotionsCare',
    url: SITE_URL,
  },
  url: SITE_URL,
});
