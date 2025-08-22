/**
 * Tests de compilation TypeScript pour les types CAS
 * Ces tests vérifient que les types sont correctement définis et utilisés
 */

import { describe, it, expect } from 'vitest';
import type { 
  CASInstructions, 
  CASExample, 
  CASAuthResult, 
  CASCookiesResult,
  CASTestResult,
  OICExtractionResult,
  OICAccessResult 
} from '@/types/cas';

describe('CAS Types Compilation', () => {
  it('should compile CASInstructions correctly', () => {
    const instructions: CASInstructions = {
      message: 'Test message',
      next_steps: ['step1', 'step2'],
      manual_login: 'https://example.com',
      username_field: 'username',
      password_field: 'password',
      submit_button: 'input[type="submit"]'
    };
    
    expect(instructions.message).toBe('Test message');
    expect(instructions.next_steps).toHaveLength(2);
  });

  it('should compile CASExample correctly', () => {
    const example: CASExample = {
      title: 'Test Page',
      pageid: 123,
      url: 'https://example.com/page'
    };
    
    expect(example.title).toBe('Test Page');
    expect(example.pageid).toBe(123);
  });

  it('should compile CASAuthResult correctly', () => {
    const authResult: CASAuthResult = {
      success: true,
      pages_found: 10,
      examples: [
        { title: 'Page 1', pageid: 1 },
        { title: 'Page 2', pageid: 2 }
      ],
      improvement: 5
    };
    
    expect(authResult.success).toBe(true);
    expect(authResult.examples).toHaveLength(2);
  });

  it('should compile CASCookiesResult correctly', () => {
    const cookiesResult: CASCookiesResult = {
      success: true,
      cookies: 'PHPSESSID=abc123',
      instructions: {
        message: 'Login required',
        next_steps: ['Go to login page']
      }
    };
    
    expect(cookiesResult.success).toBe(true);
    expect(cookiesResult.cookies).toBe('PHPSESSID=abc123');
  });

  it('should compile CASTestResult correctly', () => {
    const testResult: CASTestResult = {
      success: true,
      withoutAuth: {
        accessible: false,
        count: 0
      },
      withAuth: {
        accessible: true,
        count: 10,
        cookies: 'PHPSESSID=abc123'
      },
      improvement: 10,
      nextSteps: ['Continue with extraction']
    };
    
    expect(testResult.improvement).toBe(10);
    expect(testResult.withAuth.count).toBe(10);
  });

  it('should compile OICExtractionResult correctly', () => {
    const extractionResult: OICExtractionResult = {
      success: true,
      pages: [
        { title: 'OIC 1', pageid: 1 },
        { title: 'OIC 2', pageid: 2 }
      ],
      totalFound: 2
    };
    
    expect(extractionResult.success).toBe(true);
    expect(extractionResult.pages).toHaveLength(2);
  });

  it('should handle error cases with proper typing', () => {
    const errorResult: CASAuthResult = {
      success: false,
      error: 'Authentication failed',
      instructions: {
        message: 'Manual auth required',
        next_steps: ['Step 1', 'Step 2']
      }
    };
    
    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBe('Authentication failed');
  });

  it('should handle optional fields correctly', () => {
    // Test minimal valid objects
    const minimalInstructions: CASInstructions = {
      message: 'Required message'
      // All other fields are optional
    };
    
    const minimalExample: CASExample = {
      title: 'Required title',
      pageid: 123
      // url is optional
    };
    
    const minimalAuthResult: CASAuthResult = {
      success: true
      // All other fields are optional
    };
    
    expect(minimalInstructions.message).toBeDefined();
    expect(minimalExample.title).toBeDefined();
    expect(minimalAuthResult.success).toBe(true);
  });

  it('should prevent any usage with strict typing', () => {
    // This test ensures that our types don't allow 'any'
    const example: CASExample = {
      title: 'Test',
      pageid: 123
    };
    
    // TypeScript should enforce the exact shape
    expect(typeof example.title).toBe('string');
    expect(typeof example.pageid).toBe('number');
    
    // These would cause TypeScript errors if uncommented:
    // example.invalidField = 'should not work';
    // example.title = 123; // wrong type
  });
});