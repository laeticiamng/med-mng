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

export const createSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['SoftwareApplication', 'EducationalApplication'],
  name: 'MED-MNG',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Medical Education',
  operatingSystem: 'Web, iOS, Android (PWA)',
  offers: [
    {
      '@type': 'Offer',
      name: 'Gratuit',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: '367 items EDN (fiche, rang A, rang B, quiz, paroles de chanson), situations ECOS, 3 générations audio offertes',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Standard',
      price: '19',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Mêmes contenus que le plan gratuit + 30 générations audio de chansons par mois',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '29',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Mêmes contenus que le plan gratuit + 300 générations audio de chansons par mois',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Premium',
      price: '39',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Mêmes contenus que le plan gratuit + 3 000 générations audio de chansons par mois',
      priceValidUntil: '2027-12-31',
    },
  ],
  url: SITE_URL,
  screenshot: `${SITE_URL}/og-image.png`,
  description: 'Plateforme de révision EDN : 367 items avec compétences rang A / rang B, quiz, paroles de chanson générées par IA et situations ECOS.',
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
  description: 'Plateforme de révision EDN : 367 items avec compétences rang A / rang B, quiz, paroles de chanson générées par IA et situations ECOS.',
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
  description: 'Abonnements MED-MNG : Standard 19€, Pro 29€, Premium 39€ par mois, pour générer 30, 300 ou 3 000 chansons audio par mois.',
  brand: {
    '@type': 'Organization',
    name: 'MED-MNG par EmotionsCare',
  },
  category: 'Educational Software',
  offers: [
    {
      '@type': 'Offer',
      name: 'Gratuit',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: '367 items EDN (fiche, rang A, rang B, quiz, paroles de chanson), situations ECOS, 3 générations audio offertes',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Standard',
      price: '19',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Mêmes contenus que le plan gratuit + 30 générations audio de chansons par mois',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '29',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Mêmes contenus que le plan gratuit + 300 générations audio de chansons par mois',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Premium',
      price: '39',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Mêmes contenus que le plan gratuit + 3 000 générations audio de chansons par mois',
      priceValidUntil: '2027-12-31',
    },
  ],
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
        text: 'MED-MNG est une plateforme de révision EDN. Pour chacun des 367 items, elle propose une fiche, les compétences rang A et rang B du référentiel public UNESS/LiSA, un quiz et des paroles de chanson générées par IA, que vous pouvez mettre en musique.',
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
        text: 'Oui. Les 367 items EDN (fiche, rang A, rang B, quiz, paroles) et les situations ECOS sont accessibles gratuitement, avec 3 générations audio offertes. Les formules Standard (19€), Pro (29€) et Premium (39€) par mois augmentent le nombre de générations audio (30, 300 ou 3 000 par mois).',
      },
    },
    {
      '@type': 'Question',
      name: 'MED-MNG couvre-t-il tous les items EDN ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, les 367 items EDN sont présents avec leurs compétences rang A et rang B, un quiz et des paroles de chanson. L\'audio des chansons se génère à la demande.',
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
      name: 'Quelle est la meilleure application pour réviser l\'EDN en 2025-2026 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED-MNG associe la révision des 367 items EDN (fiche, rang A, rang B, quiz) à des paroles de chanson générées par IA à partir des compétences de chaque item, avec des situations ECOS guidées. À vous de juger si la méthode vous convient : le compte gratuit donne accès à tous les items.',
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
        text: 'Oui, les situations ECOS de MED-MNG sont accessibles avec un compte gratuit, tout comme les 367 items EDN. Les formules payantes (19€, 29€ ou 39€ par mois) augmentent uniquement le nombre de générations audio.',
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
