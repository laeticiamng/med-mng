/**
 * JSON-LD Structured Data Schemas pour MED-MNG
 *
 * Schémas conformes Schema.org pour un meilleur référencement Google :
 * - SoftwareApplication : application web
 * - EducationalApplication : application éducative
 * - Organization : l'organisation MED-MNG
 * - FAQPage : questions fréquentes
 */

const SITE_URL = 'https://medmng.com';

/** Offre unique (source : src/config/offre.ts). */
const OFFRES_JSONLD = [
  {
    '@type': 'Offer',
    name: 'Gratuit',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    description: "Fiches officielles des 367 items EDN (compétences rang A et rang B, référentiel LiSA 2026) et contenu immersif complet (paroles, récit, planches, quiz) de 10 items d'essai.",
  },
  {
    '@type': 'Offer',
    name: 'MED MNG Premium — annuel',
    price: '69',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    description: 'Contenu immersif des 367 items EDN et 30 générations audio par mois. 69 € par an (environ 5,75 € par mois).',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '69',
      priceCurrency: 'EUR',
      billingDuration: 'P1Y',
    },
  },
  {
    '@type': 'Offer',
    name: 'MED MNG Premium — mensuel',
    price: '9.90',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    description: 'Contenu immersif des 367 items EDN et 30 générations audio par mois. 9,90 € par mois.',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '9.90',
      priceCurrency: 'EUR',
      billingDuration: 'P1M',
    },
  },
];

export const createSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['SoftwareApplication', 'EducationalApplication'],
  name: 'MED-MNG',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Medical Education',
  operatingSystem: 'Web, iOS, Android (PWA)',
  offers: OFFRES_JSONLD,
  url: SITE_URL,
  screenshot: `${SITE_URL}/og-image.png`,
  description: 'Plateforme de révision EDN : 367 items avec compétences rang A / rang B, et en immersion (paroles de chanson, récit, planches, quiz) avec MED MNG Premium ; situations ECOS.',
  inLanguage: 'fr',
});

export const createEducationalApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'MED-MNG - Apprentissage Médical Musical',
  url: SITE_URL,
  applicationCategory: 'EducationalApplication',
  genre: 'Medical Education',
  about: {
    '@type': 'Thing',
    name: 'Médecine',
    description: 'Formation médicale pour les étudiants préparant l\'EDN et les ECOS',
  },
  educationalLevel: 'Études de médecine (2e et 3e cycle)',
  learningResourceType: [
    'Chansons médicales IA',
    'QCM interactifs',
    'QRU (Question à Réponse Unique)',
    'QROC (Question à Réponse Ouverte Courte)',
    'Cas cliniques interactifs',
    'Flashcards SRS (Répétition Espacée)',
    'Simulations ECOS',
    'Mode examen EDN',
  ],
  numberOfItems: 367,
  isAccessibleForFree: true,
  inLanguage: 'fr',
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    audienceType: 'Étudiants en médecine',
  },
  provider: {
    '@type': 'Organization',
    name: 'MED-MNG',
    url: SITE_URL,
  },
});

export const createOrganizationSchemaFull = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MED-MNG',
  alternateName: 'MED MNG par EmotionsCare',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Plateforme de révision EDN : 367 items avec compétences rang A / rang B, et en immersion (paroles de chanson, récit, planches, quiz) avec MED MNG Premium ; situations ECOS.',
  foundingDate: '2024',
  founder: {
    '@type': 'Organization',
    name: 'EmotionsCare',
    url: SITE_URL,
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'EmotionsCare',
  },
  areaServed: {
    '@type': 'Country',
    name: 'France',
  },
  knowsAbout: [
    'Médecine',
    'EDN (Épreuves Dématérialisées Nationales)',
    'ECOS (Examens Cliniques Objectifs Structurés)',
    'Apprentissage musical',
    'Intelligence artificielle médicale',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'French',
  },
});

/**
 * JSON-LD Product schema pour la page pricing
 */
export const createProductSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'MED-MNG Premium',
  description: 'MED MNG Premium : contenu immersif des 367 items EDN (paroles, récit, planches, quiz) et génération audio. 69 € par an ou 9,90 € par mois.',
  brand: {
    '@type': 'Organization',
    name: 'MED-MNG par EmotionsCare',
  },
  category: 'Educational Software',
  offers: OFFRES_JSONLD,
});

