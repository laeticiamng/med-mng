import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import {
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  Trash2,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Props for ConnectedDevices component
 */
interface ConnectedDevicesProps {
  /**
   * Callback when device is disconnected
   */
  onDeviceDisconnected?: () => void;

  /**
   * Callback when logout all is completed
   */
  onLogoutAll?: () => void;
}

/**
 * ConnectedDevices Component
 *
 * Displays list of devices connected to the user's account and allows:
 * - View device details (browser, OS, IP, last active)
 * - Disconnect individual devices
 * - Logout from all devices
 * - Mark current device
 *
 * @example
 * <ConnectedDevices
 *   onDeviceDisconnected={() => console.log('Device disconnected')}
 *   onLogoutAll={() => console.log('Logged out from all devices')}
 * />
 */
export const ConnectedDevices: React.FC<ConnectedDevicesProps> = ({
  onDeviceDisconnected,
  onLogoutAll,
}) => {
  const { devices, currentDevice, isLoading, error, getConnectedDevices, disconnectDevice, logoutAllDevices } =
    useSessionManagement();

  const [showDisconnectConfirm, setShowDisconnectConfirm] = React.useState<string | null>(null);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  // Load devices on mount
  useEffect(() => {
    getConnectedDevices();
  }, [getConnectedDevices]);

  /**
   * Handle disconnect device
   */
  const handleDisconnectDevice = async (deviceId: string) => {
    setIsDisconnecting(true);
    try {
      const success = await disconnectDevice(deviceId);
      if (success) {
        toast.success('Device disconnected');
        onDeviceDisconnected?.();
      } else {
        toast.error('Failed to disconnect device');
      }
    } finally {
      setIsDisconnecting(false);
      setShowDisconnectConfirm(null);
    }
  };

  /**
   * Handle logout all devices
   */
  const handleLogoutAll = async () => {
    setIsDisconnecting(true);
    try {
      const success = await logoutAllDevices();
      if (success) {
        toast.success('Logged out from all devices');
        onLogoutAll?.();
      } else {
        toast.error('Failed to logout from all devices');
      }
    } finally {
      setIsDisconnecting(false);
      setShowLogoutAllConfirm(false);
    }
  };

  /**
   * Get device icon based on type
   */
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>
            {devices.length === 0
              ? 'You don\'t have any connected devices yet'
              : `${devices.length} device${devices.length !== 1 ? 's' : ''} connected to your account`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No connected devices found. This is your first login.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Device Icon */}
                    <div className="text-muted-foreground pt-1">{getDeviceIcon(device.deviceType)}</div>

                    {/* Device Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{device.deviceName}</h4>
                        {device.isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>
                            {device.browser} • {device.os}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{device.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            Last active{' '}
                            {formatDistanceToNow(new Date(device.lastActive), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Connected{' '}
                          {formatDistanceToNow(new Date(device.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!device.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDisconnectConfirm(device.id)}
                      disabled={isDisconnecting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Logout All Button */}
          {devices.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setShowLogoutAllConfirm(true)}
                disabled={isDisconnecting}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout From All Devices
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This will disconnect all other devices and log you out everywhere.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Device Confirmation Dialog */}
      <AlertDialog open={!!showDisconnectConfirm} onOpenChange={() => setShowDisconnectConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Device?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this device? You'll need to log in again if you want to use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => {
              if (showDisconnectConfirm) {
                handleDisconnectDevice(showDisconnectConfirm);
              }
            }}
            disabled={isDisconnecting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout All Confirmation Dialog */}
      <AlertDialog open={showLogoutAllConfirm} onOpenChange={setShowLogoutAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout From All Devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect all devices and log you out everywhere. You'll need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={handleLogoutAll}
            disabled={isDisconnecting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDisconnecting ? 'Logging out...' : 'Logout All'}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConnectedDevices;
