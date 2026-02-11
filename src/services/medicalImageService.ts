/**
 * Medical Image Service
 *
 * Handles medical images stored on Cloudflare R2.
 * Provides URL generation, caching, and fallback handling.
 */

const R2_BASE_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://medical-images.med-mng.app';

export interface MedicalImage {
  url: string;
  alt: string;
  caption?: string;
  source?: string;
  specialty: string;
  type: 'radiography' | 'ct_scan' | 'mri' | 'ecg' | 'dermatology' | 'histology' | 'fundoscopy' | 'other';
}

/**
 * Generate the full URL for a medical image stored on R2
 */
export function getMedicalImageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${R2_BASE_URL}/${path.replace(/^\//, '')}`;
}

/**
 * Get a placeholder image for cases without actual medical images
 */
export function getMedicalImagePlaceholder(specialty: string): string {
  const placeholders: Record<string, string> = {
    'Cardiologie': '/medical-images/placeholders/cardiology.svg',
    'Pneumologie': '/medical-images/placeholders/pulmonology.svg',
    'Neurologie': '/medical-images/placeholders/neurology.svg',
    'Dermatologie': '/medical-images/placeholders/dermatology.svg',
    'Radiologie': '/medical-images/placeholders/radiology.svg',
  };
  return placeholders[specialty] || '/medical-images/placeholders/generic.svg';
}

/**
 * Pre-defined medical image references for clinical cases
 * These map to Cloudflare R2 stored images
 */
export const MEDICAL_IMAGE_REFS: Record<string, MedicalImage> = {
  'ecg-stemi': {
    url: '/medical-images/cardiology/ecg-stemi.webp',
    alt: 'ECG montrant un sus-décalage du segment ST',
    caption: 'ECG 12 dérivations - Syndrome coronarien aigu ST+',
    specialty: 'Cardiologie',
    type: 'ecg',
  },
  'rx-pneumothorax': {
    url: '/medical-images/pneumology/rx-pneumothorax.webp',
    alt: 'Radiographie thoracique montrant un pneumothorax',
    caption: 'Radiographie thoracique de face - Pneumothorax complet droit',
    specialty: 'Pneumologie',
    type: 'radiography',
  },
  'tdm-avc': {
    url: '/medical-images/neurology/tdm-avc.webp',
    alt: 'TDM cérébrale montrant un AVC ischémique',
    caption: 'TDM cérébrale sans injection - Hypodensité sylvienne gauche',
    specialty: 'Neurologie',
    type: 'ct_scan',
  },
  'irm-hernie-discale': {
    url: '/medical-images/rheumatology/irm-hernie-discale.webp',
    alt: 'IRM lombaire montrant une hernie discale L4-L5',
    caption: 'IRM lombaire sagittale T2 - Hernie discale postéro-latérale L4-L5',
    specialty: 'Rhumatologie',
    type: 'mri',
  },
  'dermato-melanome': {
    url: '/medical-images/dermatology/melanome.webp',
    alt: 'Lésion pigmentée suspecte de mélanome',
    caption: 'Dermatoscopie - Critères ABCDE de mélanome',
    specialty: 'Dermatologie',
    type: 'dermatology',
  },
  'ecg-fa': {
    url: '/medical-images/cardiology/ecg-fa.webp',
    alt: 'ECG montrant une fibrillation auriculaire',
    caption: 'ECG 12 dérivations - Fibrillation auriculaire à réponse ventriculaire rapide',
    specialty: 'Cardiologie',
    type: 'ecg',
  },
  'rx-oap': {
    url: '/medical-images/cardiology/rx-oap.webp',
    alt: 'Radiographie thoracique montrant un OAP',
    caption: 'Radiographie thoracique - Opacités alvéolaires bilatérales en ailes de papillon',
    specialty: 'Cardiologie',
    type: 'radiography',
  },
  'tdm-embolie-pulmonaire': {
    url: '/medical-images/pneumology/tdm-ep.webp',
    alt: 'Angioscanner thoracique montrant une embolie pulmonaire',
    caption: 'Angioscanner thoracique - Thrombus dans l\'artère pulmonaire droite',
    specialty: 'Pneumologie',
    type: 'ct_scan',
  },
  'fond-oeil-retinopathie': {
    url: '/medical-images/ophthalmology/fond-oeil-rd.webp',
    alt: 'Fond d\'oeil montrant une rétinopathie diabétique',
    caption: 'Fond d\'oeil - Rétinopathie diabétique proliférante',
    specialty: 'Ophtalmologie',
    type: 'fundoscopy',
  },
  'histologie-glomerulonephrite': {
    url: '/medical-images/nephrology/histologie-gn.webp',
    alt: 'Biopsie rénale montrant une glomérulonéphrite',
    caption: 'Biopsie rénale PAS - Prolifération mésangiale',
    specialty: 'Néphrologie',
    type: 'histology',
  },
};

/**
 * Get medical image by reference ID
 */
export function getMedicalImage(refId: string): MedicalImage | null {
  return MEDICAL_IMAGE_REFS[refId] || null;
}

/**
 * Get all medical images for a given specialty
 */
export function getMedicalImagesBySpecialty(specialty: string): MedicalImage[] {
  return Object.values(MEDICAL_IMAGE_REFS).filter(img => img.specialty === specialty);
}
