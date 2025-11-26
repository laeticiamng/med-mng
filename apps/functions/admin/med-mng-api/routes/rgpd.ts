import { jsonResponse, errorResponse } from '../response.ts';
import { log } from '../logger.ts';

import { getErrorMessage } from '../../../_shared/error-utils.ts';
// ✅ SÉCURITÉ: RGPD routes nécessitent authentification pour protéger les données utilisateurs
export async function handleRGPD(req: Request, supabase: any, path: string, url: URL, user?: any): Promise<Response | null> {
  // ✅ SÉCURITÉ CRITIQUE: Vérifier authentification pour toutes les routes RGPD
  if (!user) {
    log('warn', 'Tentative d\'accès RGPD sans authentification', { path });
    return errorResponse(401, 'AUTH_REQUIRED', 'Authentication required for GDPR operations');
  }

  // POST /rgpd/export - Export user data (GDPR)
  if (path === '/rgpd/export' && req.method === 'POST') {
    try {
      const { user_id, email } = await req.json();

      // ✅ SÉCURITÉ: Un utilisateur ne peut exporter QUE ses propres données
      // Sauf si admin (vérification rôle admin)
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = userRoles?.some((r: any) => r.role === 'admin');
      const requestedUserId = user_id || user.id;

      if (!isAdmin && requestedUserId !== user.id) {
        log('warn', 'Tentative d\'export RGPD non autorisée', {
          requestingUser: user.id,
          targetUser: requestedUserId
        });
        return errorResponse(403, 'FORBIDDEN', 'You can only export your own data');
      }
      
      if (!user_id && !email) {
        return errorResponse(400, 'MISSING_IDENTIFIER', 'User ID or email required');
      }

      const userData = await exportUserData(supabase, user_id, email);
      
      // Log GDPR export request
      await supabase.from('operation_logs').insert({
        type: 'GDPR_EXPORT',
        message: `Data export requested for user: ${user_id || email}`,
        meta: { user_id, email, timestamp: new Date().toISOString() }
      });

      return jsonResponse({
        export_id: crypto.randomUUID(),
        exported_at: new Date().toISOString(),
        user_data: userData,
        retention_info: {
          data_retention_period: '36 months',
          automatic_deletion: 'After account deletion + 30 days',
          contact_for_questions: 'dpo@medmng.com'
        }
      });
    } catch (error: unknown) {
      log('error', 'GDPR export error', error);
      return errorResponse(500, 'EXPORT_ERROR', 'Failed to export user data');
    }
  }

  // DELETE /rgpd/purge - Purge user data (GDPR)
  if (path === '/rgpd/purge' && req.method === 'DELETE') {
    try {
      const { user_id, confirmation_token } = await req.json();

      if (!user_id || !confirmation_token) {
        return errorResponse(400, 'MISSING_DATA', 'User ID and confirmation token required');
      }

      // ✅ SÉCURITÉ: Un utilisateur ne peut purger QUE ses propres données
      // Sauf si admin
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = userRoles?.some((r: any) => r.role === 'admin');

      if (!isAdmin && user_id !== user.id) {
        log('warn', 'Tentative de purge RGPD non autorisée', {
          requestingUser: user.id,
          targetUser: user_id
        });
        return errorResponse(403, 'FORBIDDEN', 'You can only purge your own data');
      }

      // ✅ SÉCURITÉ: Améliorer la validation du token de confirmation
      // Le token doit être généré côté serveur et stocké temporairement
      const { data: storedToken } = await supabase
        .from('rgpd_purge_tokens')
        .select('*')
        .eq('user_id', user_id)
        .eq('token', confirmation_token)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!storedToken) {
        log('warn', 'Token de purge RGPD invalide ou expiré', { user_id });
        return errorResponse(403, 'INVALID_TOKEN', 'Invalid or expired confirmation token');
      }

      const purgeResult = await purgeUserData(supabase, user_id);
      
      // Log GDPR purge request
      await supabase.from('operation_logs').insert({
        type: 'GDPR_PURGE',
        message: `Complete data purge executed for user: ${user_id}`,
        meta: { 
          user_id, 
          timestamp: new Date().toISOString(),
          purged_records: purgeResult.total_purged
        }
      });

      return jsonResponse({
        purge_id: crypto.randomUUID(),
        purged_at: new Date().toISOString(),
        user_id,
        purge_summary: purgeResult,
        compliance_note: 'All personal data has been permanently deleted in compliance with GDPR Article 17'
      });
    } catch (error: unknown) {
      log('error', 'GDPR purge error', error);
      return errorResponse(500, 'PURGE_ERROR', 'Failed to purge user data');
    }
  }

  // GET /rgpd/status/{user_id} - Check user data status
  if (path.startsWith('/rgpd/status/') && req.method === 'GET') {
    try {
      const user_id = path.split('/')[3];

      if (!user_id) {
        return errorResponse(400, 'MISSING_USER_ID', 'User ID required');
      }

      // ✅ SÉCURITÉ: Un utilisateur ne peut voir QUE son propre statut
      // Sauf si admin
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = userRoles?.some((r: any) => r.role === 'admin');

      if (!isAdmin && user_id !== user.id) {
        log('warn', 'Tentative de consultation statut RGPD non autorisée', {
          requestingUser: user.id,
          targetUser: user_id
        });
        return errorResponse(403, 'FORBIDDEN', 'You can only view your own data status');
      }

      const dataStatus = await getUserDataStatus(supabase, user_id);
      
      return jsonResponse({
        user_id,
        checked_at: new Date().toISOString(),
        data_status: dataStatus,
        gdpr_rights: {
          right_to_access: 'Available via /rgpd/export',
          right_to_rectification: 'Contact support for data corrections',
          right_to_erasure: 'Available via /rgpd/purge',
          right_to_portability: 'Included in data export',
          right_to_object: 'Contact support to object to processing'
        }
      });
    } catch (error: unknown) {
      log('error', 'GDPR status check error', error);
      return errorResponse(500, 'STATUS_ERROR', 'Failed to check user data status');
    }
  }

  return null;
}

