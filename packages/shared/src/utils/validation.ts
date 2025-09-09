// ============================================================================
// PACKAGES/SHARED - Utilitaires de validation (cross-apps)
// ============================================================================

import { ValidationError } from '@med-mng/types';

// ============================================================================
// VALIDATEURS DE BASE (réutilisables partout)
// ============================================================================

export class ValidationUtils {
  
  /**
   * Valide une adresse email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un mot de passe (critères médicaux renforcés)
   */
  static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Le mot de passe doit contenir au moins 12 caractères');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Vérifications spécifiques médical
    const commonMedicalWords = ['medecine', 'doctor', 'patient', 'hospital', 'medical'];
    const hasCommonWord = commonMedicalWords.some(word => 
      password.toLowerCase().includes(word)
    );
    
    if (hasCommonWord) {
      errors.push('Évitez d\'utiliser des mots médicaux communs dans votre mot de passe');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un numéro EDN (1-367)
   */
  static isValidEDNNumber(number: number): boolean {
    return Number.isInteger(number) && number >= 1 && number <= 367;
  }

  /**
   * Valide un UUID v4
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Valide une durée d'étude (en minutes)
   */
  static isValidStudyDuration(minutes: number): boolean {
    return Number.isInteger(minutes) && minutes >= 1 && minutes <= 8 * 60; // Max 8h
  }

  /**
   * Valide un score (0-100)
   */
  static isValidScore(score: number): boolean {
    return typeof score === 'number' && score >= 0 && score <= 100;
  }

  /**
   * Valide un nom d'utilisateur médical
   */
  static isValidMedicalUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
    }
    
    if (username.length > 30) {
      errors.push('Le nom d\'utilisateur ne peut pas dépasser 30 caractères');
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      errors.push('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores');
    }
    
    if (/^[._-]/.test(username) || /[._-]$/.test(username)) {
      errors.push('Le nom d\'utilisateur ne peut pas commencer ou finir par un caractère spécial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un numéro de téléphone français
   */
  static isValidFrenchPhone(phone: string): boolean {
    const frenchPhoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return frenchPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Valide une date de naissance (contexte médical)
   */
  static isValidBirthDate(dateString: string): { isValid: boolean; error?: string } {
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Format de date invalide' };
    }
    
    if (date > now) {
      return { isValid: false, error: 'La date de naissance ne peut pas être dans le futur' };
    }
    
    const age = now.getFullYear() - date.getFullYear();
    if (age < 16) {
      return { isValid: false, error: 'L\'âge minimum est de 16 ans' };
    }
    
    if (age > 100) {
      return { isValid: false, error: 'Veuillez vérifier la date de naissance' };
    }
    
    return { isValid: true };
  }
}

// ============================================================================
// SANITIZERS (nettoyage des données)
// ============================================================================

export class DataSanitizers {
  
  /**
   * Nettoie un texte médical (retire HTML, normalise)
   */
  static sanitizeMedicalText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Retire HTML
      .replace(/&[^;]+;/g, ' ') // Retire entités HTML
      .replace(/\s+/g, ' ') // Normalise espaces
      .trim()
      .substring(0, 5000); // Limite longueur
  }

  /**
   * Normalise un email
   */
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Normalise un nom d'utilisateur
   */
  static normalizeUsername(username: string): string {
    return username.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }

  /**
   * Nettoie un numéro de téléphone français
   */
  static normalizeFrenchPhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '').replace(/^0/, '+33');
  }

  /**
   * Nettoie et formate une durée
   */
  static normalizeDuration(minutes: number): number {
    return Math.max(1, Math.min(480, Math.round(minutes))); // Entre 1min et 8h
  }
}

// ============================================================================
// VALIDATEURS DE SCHÉMAS (pour formulaires complexes)
// ============================================================================

export class SchemaValidators {
  
  /**
   * Valide un profil utilisateur médical
   */
  static validateMedicalProfile(profile: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Email obligatoire et valide
    if (!profile.email) {
      errors.push({ field: 'email', message: 'L\'email est obligatoire', code: 'REQUIRED' });
    } else if (!ValidationUtils.isValidEmail(profile.email)) {
      errors.push({ field: 'email', message: 'Format d\'email invalide', code: 'INVALID_FORMAT' });
    }
    
    // Nom obligatoire
    if (!profile.name || profile.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Le nom doit contenir au moins 2 caractères', code: 'TOO_SHORT' });
    }
    
    // Rôle médical valide
    const validRoles = ['student', 'resident', 'doctor', 'admin'];
    if (!profile.role || !validRoles.includes(profile.role)) {
      errors.push({ field: 'role', message: 'Rôle médical invalide', code: 'INVALID_VALUE' });
    }
    
    // Spécialisation pour résidents/médecins
    if (['resident', 'doctor'].includes(profile.role) && !profile.specialization) {
      errors.push({ 
        field: 'specialization', 
        message: 'La spécialisation est obligatoire pour ce rôle', 
        code: 'REQUIRED' 
      });
    }
    
    // Année d'étude pour étudiants
    if (profile.role === 'student' && profile.academicYear) {
      if (!Number.isInteger(profile.academicYear) || profile.academicYear < 1 || profile.academicYear > 6) {
        errors.push({ 
          field: 'academicYear', 
          message: 'L\'année d\'étude doit être entre 1 et 6', 
          code: 'INVALID_RANGE' 
        });
      }
    }
    
    return errors;
  }
  
  /**
   * Valide une session d'étude
   */
  static validateStudySession(session: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!session.userId || !ValidationUtils.isValidUUID(session.userId)) {
      errors.push({ field: 'userId', message: 'ID utilisateur invalide', code: 'INVALID_UUID' });
    }
    
    if (!session.itemIds || !Array.isArray(session.itemIds) || session.itemIds.length === 0) {
      errors.push({ field: 'itemIds', message: 'Au moins un item EDN est requis', code: 'REQUIRED' });
    }
    
    if (session.itemIds?.some((id: string) => !ValidationUtils.isValidUUID(id))) {
      errors.push({ field: 'itemIds', message: 'IDs d\'items invalides', code: 'INVALID_UUID' });
    }
    
    if (session.duration && !ValidationUtils.isValidStudyDuration(session.duration)) {
      errors.push({ field: 'duration', message: 'Durée d\'étude invalide', code: 'INVALID_DURATION' });
    }
    
    return errors;
  }

  /**
   * Valide une génération musicale
   */
  static validateMusicGeneration(request: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!request.topic || request.topic.trim().length < 3) {
      errors.push({ field: 'topic', message: 'Le contexte d\'étude doit contenir au moins 3 caractères', code: 'TOO_SHORT' });
    }
    
    const validStyles = ['relaxing', 'focus', 'energetic', 'ambient', 'meditation'];
    if (!request.style || !validStyles.includes(request.style)) {
      errors.push({ field: 'style', message: 'Style musical invalide', code: 'INVALID_VALUE' });
    }
    
    if (!request.duration || request.duration < 30 || request.duration > 1800) {
      errors.push({ field: 'duration', message: 'La durée doit être entre 30 secondes et 30 minutes', code: 'INVALID_RANGE' });
    }
    
    if (request.tempo && (request.tempo < 40 || request.tempo > 200)) {
      errors.push({ field: 'tempo', message: 'Le tempo doit être entre 40 et 200 BPM', code: 'INVALID_RANGE' });
    }
    
    return errors;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ValidationUtils, DataSanitizers, SchemaValidators };

export type { ValidationError } from '@med-mng/types';