/**
 * JSON-LD Structured Data Schemas pour MED-MNG
 *
 * Schémas conformes Schema.org pour un meilleur référencement Google :
 * - SoftwareApplication : application web
 * - EducationalApplication : application éducative
 * - Organization : l'organisation MED-MNG
 * - FAQPage : questions fréquentes
 */

const SITE_URL = 'https://med-mng.lovable.app';

export const createSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MED-MNG',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Medical Education',
  operatingSystem: 'Web, iOS, Android (PWA)',
  offers: [
    {
      '@type': 'Offer',
      name: 'Standard',
      price: '19',
      priceCurrency: 'EUR',
      description: '30 chansons/mois, Items EDN A & B, Sauvegarde bibliothèque',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '29',
      priceCurrency: 'EUR',
      description: '300 chansons/mois, QCM entraînement, Support prioritaire',
    },
    {
      '@type': 'Offer',
      name: 'Premium',
      price: '39',
      priceCurrency: 'EUR',
      description: '3000 chansons/mois, QCM + BD pédagogiques, Support VIP',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '256',
    bestRating: '5',
  },
  url: SITE_URL,
  screenshot: `${SITE_URL}/og-image.png`,
  description: 'Plateforme d\'apprentissage médical innovante par la musique. 367 items EDN et simulations ECOS transformés en chansons.',
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
    'Cas cliniques',
    'Flashcards SRS',
    'Simulations ECOS',
  ],
  numberOfItems: 367,
  isAccessibleForFree: true,
  inLanguage: 'fr',
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
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Plateforme d\'apprentissage médical innovante par la musique IA. Transforme 367 items EDN et simulations ECOS en chansons.',
  foundingDate: '2024',
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

export const createFAQPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que MED-MNG ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED-MNG est une plateforme d\'apprentissage médical qui transforme les 367 items EDN et les simulations ECOS en chansons grâce à l\'intelligence artificielle. Écoutez, retenez, réussissez.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment fonctionne l\'apprentissage par la musique ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La méthode MNG combine la science cognitive (effet de production, encodage musical, répétition espacée) avec la génération musicale IA. Chaque item EDN est transformé en chanson mémorable, facilitant la rétention à long terme.',
      },
    },
    {
      '@type': 'Question',
      name: 'MED-MNG est-il gratuit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED-MNG propose un accès gratuit aux items EDN de base. Les formules Standard (19€/mois), Pro (29€/mois) et Premium (39€/mois) offrent des fonctionnalités avancées : génération musicale illimitée, QCM, cas cliniques et plus.',
      },
    },
    {
      '@type': 'Question',
      name: 'MED-MNG couvre-t-il tous les items EDN ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, MED-MNG couvre les 367 items du programme EDN (R2C) avec cours musicaux, QCM, flashcards SRS et cas cliniques interactifs pour chaque item.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je utiliser MED-MNG hors connexion ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, MED-MNG est une Progressive Web App (PWA). Installez-la sur votre appareil pour accéder à vos contenus même sans connexion internet. Les données se synchronisent automatiquement à la reconnexion.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les données sont-elles sécurisées et conformes RGPD ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MED-MNG est 100% conforme RGPD. Vos données sont chiffrées, hébergées en Europe via Supabase, avec export et suppression disponibles à tout moment dans vos paramètres.',
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
