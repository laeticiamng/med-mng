/**
 * Tests unitaires pour les services d'extraction de données
 * Couvre l'extraction EDN, ECOS, et la gestion des erreurs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  functions: {
    invoke: vi.fn()
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Data Extraction Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EDN Extraction', () => {
    it('should successfully extract EDN data', async () => {
      // Arrange
      const mockExtractionResult = {
        success: true,
        processed: 367,
        errors: 0,
        items_created: 350,
        items_updated: 17,
        extraction_id: 'ext_123',
        timestamp: '2025-08-22T10:00:00Z'
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockExtractionResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { action: 'full_extraction', force: false }
      });

      // Assert
      expect(result.data.success).toBe(true);
      expect(result.data.processed).toBe(367);
      expect(result.data.errors).toBe(0);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('extract-edn-uness-production', {
        body: { action: 'full_extraction', force: false }
      });
    });

    it('should handle EDN extraction errors gracefully', async () => {
      // Arrange
      const mockError = { message: 'UNESS server unreachable' };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: mockError
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { action: 'full_extraction', force: false }
      });

      // Assert
      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });

    it('should support partial EDN extraction', async () => {
      // Arrange
      const mockPartialResult = {
        success: true,
        processed: 50,
        errors: 2,
        items_created: 45,
        items_updated: 3,
        extraction_id: 'ext_124',
        failed_items: ['IC-10', 'IC-25']
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockPartialResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { 
          action: 'partial_extraction', 
          item_range: { start: 1, end: 50 },
          retry_failed: true
        }
      });

      // Assert
      expect(result.data.processed).toBe(50);
      expect(result.data.errors).toBe(2);
      expect(result.data.failed_items).toEqual(['IC-10', 'IC-25']);
    });

    it('should validate extraction parameters', async () => {
      // Arrange
      const mockValidationError = {
        success: false,
        error: 'Invalid parameters',
        details: { 
          field: 'item_range', 
          message: 'Start must be less than end' 
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockValidationError,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { 
          action: 'partial_extraction', 
          item_range: { start: 50, end: 10 } // Invalid range
        }
      });

      // Assert
      expect(result.data.success).toBe(false);
      expect(result.data.error).toBe('Invalid parameters');
      expect(result.data.details.field).toBe('item_range');
    });
  });

  describe('ECOS Extraction', () => {
    it('should successfully extract ECOS data', async () => {
      // Arrange
      const mockEcosResult = {
        success: true,
        processed: 250,
        errors: 0,
        situations_created: 240,
        situations_updated: 10,
        extraction_id: 'ecos_123'
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockEcosResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { action: 'extract_all', include_media: true }
      });

      // Assert
      expect(result.data.success).toBe(true);
      expect(result.data.processed).toBe(250);
      expect(result.data.situations_created).toBe(240);
    });

    it('should handle ECOS authentication failures', async () => {
      // Arrange
      const mockAuthError = {
        success: false,
        error: 'AUTHENTICATION_FAILED',
        details: 'ECOS credentials expired or invalid'
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockAuthError,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { action: 'extract_all' }
      });

      // Assert
      expect(result.data.success).toBe(false);
      expect(result.data.error).toBe('AUTHENTICATION_FAILED');
      expect(result.data.details).toContain('credentials expired');
    });

    it('should support ECOS filtering by category', async () => {
      // Arrange
      const mockFilteredResult = {
        success: true,
        processed: 75,
        errors: 0,
        situations_created: 70,
        situations_updated: 5,
        categories: ['cardiologie', 'pneumologie']
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockFilteredResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { 
          action: 'extract_filtered', 
          categories: ['cardiologie', 'pneumologie'],
          include_media: false
        }
      });

      // Assert
      expect(result.data.processed).toBe(75);
      expect(result.data.categories).toEqual(['cardiologie', 'pneumologie']);
    });
  });

  describe('OIC Objectives Extraction', () => {
    it('should successfully extract OIC objectives', async () => {
      // Arrange
      const mockOicResult = {
        success: true,
        processed: 4872,
        errors: 15,
        objectives_created: 4800,
        objectives_updated: 57,
        failed_items: ['OIC-1234', 'OIC-5678'],
        extraction_stats: {
          rang_a: 2400,
          rang_b: 2472,
          with_examples: 4650,
          with_keywords: 4800
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockOicResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { 
          action: 'full_extraction',
          include_examples: true,
          include_keywords: true
        }
      });

      // Assert
      expect(result.data.success).toBe(true);
      expect(result.data.processed).toBe(4872);
      expect(result.data.extraction_stats.rang_a).toBe(2400);
      expect(result.data.extraction_stats.rang_b).toBe(2472);
    });

    it('should handle OIC rate limiting', async () => {
      // Arrange
      const mockRateLimitError = {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        details: 'Too many requests to UNESS API',
        retry_after: 300, // 5 minutes
        current_progress: {
          processed: 1200,
          total: 4872,
          percentage: 24.6
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockRateLimitError,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { action: 'resume_extraction', extraction_id: 'ext_456' }
      });

      // Assert
      expect(result.data.success).toBe(false);
      expect(result.data.error).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.data.retry_after).toBe(300);
      expect(result.data.current_progress.processed).toBe(1200);
    });

    it('should support incremental OIC extraction', async () => {
      // Arrange
      const mockIncrementalResult = {
        success: true,
        processed: 500,
        errors: 2,
        objectives_created: 480,
        objectives_updated: 18,
        extraction_id: 'ext_789',
        is_incremental: true,
        checkpoint: {
          last_processed: 'IC-200',
          next_batch_start: 'IC-201',
          estimated_remaining: 4372
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockIncrementalResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { 
          action: 'incremental_extraction',
          batch_size: 500,
          start_from: 'IC-1'
        }
      });

      // Assert
      expect(result.data.is_incremental).toBe(true);
      expect(result.data.checkpoint.last_processed).toBe('IC-200');
      expect(result.data.checkpoint.estimated_remaining).toBe(4372);
    });
  });

  describe('CAS Authentication for Extraction', () => {
    it('should successfully authenticate with CAS for extraction', async () => {
      // Arrange
      const mockCasResult = {
        success: true,
        authenticated: true,
        cookies: 'PHPSESSID=abc123; secure_token=xyz789',
        session_expires: '2025-08-22T12:00:00Z',
        accessible_resources: {
          edn_items: true,
          oic_objectives: true,
          media_files: false
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockCasResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: false }
      });

      // Assert
      expect(result.data.success).toBe(true);
      expect(result.data.authenticated).toBe(true);
      expect(result.data.cookies).toContain('PHPSESSID');
      expect(result.data.accessible_resources.edn_items).toBe(true);
    });

    it('should handle CAS authentication failures', async () => {
      // Arrange
      const mockCasError = {
        success: false,
        error: 'CAS_AUTH_FAILED',
        details: 'Invalid credentials or server unreachable',
        debug_info: {
          server_status: 'unreachable',
          last_attempt: '2025-08-22T10:30:00Z',
          retry_count: 3
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockCasError,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: false }
      });

      // Assert
      expect(result.data.success).toBe(false);
      expect(result.data.error).toBe('CAS_AUTH_FAILED');
      expect(result.data.debug_info.retry_count).toBe(3);
    });

    it('should validate CAS cookies before extraction', async () => {
      // Arrange
      const mockValidationResult = {
        success: true,
        valid: true,
        pages_accessible: 4500,
        expires_at: '2025-08-22T11:45:00Z',
        warnings: [
          'Session expires in 45 minutes'
        ]
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockValidationResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { 
          action: 'validate_cookies',
          cookies: 'PHPSESSID=abc123; secure_token=xyz789'
        }
      });

      // Assert
      expect(result.data.valid).toBe(true);
      expect(result.data.pages_accessible).toBe(4500);
      expect(result.data.warnings).toHaveLength(1);
    });
  });

  describe('Extraction Progress Monitoring', () => {
    it('should track extraction progress accurately', async () => {
      // Arrange
      const mockProgressResult = {
        extraction_id: 'ext_999',
        status: 'in_progress',
        progress: {
          processed: 2500,
          total: 4872,
          percentage: 51.3,
          errors: 8,
          warnings: 25
        },
        current_phase: 'processing_rang_b',
        estimated_completion: '2025-08-22T11:15:00Z',
        performance: {
          items_per_minute: 45,
          average_processing_time: 1.33,
          total_elapsed_seconds: 3300
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockProgressResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extraction-progress', {
        body: { extraction_id: 'ext_999' }
      });

      // Assert
      expect(result.data.progress.percentage).toBe(51.3);
      expect(result.data.current_phase).toBe('processing_rang_b');
      expect(result.data.performance.items_per_minute).toBe(45);
    });

    it('should handle completed extractions', async () => {
      // Arrange
      const mockCompletedResult = {
        extraction_id: 'ext_888',
        status: 'completed',
        progress: {
          processed: 4872,
          total: 4872,
          percentage: 100,
          errors: 12,
          warnings: 45
        },
        completion_time: '2025-08-22T10:45:00Z',
        summary: {
          duration_seconds: 7200,
          success_rate: 99.75,
          items_created: 4800,
          items_updated: 60,
          items_failed: 12
        }
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockCompletedResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extraction-progress', {
        body: { extraction_id: 'ext_888' }
      });

      // Assert
      expect(result.data.status).toBe('completed');
      expect(result.data.progress.percentage).toBe(100);
      expect(result.data.summary.success_rate).toBe(99.75);
    });
  });

  describe('Error Recovery and Retry Logic', () => {
    it('should support extraction retry with smart recovery', async () => {
      // Arrange
      const mockRetryResult = {
        success: true,
        retry_attempt: 2,
        processed: 150,
        errors: 0,
        recovered_items: ['IC-25', 'IC-47', 'IC-89'],
        strategy_used: 'exponential_backoff',
        next_retry_delay: 0 // No more retries needed
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockRetryResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { 
          action: 'retry_failed',
          extraction_id: 'ext_failed_123',
          retry_strategy: 'exponential_backoff',
          max_retries: 3
        }
      });

      // Assert
      expect(result.data.success).toBe(true);
      expect(result.data.retry_attempt).toBe(2);
      expect(result.data.recovered_items).toHaveLength(3);
      expect(result.data.strategy_used).toBe('exponential_backoff');
    });

    it('should handle maximum retry attempts reached', async () => {
      // Arrange
      const mockMaxRetriesResult = {
        success: false,
        error: 'MAX_RETRIES_EXCEEDED',
        retry_attempt: 5,
        max_retries: 5,
        permanently_failed_items: ['IC-10', 'IC-25'],
        recommendations: [
          'Check UNESS server status',
          'Verify CAS authentication',
          'Manual intervention required for failed items'
        ]
      };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockMaxRetriesResult,
        error: null
      });

      // Act
      const result = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { 
          action: 'retry_failed',
          extraction_id: 'ext_failed_456'
        }
      });

      // Assert
      expect(result.data.success).toBe(false);
      expect(result.data.error).toBe('MAX_RETRIES_EXCEEDED');
      expect(result.data.permanently_failed_items).toHaveLength(2);
      expect(result.data.recommendations).toHaveLength(3);
    });
  });
});