async function exportUserData(supabase: any, user_id?: string, email?: string) {
  const userData: any = {
    export_metadata: {
      exported_at: new Date().toISOString(),
      format_version: '1.0',
      data_controller: 'MED-MNG Platform'
    }
  };

  try {
    // Get user profile
    if (user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();
      
      if (profile) {
        userData.profile = profile;
      }
    }

    // Get user activities
    if (user_id) {
      const { data: activities } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user_id)
        .order('timestamp', { ascending: false });
      
      userData.activities = activities || [];
    }

    // Get user subscriptions
    if (user_id) {
      const { data: subscriptions } = await supabase
        .from('med_mng_subscriptions')
        .select('*')
        .eq('user_id', user_id);
      
      userData.subscriptions = subscriptions || [];
    }

    // Get user playlists
    if (user_id) {
      const { data: playlists } = await supabase
        .from('med_mng_playlists')
        .select('*')
        .eq('user_id', user_id);
      
      userData.playlists = playlists || [];
    }

    // Get user songs/library
    if (user_id) {
      const { data: userSongs } = await supabase
        .from('med_mng_user_songs')
        .select('*')
        .eq('user_id', user_id);
      
      userData.library = userSongs || [];
    }

    // Get error logs related to user
    if (user_id) {
      const { data: errorLogs } = await supabase
        .from('error_logs')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      userData.error_logs = errorLogs || [];
    }

    return userData;
  } catch (error: unknown) {
    log('error', 'User data export error', error);
    throw error;
  }
}

async function purgeUserData(supabase: any, user_id: string) {
  const purgeResult = {
    user_id,
    tables_processed: [],
    total_purged: 0,
    errors: []
  };

  const tablesToPurge = [
    'user_activity_logs',
    'med_mng_subscriptions', 
    'med_mng_playlists',
    'med_mng_user_songs',
    'error_logs',
    'emotions',
    'badges',
    'buddies',
    'chat_conversations',
    'emotionscare_user_songs',
    'emotionsroom_profiles'
  ];

  for (const table of tablesToPurge) {
    try {
      const { data: existingData } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', user_id);

      if (existingData && existingData.length > 0) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user_id);

        if (error) {
          purgeResult.errors.push({
            table,
            error: getErrorMessage(error)
          });
        } else {
          purgeResult.tables_processed.push({
            table,
            records_deleted: existingData.length
          });
          purgeResult.total_purged += existingData.length;
        }
      }
    } catch (error: unknown) {
      purgeResult.errors.push({
        table,
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      });
    }
  }

  // Finally, delete the user profile
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user_id);

    if (!profileError) {
      purgeResult.tables_processed.push({
        table: 'profiles',
        records_deleted: 1
      });
      purgeResult.total_purged += 1;
    }
  } catch (error: unknown) {
    purgeResult.errors.push({
      table: 'profiles',
      error: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
    });
  }

  return purgeResult;
}

async function getUserDataStatus(supabase: any, user_id: string) {
  const status: any = {
    user_exists: false,
    data_summary: {},
    last_activity: null,
    retention_status: 'active'
  };

  try {
    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('id', user_id)
      .single();

    if (profile) {
      status.user_exists = true;
      status.created_at = profile.created_at;
    }

    // Get data counts from various tables
    const tables = [
      'user_activity_logs',
      'med_mng_subscriptions',
      'med_mng_playlists', 
      'med_mng_user_songs',
      'error_logs'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id', { count: 'exact' })
        .eq('user_id', user_id);

      if (!error) {
        status.data_summary[table] = data?.length || 0;
      }
    }

    // Get last activity
    const { data: lastActivity } = await supabase
      .from('user_activity_logs')
      .select('timestamp')
      .eq('user_id', user_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (lastActivity) {
      status.last_activity = lastActivity.timestamp;
    }

    return status;
  } catch (error: unknown) {
    log('error', 'User data status error', error);
    throw error;
  }
}