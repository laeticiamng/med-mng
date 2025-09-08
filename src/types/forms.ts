/**
 * 🎯 TYPES FORMULAIRES - MED-MNG v3.0
 * Types pour la gestion des formulaires et validation
 */

import type { JSONValue } from './core';

// ==========================================
// TYPES FORMULAIRES
// ==========================================

export interface FormField<T = JSONValue> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  value: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: T }>;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: string | number;
  message: string;
  validator?: (value: JSONValue) => boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  errors: Record<string, string[]>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}