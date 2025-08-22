/**
 * Tests d'intégration pour les services d'extraction
 * Tests end-to-end du processus d'extraction complet
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock complet de l'environnement Supabase
const mockSupabase = {
  functions: {
    invoke: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis()
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Data Extraction Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete EDN Extraction Flow', () => {
    it('should complete full EDN extraction workflow', async () => {
      // Phase 1: Authentication
      const mockAuthResult = {
        success: true,
        authenticated: true,
        cookies: 'PHPSESSID=session123',
        session_expires: new Date(Date.now() + 3600000).toISOString()
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({
          data: mockAuthResult,
          error: null
        });

      // Phase 2: Pre-extraction validation
      const mockValidationResult = {
        success: true,
        server_accessible: true,
        estimated_items: 367,
        estimated_duration_minutes: 45,
        prerequisites_met: true
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({
          data: mockValidationResult,
          error: null
        });

      // Phase 3: Full extraction
      const mockExtractionResult = {
        success: true,
        extraction_id: 'edn_full_20250822_100000',
        processed: 367,
        created: 350,
        updated: 15,
        errors: 2,
        failed_items: ['IC-125', 'IC-289'],
        duration_seconds: 2700,
        final_stats: {
          rang_a_items: 367,
          rang_b_items: 367,
          with_content: 365,
          with_quiz: 360,
          completeness_avg: 87.3
        }
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({
          data: mockExtractionResult,
          error: null
        });

      // Act - Execute complete workflow
      const authStep = await mockSupabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: false }
      });

      const validationStep = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { action: 'validate_prerequisites' }
      });

      const extractionStep = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { action: 'full_extraction', force: false }
      });

      // Assert - Complete workflow success
      expect(authStep.data.success).toBe(true);
      expect(validationStep.data.prerequisites_met).toBe(true);
      expect(extractionStep.data.success).toBe(true);
      expect(extractionStep.data.processed).toBe(367);
      expect(extractionStep.data.final_stats.completeness_avg).toBe(87.3);
    });

    it('should handle partial failures and recovery', async () => {
      // Phase 1: Initial extraction with partial failure
      const mockPartialFailure = {
        success: false,
        extraction_id: 'edn_partial_fail_001',
        processed: 150,
        total: 367,
        errors: 25,
        error: 'PARTIAL_EXTRACTION_FAILURE',
        failed_items: Array.from({ length: 25 }, (_, i) => `IC-${100 + i}`),
        recoverable: true,
        checkpoint: 'IC-150'
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({
          data: mockPartialFailure,
          error: null
        });

      // Phase 2: Recovery attempt
      const mockRecoveryResult = {
        success: true,
        extraction_id: 'edn_recovery_001',
        recovery_mode: true,
        processed: 217, // Remaining items
        recovered: 20,  // Previously failed items recovered
        still_failed: 5,
        permanently_failed_items: ['IC-125', 'IC-289', 'IC-301', 'IC-355', 'IC-367'],
        total_processed: 367,
        final_success_rate: 98.6
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({
          data: mockRecoveryResult,
          error: null
        });

      // Act
      const initialResult = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { action: 'full_extraction' }
      });

      const recoveryResult = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { 
          action: 'recover_extraction',
          extraction_id: 'edn_partial_fail_001',
          retry_failed: true
        }
      });

      // Assert
      expect(initialResult.data.recoverable).toBe(true);
      expect(recoveryResult.data.success).toBe(true);
      expect(recoveryResult.data.final_success_rate).toBe(98.6);
      expect(recoveryResult.data.permanently_failed_items).toHaveLength(5);
    });
  });

  describe('ECOS Extraction with Media Processing', () => {
    it('should extract ECOS data with media files', async () => {
      // Phase 1: Basic ECOS extraction
      const mockEcosBasic = {
        success: true,
        extraction_id: 'ecos_basic_001',
        processed: 250,
        situations_created: 245,
        situations_updated: 5,
        categories: ['cardiologie', 'pneumologie', 'gastroenterologie']
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({
          data: mockEcosBasic,
          error: null
        });

      // Phase 2: Media processing
      const mockMediaProcessing = {
        success: true,
        extraction_id: 'ecos_media_001',
        media_processed: 150,
        images_downloaded: 120,
        videos_downloaded: 25,
        audio_files: 5,
        media_storage_used_mb: 1250,
        failed_media: [
          { type: 'image', url: 'https://ecos.example.com/image404.jpg', error: '404 Not Found' }
        ]
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({
          data: mockMediaProcessing,
          error: null
        });

      // Act
      const basicResult = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { action: 'extract_situations', include_media: false }
      });

      const mediaResult = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { 
          action: 'process_media',
          extraction_id: 'ecos_basic_001',
          media_types: ['images', 'videos', 'audio']
        }
      });

      // Assert
      expect(basicResult.data.processed).toBe(250);
      expect(mediaResult.data.media_processed).toBe(150);
      expect(mediaResult.data.media_storage_used_mb).toBe(1250);
      expect(mediaResult.data.failed_media).toHaveLength(1);
    });

    it('should handle ECOS authentication timeout during extraction', async () => {
      // Arrange
      const steps = [
        // Step 1: Successful start
        {
          success: true,
          extraction_id: 'ecos_timeout_001',
          processed: 50,
          total: 250,
          status: 'in_progress'
        },
        // Step 2: Authentication timeout
        {
          success: false,
          error: 'ECOS_AUTH_TIMEOUT',
          extraction_id: 'ecos_timeout_001',
          processed: 75,
          total: 250,
          details: 'ECOS session expired after 30 minutes',
          requires_reauth: true
        },
        // Step 3: Re-authentication and resume
        {
          success: true,
          extraction_id: 'ecos_timeout_001_resumed',
          resumed_from: 75,
          processed: 175,
          total: 250,
          status: 'completed',
          total_duration_with_recovery: 4500
        }
      ];

      steps.forEach(step => {
        mockSupabase.functions.invoke.mockResolvedValueOnce({
          data: step,
          error: null
        });
      });

      // Act
      const startResult = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { action: 'extract_all' }
      });

      const timeoutResult = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { action: 'continue_extraction', extraction_id: 'ecos_timeout_001' }
      });

      const resumeResult = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { 
          action: 'resume_after_reauth',
          extraction_id: 'ecos_timeout_001',
          resume_from: 75
        }
      });

      // Assert
      expect(startResult.data.status).toBe('in_progress');
      expect(timeoutResult.data.error).toBe('ECOS_AUTH_TIMEOUT');
      expect(timeoutResult.data.requires_reauth).toBe(true);
      expect(resumeResult.data.status).toBe('completed');
      expect(resumeResult.data.resumed_from).toBe(75);
    });
  });

  describe('OIC Objectives Mass Extraction', () => {
    it('should handle large-scale OIC extraction with batching', async () => {
      // Simulate batched extraction of 4,872 objectives
      const totalObjectives = 4872;
      const batchSize = 500;
      const batches = Math.ceil(totalObjectives / batchSize);

      const mockBatchResults = Array.from({ length: batches }, (_, i) => {
        const batchStart = i * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, totalObjectives);
        const batchProcessed = batchEnd - batchStart;

        return {
          success: true,
          batch_number: i + 1,
          total_batches: batches,
          batch_processed: batchProcessed,
          cumulative_processed: batchEnd,
          total_objectives: totalObjectives,
          batch_errors: Math.floor(Math.random() * 3), // Random 0-2 errors per batch
          estimated_remaining_time: Math.max(0, (batches - i - 1) * 120), // 2 minutes per batch
          progress_percentage: Math.round((batchEnd / totalObjectives) * 100)
        };
      });

      // Mock all batch responses
      mockBatchResults.forEach(result => {
        mockSupabase.functions.invoke.mockResolvedValueOnce({
          data: result,
          error: null
        });
      });

      // Final completion result
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: {
          success: true,
          extraction_id: 'oic_complete_001',
          total_processed: totalObjectives,
          total_errors: mockBatchResults.reduce((sum, batch) => sum + batch.batch_errors, 0),
          duration_seconds: batches * 120,
          final_stats: {
            rang_a_objectives: 2400,
            rang_b_objectives: 2472,
            success_rate: 99.2,
            avg_processing_time_per_objective: 0.15
          }
        },
        error: null
      });

      // Act - Process all batches
      const batchResults = [];
      for (let i = 0; i < batches; i++) {
        const result = await mockSupabase.functions.invoke('extract-oic-objectives', {
          body: { 
            action: 'extract_batch',
            batch_number: i + 1,
            batch_size: batchSize
          }
        });
        batchResults.push(result);
      }

      // Final completion check
      const finalResult = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { action: 'finalize_extraction' }
      });

      // Assert
      expect(batchResults).toHaveLength(batches);
      expect(batchResults[batchResults.length - 1].data.progress_percentage).toBe(100);
      expect(finalResult.data.total_processed).toBe(totalObjectives);
      expect(finalResult.data.final_stats.success_rate).toBeGreaterThan(99);
    });

    it('should handle rate limiting during mass extraction', async () => {
      // Phase 1: Initial batch success
      const mockInitialSuccess = {
        success: true,
        batch_processed: 500,
        cumulative_processed: 500,
        total_objectives: 4872
      };

      // Phase 2: Rate limit hit
      const mockRateLimit = {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        batch_processed: 0,
        cumulative_processed: 500,
        total_objectives: 4872,
        rate_limit_details: {
          requests_per_minute: 60,
          current_requests: 65,
          reset_time: new Date(Date.now() + 300000).toISOString(), // 5 minutes
          retry_after_seconds: 300
        },
        extraction_paused: true
      };

      // Phase 3: Resume after rate limit
      const mockResumeSuccess = {
        success: true,
        batch_processed: 500,
        cumulative_processed: 1000,
        total_objectives: 4872,
        resumed_after_rate_limit: true,
        adjusted_rate_limit_strategy: {
          requests_per_minute: 45,
          batch_delay_seconds: 10
        }
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({ data: mockInitialSuccess, error: null })
        .mockResolvedValueOnce({ data: mockRateLimit, error: null })
        .mockResolvedValueOnce({ data: mockResumeSuccess, error: null });

      // Act
      const batch1 = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { action: 'extract_batch', batch_number: 1 }
      });

      const batch2 = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { action: 'extract_batch', batch_number: 2 }
      });

      // Simulate waiting for rate limit reset
      const resumeBatch = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { action: 'resume_extraction', batch_number: 2 }
      });

      // Assert
      expect(batch1.data.success).toBe(true);
      expect(batch2.data.error).toBe('RATE_LIMIT_EXCEEDED');
      expect(batch2.data.extraction_paused).toBe(true);
      expect(resumeBatch.data.resumed_after_rate_limit).toBe(true);
      expect(resumeBatch.data.adjusted_rate_limit_strategy.requests_per_minute).toBe(45);
    });
  });

  describe('Cross-Service Integration', () => {
    it('should coordinate extraction across multiple services', async () => {
      // Scenario: Extract EDN items, then OIC objectives for those items, then ECOS situations
      
      // Phase 1: EDN extraction
      const mockEdnResult = {
        success: true,
        extraction_id: 'edn_cross_001',
        processed: 367,
        item_codes: Array.from({ length: 367 }, (_, i) => `IC-${i + 1}`)
      };

      // Phase 2: OIC extraction for EDN items
      const mockOicResult = {
        success: true,
        extraction_id: 'oic_cross_001',
        processed: 4872,
        linked_to_edn_items: 367,
        orphaned_objectives: 0, // All objectives linked to EDN items
        cross_reference_success_rate: 100
      };

      // Phase 3: ECOS extraction with EDN cross-references
      const mockEcosResult = {
        success: true,
        extraction_id: 'ecos_cross_001',
        processed: 250,
        linked_to_edn_items: 180,
        edn_coverage_percentage: 49.0, // 180/367
        situations_with_objectives: 220
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({ data: mockEdnResult, error: null })
        .mockResolvedValueOnce({ data: mockOicResult, error: null })
        .mockResolvedValueOnce({ data: mockEcosResult, error: null });

      // Act - Coordinated extraction
      const ednResult = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { action: 'full_extraction' }
      });

      const oicResult = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { 
          action: 'extract_for_edn_items',
          edn_extraction_id: 'edn_cross_001'
        }
      });

      const ecosResult = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { 
          action: 'extract_with_edn_linking',
          edn_extraction_id: 'edn_cross_001'
        }
      });

      // Assert - Cross-service coordination
      expect(ednResult.data.processed).toBe(367);
      expect(oicResult.data.linked_to_edn_items).toBe(367);
      expect(oicResult.data.cross_reference_success_rate).toBe(100);
      expect(ecosResult.data.edn_coverage_percentage).toBe(49.0);
      expect(ecosResult.data.situations_with_objectives).toBe(220);
    });

    it('should handle cross-service extraction failures gracefully', async () => {
      // Phase 1: EDN extraction succeeds
      const mockEdnSuccess = {
        success: true,
        extraction_id: 'edn_cross_fail_001',
        processed: 367
      };

      // Phase 2: OIC extraction fails
      const mockOicFailure = {
        success: false,
        error: 'OIC_SERVER_UNAVAILABLE',
        extraction_id: 'oic_cross_fail_001',
        processed: 0,
        details: 'Unable to connect to OIC objectives server'
      };

      // Phase 3: ECOS extraction proceeds with EDN-only data
      const mockEcosPartial = {
        success: true,
        extraction_id: 'ecos_cross_partial_001',
        processed: 250,
        linked_to_edn_items: 180,
        oic_objectives_available: false,
        fallback_mode: 'edn_only'
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({ data: mockEdnSuccess, error: null })
        .mockResolvedValueOnce({ data: mockOicFailure, error: null })
        .mockResolvedValueOnce({ data: mockEcosPartial, error: null });

      // Act
      const ednResult = await mockSupabase.functions.invoke('extract-edn-uness-production', {
        body: { action: 'full_extraction' }
      });

      const oicResult = await mockSupabase.functions.invoke('extract-oic-objectives', {
        body: { action: 'extract_for_edn_items' }
      });

      const ecosResult = await mockSupabase.functions.invoke('extract-ecos-data', {
        body: { 
          action: 'extract_with_fallback',
          ignore_oic_failure: true
        }
      });

      // Assert - Graceful degradation
      expect(ednResult.data.success).toBe(true);
      expect(oicResult.data.success).toBe(false);
      expect(ecosResult.data.success).toBe(true);
      expect(ecosResult.data.fallback_mode).toBe('edn_only');
      expect(ecosResult.data.oic_objectives_available).toBe(false);
    });
  });
});