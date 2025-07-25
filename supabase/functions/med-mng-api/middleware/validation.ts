import { errorResponse } from '../response.ts';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'uuid';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class Validator {
  static validateBody(body: any, rules: ValidationRule[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const value = body[rule.field];

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) continue;

      // Type validation
      if (rule.type) {
        if (!this.validateType(value, rule.type)) {
          errors.push({ field: rule.field, message: `${rule.field} must be of type ${rule.type}` });
          continue;
        }
      }

      // Length validation
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.minLength} characters` });
      }

      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.maxLength} characters` });
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push({ field: rule.field, message: `${rule.field} format is invalid` });
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push({ field: rule.field, message: `${rule.field} validation failed` });
      }
    }

    return errors;
  }

  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'uuid':
        return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
      default:
        return true;
    }
  }

  static validate(body: any, rules: ValidationRule[]): Response | null {
    const errors = this.validateBody(body, rules);
    if (errors.length > 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid request data', { errors });
    }
    return null;
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validatePagination(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  return { page, limit };
}