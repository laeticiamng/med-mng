import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * 2FA Setup Result
 */
export interface TwoFactorSetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

/**
 * 2FA Status
 */
export interface TwoFactorStatus {
  isEnabled: boolean;
  backupCodesCount: number;
  lastVerified?: string;
}

/**
 * Hook for Two-Factor Authentication (TOTP)
 *
 * Supports:
 * - TOTP setup with QR code generation
 * - Backup codes generation and management
 * - Verification of TOTP codes
 * - Enable/disable 2FA
 *
 * @example
 * const { setupTwoFactor, verifyCode, generateBackupCodes } = use2FA();
 *
 * // Generate setup QR code
 * const setup = await setupTwoFactor();
 * console.log(setup.qrCode); // Data URL for QR code
 *
 * // Verify code from authenticator app
 * const isValid = await verifyCode('123456');
 *
 * // Generate new backup codes
 * const codes = await generateBackupCodes();
 */
export const use2FA = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a secret and QR code for 2FA setup
   */
  const setupTwoFactor = useCallback(async (): Promise<TwoFactorSetupResult | null> => {
    if (!user?.email) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `MedMNG (${user.email})`,
        issuer: 'MedMNG',
        length: 32,
      });

      if (!secret.otpauth_url) {
        throw new Error('Failed to generate OTP auth URL');
      }

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Generate backup codes
      const backupCodes = generateBackupCodesArray(10);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
        manualEntryKey: secret.base32,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to setup 2FA';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  /**
   * Verify a TOTP code
   */
  const verifyCode = useCallback(
    async (code: string, secret: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify the code
        const verified = speakeasy.totp.verify({
          secret,
          encoding: 'base32',
          token: code,
          window: 2, // Allow 2 time windows (±30 seconds)
        });

        if (!verified) {
          setError('Invalid code. Please check your authenticator app.');
          return false;
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to verify code';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Enable 2FA for user account
   */
  const enableTwoFactor = useCallback(
    async (secret: string, verificationCode: string, backupCodes: string[]): Promise<boolean> => {
      if (!user?.id) return false;

      setIsLoading(true);
      setError(null);

      try {
        // First verify the code
        const isValid = await verifyCode(verificationCode, secret);
        if (!isValid) {
          return false;
        }

        // Save 2FA settings to database
        const { error: dbError } = await supabase.from('user_2fa').upsert(
          {
            user_id: user.id,
            secret,
            backup_codes: backupCodes.map((code) => ({
              code,
              used: false,
              used_at: null,
            })),
            is_enabled: true,
            enabled_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (dbError) {
          setError(dbError.message);
          return false;
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to enable 2FA';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, verifyCode]
  );

  /**
   * Disable 2FA for user account
   */
  const disableTwoFactor = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('user_2fa')
        .update({ is_enabled: false, disabled_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (dbError) {
        setError(dbError.message);
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Get 2FA status
   */
  const getTwoFactorStatus = useCallback(async (): Promise<TwoFactorStatus | null> => {
    if (!user?.id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('user_2fa')
        .select('is_enabled, backup_codes, updated_at')
        .eq('user_id', user.id)
        .single();

      if (dbError && dbError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is normal for first-time users
        throw dbError;
      }

      if (!data) {
        return {
          isEnabled: false,
          backupCodesCount: 0,
        };
      }

      return {
        isEnabled: data.is_enabled || false,
        backupCodesCount: data.backup_codes?.length || 0,
        lastVerified: data.updated_at,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get 2FA status';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Generate new backup codes
   */
  const generateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    if (!user?.id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const codes = generateBackupCodesArray(10);

      // Update backup codes in database
      const { error: dbError } = await supabase
        .from('user_2fa')
        .update({
          backup_codes: codes.map((code) => ({
            code,
            used: false,
            used_at: null,
          })),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (dbError) {
        setError(dbError.message);
        return null;
      }

      return codes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate backup codes';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Verify using backup code
   */
  const verifyBackupCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch user's 2FA data
      const { data, error: fetchError } = await supabase
        .from('user_2fa')
        .select('backup_codes')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data?.backup_codes) {
        setError('No backup codes found');
        return false;
      }

      // Find the backup code
      const backupCodeIndex = data.backup_codes.findIndex(
        (bc: any) => bc.code === code && !bc.used
      );

      if (backupCodeIndex === -1) {
        setError('Invalid or already used backup code');
        return false;
      }

      // Mark backup code as used
      const updatedCodes = [...data.backup_codes];
      updatedCodes[backupCodeIndex].used = true;
      updatedCodes[backupCodeIndex].used_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('user_2fa')
        .update({ backup_codes: updatedCodes })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify backup code';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    // Setup & Configuration
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    getTwoFactorStatus,

    // Verification
    verifyCode,
    verifyBackupCode,

    // Backup codes
    generateBackupCodes,

    // State
    isLoading,
    error,
  };
};

/**
 * Generate array of backup codes
 * Format: XXXX-XXXX-XXXX (12 characters + 2 dashes)
 */
function generateBackupCodesArray(count: number): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 12 })
      .map(() => Math.floor(Math.random() * 16).toString(16).toUpperCase())
      .join('')
      .match(/.{1,4}/g)
      ?.join('-');

    if (code) {
      codes.push(code);
    }
  }

  return codes;
}
