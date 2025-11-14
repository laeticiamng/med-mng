import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

/**
 * Connected device information
 */
export interface ConnectedDevice {
  id: string;
  userAgent: string;
  ipAddress: string;
  deviceName: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

/**
 * Session information
 */
export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  token: string;
  isActive: boolean;
  loginTime: string;
  lastActivityTime: string;
  expiresAt: string;
}

/**
 * Hook for Session Management
 *
 * Provides functionality for:
 * - Listing connected devices
 * - Disconnecting devices
 * - Logout all sessions
 * - Track current device
 * - Session timeout management
 *
 * @example
 * const { devices, disconnectDevice, logoutAllDevices, isLoading } = useSessionManagement();
 *
 * // Get all connected devices
 * const devices = await getConnectedDevices();
 *
 * // Disconnect a specific device
 * await disconnectDevice(deviceId);
 *
 * // Logout from all devices
 * await logoutAllDevices();
 */
export const useSessionManagement = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentDevice, setCurrentDevice] = useState<ConnectedDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse user agent to extract device information
   */
  const parseUserAgent = useCallback((userAgent: string) => {
    // Simple user agent parsing
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';

    // Browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) {
      os = 'Android';
      deviceType = 'mobile';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      os = 'iOS';
      deviceType = userAgent.includes('iPad') ? 'tablet' : 'mobile';
    }

    return { browser, os, deviceType };
  }, []);

  /**
   * Get device name from user agent
   */
  const getDeviceName = useCallback((userAgent: string, browser: string): string => {
    const parsed = parseUserAgent(userAgent);
    return `${parsed.browser} on ${parsed.os}`;
  }, [parseUserAgent]);

  /**
   * Get current device info
   */
  const getCurrentDevice = useCallback((): ConnectedDevice => {
    const userAgent = navigator.userAgent;
    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Simple IP detection (would need backend support for real IP)
    const ipAddress = 'Unknown';

    return {
      id: `${Date.now()}-${Math.random()}`,
      userAgent,
      ipAddress,
      deviceName: getDeviceName(userAgent, browser),
      deviceType,
      browser,
      os,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isCurrent: true,
    };
  }, [parseUserAgent, getDeviceName]);

  /**
   * Fetch connected devices from database
   */
  const getConnectedDevices = useCallback(async (): Promise<ConnectedDevice[]> => {
    if (!user?.id) return [];

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('user_connected_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });

      if (dbError) {
        throw dbError;
      }

      if (!data) {
        return [];
      }

      const devicesList = data.map((d: any) => ({
        id: d.id,
        userAgent: d.user_agent,
        ipAddress: d.ip_address,
        deviceName: d.device_name,
        deviceType: d.device_type,
        browser: d.browser,
        os: d.os,
        lastActive: d.last_active,
        createdAt: d.created_at,
        isCurrent: false,
      }));

      setDevices(devicesList);
      return devicesList;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch devices';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Register current device
   */
  const registerCurrentDevice = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      const current = getCurrentDevice();

      const { error: dbError } = await supabase.from('user_connected_devices').insert({
        user_id: user.id,
        device_id: current.id,
        user_agent: current.userAgent,
        ip_address: current.ipAddress,
        device_name: current.deviceName,
        device_type: current.deviceType,
        browser: current.browser,
        os: current.os,
        last_active: current.lastActive,
      });

      if (dbError) {
        throw dbError;
      }

      setCurrentDevice(current);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register device';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getCurrentDevice]);

  /**
   * Disconnect a device
   */
  const disconnectDevice = useCallback(
    async (deviceId: string): Promise<boolean> => {
      if (!user?.id) return false;

      setIsLoading(true);
      setError(null);

      try {
        const { error: dbError } = await supabase
          .from('user_connected_devices')
          .delete()
          .eq('user_id', user.id)
          .eq('device_id', deviceId);

        if (dbError) {
          throw dbError;
        }

        // Update local state
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to disconnect device';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Logout from all devices
   */
  const logoutAllDevices = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Delete all sessions
      const { error: sessionsError } = await supabase
        .from('user_session_logs')
        .delete()
        .eq('user_id', user.id);

      if (sessionsError) {
        throw sessionsError;
      }

      // Delete all connected devices
      const { error: devicesError } = await supabase
        .from('user_connected_devices')
        .delete()
        .eq('user_id', user.id);

      if (devicesError) {
        throw devicesError;
      }

      setDevices([]);
      setSessions([]);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout all devices';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Update device last active time
   */
  const updateLastActive = useCallback(
    async (deviceId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const { error: dbError } = await supabase
          .from('user_connected_devices')
          .update({ last_active: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('device_id', deviceId);

        if (dbError) {
          throw dbError;
        }

        // Update local state
        setDevices((prev) =>
          prev.map((d) =>
            d.id === deviceId ? { ...d, lastActive: new Date().toISOString() } : d
          )
        );
        return true;
      } catch (err) {
        console.error('Failed to update last active:', err);
        return false;
      }
    },
    [user?.id]
  );

  /**
   * Get sessions for user
   */
  const getSessions = useCallback(async (): Promise<Session[]> => {
    if (!user?.id) return [];

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('user_session_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('login_time', { ascending: false });

      if (dbError) {
        throw dbError;
      }

      if (!data) {
        return [];
      }

      const sessionsList = data.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        deviceId: s.device_id,
        token: s.token,
        isActive: s.is_active,
        loginTime: s.login_time,
        lastActivityTime: s.last_activity_time,
        expiresAt: s.expires_at,
      }));

      setSessions(sessionsList);
      return sessionsList;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Initialize session tracking on mount
   */
  useEffect(() => {
    if (user?.id) {
      registerCurrentDevice();
      getConnectedDevices();
      getSessions();

      // Update activity every 5 minutes
      const interval = setInterval(() => {
        if (currentDevice) {
          updateLastActive(currentDevice.id);
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [user?.id, registerCurrentDevice, getConnectedDevices, getSessions, currentDevice, updateLastActive]);

  return {
    // Devices
    devices,
    currentDevice,
    getConnectedDevices,
    disconnectDevice,
    registerCurrentDevice,

    // Sessions
    sessions,
    getSessions,
    logoutAllDevices,

    // Utilities
    updateLastActive,

    // State
    isLoading,
    error,
  };
};

export default useSessionManagement;
