import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Copy, Shield, AlertTriangle } from 'lucide-react';
import { use2FA, TwoFactorSetupResult, TwoFactorStatus } from '@/hooks/use2FA';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Props for TwoFactorAuth component
 */
interface TwoFactorAuthProps {
  /**
   * Callback when 2FA setup is complete
   */
  onSetupComplete?: () => void;

  /**
   * Callback when 2FA is disabled
   */
  onDisabled?: () => void;

  /**
   * Show full setup dialog or compact view
   */
  variant?: 'dialog' | 'inline';
}

/**
 * TwoFactorAuth Component
 *
 * Comprehensive 2FA setup and management component supporting:
 * - TOTP setup with QR code scanning
 * - Manual entry key for non-QR setups
 * - Backup codes generation and download
 * - Verification of TOTP codes
 * - Enable/disable 2FA
 *
 * @example
 * <TwoFactorAuth
 *   variant="dialog"
 *   onSetupComplete={() => console.log('2FA enabled')}
 * />
 *
 * @example
 * <TwoFactorAuth variant="inline" />
 */
export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onSetupComplete,
  onDisabled,
  variant = 'dialog',
}) => {
  const {
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    getTwoFactorStatus,
    verifyCode,
    isLoading,
    error,
  } = use2FA();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'backup'>('status');
  const [setupData, setSetupData] = useState<TwoFactorSetupResult | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);

  // Load 2FA status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  /**
   * Load current 2FA status
   */
  const loadStatus = async () => {
    const status = await getTwoFactorStatus();
    if (status) {
      setStatus(status);
      setStep('status');
    }
  };

  /**
   * Start 2FA setup
   */
  const handleStartSetup = async () => {
    const setup = await setupTwoFactor();
    if (setup) {
      setSetupData(setup);
      setStep('setup');
    }
  };

  /**
   * Handle verification code submission
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!setupData || !verificationCode.trim()) {
      toast.error('Please enter a verification code');
      return;
    }

    const isValid = await verifyCode(verificationCode, setupData.secret);
    if (isValid) {
      setStep('backup');
    } else {
      toast.error('Invalid code. Please try again.');
      setVerificationCode('');
    }
  };

  /**
   * Complete 2FA setup
   */
  const handleCompleteSetup = async () => {
    if (!setupData) return;

    const success = await enableTwoFactor(
      setupData.secret,
      verificationCode,
      setupData.backupCodes
    );

    if (success) {
      toast.success('Two-factor authentication enabled successfully!');
      await loadStatus();
      setIsOpen(false);
      setVerificationCode('');
      setSetupData(null);
      setBackupCodesDownloaded(false);
      onSetupComplete?.();
    }
  };

  /**
   * Handle disable 2FA
   */
  const handleDisable = async () => {
    if (
      confirm(
        'Are you sure you want to disable 2FA? This will reduce the security of your account.'
      )
    ) {
      const success = await disableTwoFactor();
      if (success) {
        toast.success('Two-factor authentication disabled');
        await loadStatus();
        onDisabled?.();
      }
    }
  };

  /**
   * Download backup codes
   */
  const handleDownloadBackupCodes = () => {
    if (!setupData) return;

    const content = `MedMNG - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `medmng-2fa-backup-codes-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setBackupCodesDownloaded(true);
    toast.success('Backup codes downloaded');
  };

  /**
   * Copy code to clipboard
   */
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  // Render content based on variant
  if (variant === 'inline') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {status?.isEnabled
              ? 'Two-factor authentication is enabled on your account'
              : 'Add an extra layer of security to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status?.isEnabled ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Two-factor authentication is active on your account
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Backup Codes</p>
                <p className="text-sm text-gray-600 mb-3">
                  You have {status.backupCodesCount} backup codes remaining. Save them in a safe place.
                </p>
              </div>

              <Button variant="destructive" onClick={handleDisable} disabled={isLoading}>
                Disable 2FA
              </Button>
            </div>
          ) : (
            <Button onClick={handleStartSetup} disabled={isLoading} size="lg">
              Enable 2FA
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Dialog variant
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Shield className="h-4 w-4 mr-2" />
        {status?.isEnabled ? 'Manage 2FA' : 'Enable 2FA'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {status?.isEnabled
                ? 'Manage your two-factor authentication settings'
                : 'Add an extra layer of security with 2FA'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'status' && status && (
              <div className="space-y-4">
                {status.isEnabled ? (
                  <>
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Two-factor authentication is active on your account
                      </AlertDescription>
                    </Alert>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Backup Codes Remaining</p>
                      <p className="text-2xl font-bold text-gray-900">{status.backupCodesCount}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Keep these safe. You'll need them if you lose access to your authenticator.
                      </p>
                    </div>
                    <Button variant="destructive" onClick={handleDisable} disabled={isLoading}>
                      Disable 2FA
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleStartSetup} disabled={isLoading} size="lg" className="w-full">
                    Enable 2FA
                  </Button>
                )}
              </div>
            )}

            {step === 'setup' && setupData && (
              <Tabs value="qr" defaultValue="qr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value="qr" className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={setupData.qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48 border-2 border-gray-200 rounded-lg p-2"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft
                    Authenticator, etc.)
                  </p>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Manual Entry Key</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-gray-100 p-3 rounded font-mono text-sm break-all">
                        {setupData.manualEntryKey}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyCode(setupData.manualEntryKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {step === 'setup' && setupData && (
              <form onSubmit={handleVerifyCode} className="space-y-4 mt-6 pt-6 border-t">
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    After scanning, enter the 6-digit code from your authenticator app below
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="verification-code" className="text-sm font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="mt-2 text-center text-2xl tracking-[0.5em] font-mono"
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" disabled={isLoading || verificationCode.length !== 6} className="w-full">
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </form>
            )}

            {step === 'backup' && setupData && (
              <div className="space-y-4">
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Save these backup codes in a secure location. You'll need them if you lose access to
                    your authenticator app.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {setupData.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                    >
                      <code className="font-mono text-sm">{code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyCode(code)}
                        className="h-6 w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={handleDownloadBackupCodes}
                  disabled={isLoading}
                  className="w-full"
                >
                  Download Backup Codes
                </Button>

                <div className="flex gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={backupCodesDownloaded}
                      onChange={(e) => setBackupCodesDownloaded(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    I have downloaded and stored my backup codes safely
                  </label>
                </div>

                <Button
                  onClick={handleCompleteSetup}
                  disabled={isLoading || !backupCodesDownloaded}
                  className="w-full"
                >
                  {isLoading ? 'Enabling 2FA...' : 'Complete Setup'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwoFactorAuth;