export const createFAQPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // SEO classique
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que MED-MNG ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED-MNG est une plateforme de révision EDN. Pour chacun des 367 items, elle propose une fiche avec les compétences rang A et rang B du référentiel public UNESS/LiSA, ainsi qu\'un contenu immersif (paroles de chanson, récit, planches, quiz) que vous pouvez mettre en musique.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment fonctionne l\'apprentissage par la musique ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La méthode MNG associe des paroles de chanson écrites à partir des compétences de chaque item, la réécoute et le rappel actif (quiz). La musique peut aider à retenir un texte ; l\'effet reste modeste et ne remplace pas vos cours.',
      },
    },
    {
      '@type': 'Question',
      name: 'MED-MNG est-il gratuit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En partie. Les fiches officielles des 367 items (compétences rang A et rang B) et les situations ECOS sont gratuites, ainsi que le contenu immersif complet de 10 items d\'essai. MED MNG Premium (69 € par an ou 9,90 € par mois) ouvre le contenu immersif des 367 items et la génération audio (30 par mois).',
      },
    },
    {
      '@type': 'Question',
      name: 'MED-MNG couvre-t-il tous les items EDN ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, les 367 items EDN sont présents avec leurs compétences rang A et rang B. Le contenu immersif (paroles, récit, planches, quiz) est inclus dans MED MNG Premium, et offert pour 10 items d\'essai ; l\'audio des chansons se génère à la demande.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je utiliser MED-MNG hors connexion ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En partie : grâce à la PWA, les fiches déjà consultées restent lisibles hors connexion. L\'audio, les quiz et la génération nécessitent une connexion.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les données sont-elles sécurisées et conformes RGPD ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vos données sont hébergées en Europe (Supabase), jamais vendues, et vous pouvez les exporter ou les supprimer depuis vos paramètres.',
      },
    },
    // GEO - Questions conversationnelles IA
    {
      '@type': 'Question',
      name: 'Quelle application pour réviser les EDN 2027 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED-MNG associe la révision des 367 items EDN (fiche, rang A, rang B, quiz) à des paroles de chanson générées par IA à partir des compétences de chaque item, avec des situations ECOS guidées. À vous de juger si la méthode vous convient : le compte gratuit donne accès aux fiches des 367 items et à 10 items d\'essai en immersion complète.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment apprendre la médecine par la musique ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED-MNG rédige, pour chaque item EDN, des paroles de chanson à partir des compétences rang A et rang B, puis vous pouvez générer l\'audio. Réécouter une chanson peut aider à retenir, en complément du rappel actif (quiz) et de vos cours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Existe-t-il une application gratuite pour les ECOS médecine ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, les situations ECOS de MED-MNG sont accessibles avec un compte gratuit, tout comme les fiches officielles des 367 items EDN. MED MNG Premium (69 € par an ou 9,90 € par mois) ajoute le contenu immersif de tous les items et la génération audio.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que la répétition espacée pour les études de médecine ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La répétition espacée (SRS - Spaced Repetition System) est un algorithme qui optimise le moment de révision de chaque notion. MED-MNG intègre un SRS adaptatif qui combine flashcards, QCM et écoute musicale : les items mal maîtrisés reviennent plus fréquemment, les items acquis s\'espacent.',
      },
    },
    {
      '@type': 'Question',
      name: 'MED-MNG utilise-t-il l\'intelligence artificielle ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, MED-MNG utilise plusieurs couches d\'IA : (1) Génération musicale IA pour créer des chansons pédagogiques uniques, (2) IA générative pour produire des QCM, QROC et cas cliniques adaptés, (3) Algorithme SRS adaptatif qui personnalise le parcours de révision, (4) Chat IA médical pour répondre aux questions de cours.',
      },
    },
  ],
});

/**
 * JSON-LD pour une page d'item EDN spécifique
 */
export const createEDNItemSchema = (item: {
  code: string;
  title: string;
  specialty: string;
  description: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: `Item EDN ${item.code} - ${item.title}`,
  description: item.description,
  educationalLevel: 'Études de médecine',
  learningResourceType: 'Cours musical interactif',
  about: {
    '@type': 'MedicalSpecialty',
    name: item.specialty,
  },
  provider: {
    '@type': 'Organization',
    name: 'MED-MNG',
    url: SITE_URL,
  },
  inLanguage: 'fr',
  isAccessibleForFree: false,
  url: `${SITE_URL}/edn-complete/${item.code}`,
});

/**
 * JSON-LD pour un breadcrumb
 */
export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.url}`,
  })),
});
