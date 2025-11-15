/**
 * User Security Service
 * Manages 2FA, connected devices, and session logs
 */

import { supabase } from '@/integrations/supabase/client'
import { Result, success, failure } from '@/types/result'
import { extractErrorMessage } from '@/lib/error-messages'
import {
  User2FA,
  User2FAInsert,
  User2FAUpdate,
  UserConnectedDevice,
  UserConnectedDeviceInsert,
  UserConnectedDeviceUpdate,
  UserSessionLog,
  UserSessionLogInsert,
  UserSessionLogUpdate,
  DeviceType,
  SessionStatus,
} from '@/types/database-custom'

// ============================================================================
// 2FA FUNCTIONS
// ============================================================================

export const user2FAService = {
  /**
   * Create or get 2FA config
   */
  async getOrCreate2FA(userId: string): Promise<Result<User2FA, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_2fa')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // No record found, create one
        const { data: newData, error: createError } = await supabase
          .from('user_2fa')
          .insert({
            user_id: userId,
            secret_encrypted: '',
            backup_codes: [],
            enabled: false,
          } as User2FAInsert)
          .select()
          .single()

        if (createError) {
          return failure(new Error(extractErrorMessage(createError)))
        }
        return success(newData as User2FA)
      }

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as User2FA)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Update 2FA config
   */
  async update2FA(
    userId: string,
    updates: Partial<User2FAUpdate>
  ): Promise<Result<User2FA, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_2fa')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as User2FA)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Enable 2FA for user
   */
  async enable2FA(
    userId: string,
    secretEncrypted: string,
    backupCodes: string[]
  ): Promise<Result<User2FA, Error>> {
    return this.update2FA(userId, {
      secret_encrypted: secretEncrypted,
      backup_codes: backupCodes,
      enabled: true,
      verified_at: new Date().toISOString(),
    })
  },

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId: string): Promise<Result<User2FA, Error>> {
    return this.update2FA(userId, {
      enabled: false,
      backup_codes: [],
      backup_codes_used: [],
    })
  },

  /**
   * Mark backup code as used
   */
  async markBackupCodeUsed(userId: string, code: string): Promise<Result<void, Error>> {
    try {
      const configResult = await this.getOrCreate2FA(userId)
      if (!configResult.success) {
        return failure(configResult.error)
      }

      const updatedUsedCodes = [...(configResult.data.backup_codes_used || []), code]

      const updateResult = await this.update2FA(userId, {
        backup_codes_used: updatedUsedCodes,
      })

      if (!updateResult.success) {
        return failure(updateResult.error)
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },
}

// ============================================================================
// CONNECTED DEVICES FUNCTIONS
// ============================================================================

export const userDevicesService = {
  /**
   * Register a device
   */
  async registerDevice(
    userId: string,
    deviceName: string,
    options?: {
      deviceType?: DeviceType
      deviceOS?: string
      browserName?: string
      browserVersion?: string
      ipAddress?: string
      userAgent?: string
      isCurrent?: boolean
    }
  ): Promise<Result<UserConnectedDevice, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_connected_devices')
        .insert({
          user_id: userId,
          device_name: deviceName,
          device_type: options?.deviceType,
          device_os: options?.deviceOS,
          browser_name: options?.browserName,
          browser_version: options?.browserVersion,
          ip_address: options?.ipAddress,
          user_agent: options?.userAgent,
          is_current: options?.isCurrent || false,
        } as UserConnectedDeviceInsert)
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserConnectedDevice)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Update device last active time
   */
  async updateDeviceActivity(deviceId: string): Promise<Result<UserConnectedDevice, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_connected_devices')
        .update({ last_active: new Date().toISOString() })
        .eq('id', deviceId)
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserConnectedDevice)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get user's connected devices
   */
  async getUserDevices(userId: string): Promise<Result<UserConnectedDevice[], Error>> {
    try {
      const { data, error } = await supabase
        .from('user_connected_devices')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false })

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserConnectedDevice[])
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Remove a device
   */
  async removeDevice(deviceId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('user_connected_devices')
        .delete()
        .eq('id', deviceId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Remove all devices except current
   */
  async removeOtherDevices(userId: string, currentDeviceId: string): Promise<Result<void, Error>> {
    try {
      const devicesResult = await this.getUserDevices(userId)
      if (!devicesResult.success) {
        return failure(devicesResult.error)
      }

      const devicesToRemove = devicesResult.data
        .filter((d) => d.id !== currentDeviceId)
        .map((d) => d.id)

      for (const deviceId of devicesToRemove) {
        const removeResult = await this.removeDevice(deviceId)
        if (!removeResult.success) {
          return failure(removeResult.error)
        }
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },
}

// ============================================================================
// SESSION LOGS FUNCTIONS
// ============================================================================

export const userSessionsService = {
  /**
   * Create a session log
   */
  async createSession(
    userId: string,
    sessionId: string,
    options?: {
      deviceId?: string
      ipAddress?: string
      userAgent?: string
      status?: SessionStatus
    }
  ): Promise<Result<UserSessionLog, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .insert({
          user_id: userId,
          session_id: sessionId,
          device_id: options?.deviceId,
          ip_address: options?.ipAddress,
          user_agent: options?.userAgent,
          status: options?.status || 'active',
        } as UserSessionLogInsert)
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserSessionLog)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<Result<UserSessionLog, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .update({
          logout_at: new Date().toISOString(),
          status: 'logged_out',
        } as UserSessionLogUpdate)
        .eq('session_id', sessionId)
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserSessionLog)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get user's sessions
   */
  async getUserSessions(
    userId: string,
    options?: {
      status?: SessionStatus
      limit?: number
    }
  ): Promise<Result<UserSessionLog[], Error>> {
    try {
      let query = supabase
        .from('user_session_logs')
        .select('*')
        .eq('user_id', userId)
        .order('login_at', { ascending: false })

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserSessionLog[])
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get active sessions
   */
  async getActiveSessions(userId: string): Promise<Result<UserSessionLog[], Error>> {
    return this.getUserSessions(userId, { status: 'active' })
  },

  /**
   * Revoke all sessions
   */
  async revokeAllSessions(userId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('user_session_logs')
        .update({ status: 'revoked' })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<Result<UserSessionLog, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserSessionLog)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Update session last activity
   */
  async updateSessionActivity(sessionId: string): Promise<Result<UserSessionLog, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', sessionId)
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as UserSessionLog)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },
}
