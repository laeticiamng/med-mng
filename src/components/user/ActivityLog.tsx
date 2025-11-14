import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Heart,
  Music,
  Download,
  Edit3,
  Eye,
  Trash2,
  Share2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Activity record
 */
interface ActivityRecord {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceTitle?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Props for ActivityLog component
 */
interface ActivityLogProps {
  /**
   * User ID (optional, uses current user if not provided)
   */
  userId?: string;

  /**
   * Filter by resource type
   */
  resourceType?: string;

  /**
   * Filter by action
   */
  action?: string;

  /**
   * Limit number of records to show
   */
  limit?: number;

  /**
   * Show pagination
   */
  showPagination?: boolean;
}

/**
 * ActivityLog Component
 *
 * Displays user activity history including:
 * - View history (pages visited, items viewed)
 * - Edit history (changes made)
 * - Action history (likes, downloads, shares)
 * - Filtering by type and action
 * - Pagination support
 *
 * @example
 * <ActivityLog limit={20} showPagination />
 *
 * @example
 * <ActivityLog
 *   resourceType="edn"
 *   action="view"
 *   limit={10}
 * />
 */
export const ActivityLog: React.FC<ActivityLogProps> = ({
  userId,
  resourceType: filterResourceType,
  action: filterAction,
  limit = 30,
  showPagination = true,
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>(filterResourceType || 'all');
  const [actionFilter, setActionFilter] = useState<string>(filterAction || 'all');
  const [page, setPage] = useState(0);

  const currentUserId = userId || user?.id;

  /**
   * Load activities from database
   */
  const loadActivities = async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (resourceTypeFilter !== 'all') {
        query = query.eq('resource_type', resourceTypeFilter);
      }
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      // Apply pagination
      query = query.range(page * limit, (page + 1) * limit - 1);

      const { data, error: dbError } = await query;

      if (dbError) {
        throw dbError;
      }

      setActivities(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load activities';
      setError(message);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load activities on mount and when filters change
   */
  useEffect(() => {
    setPage(0);
    loadActivities();
  }, [currentUserId, resourceTypeFilter, actionFilter]);

  /**
   * Get icon for action
   */
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
      case 'viewed':
        return <Eye className="h-4 w-4" />;
      case 'like':
      case 'liked':
        return <Heart className="h-4 w-4" />;
      case 'download':
      case 'downloaded':
        return <Download className="h-4 w-4" />;
      case 'create':
      case 'created':
        return <Edit3 className="h-4 w-4" />;
      case 'edit':
      case 'updated':
        return <Edit3 className="h-4 w-4" />;
      case 'delete':
      case 'deleted':
        return <Trash2 className="h-4 w-4" />;
      case 'share':
      case 'shared':
        return <Share2 className="h-4 w-4" />;
      case 'listen':
      case 'listened':
        return <Music className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  /**
   * Get badge color for action
   */
  const getActionBadgeColor = (action: string) => {
    if (action.includes('view')) return 'bg-blue-100 text-blue-800';
    if (action.includes('like')) return 'bg-red-100 text-red-800';
    if (action.includes('download')) return 'bg-green-100 text-green-800';
    if (action.includes('edit') || action.includes('create')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('share')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  /**
   * Format action text
   */
  const formatAction = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Log
        </CardTitle>
        <CardDescription>
          View your recent activities and interactions on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="edn">EDN Items</SelectItem>
              <SelectItem value="ecos">ECOS Scenarios</SelectItem>
              <SelectItem value="song">Songs</SelectItem>
              <SelectItem value="product">Products</SelectItem>
              <SelectItem value="page">Pages</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="view">Viewed</SelectItem>
              <SelectItem value="like">Liked</SelectItem>
              <SelectItem value="download">Downloaded</SelectItem>
              <SelectItem value="create">Created</SelectItem>
              <SelectItem value="edit">Edited</SelectItem>
              <SelectItem value="delete">Deleted</SelectItem>
              <SelectItem value="share">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {resourceTypeFilter === 'all' && actionFilter === 'all'
                ? 'No activity yet. Start exploring the platform!'
                : 'No activities match the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className="text-muted-foreground pt-1 flex-shrink-0">
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={getActionBadgeColor(activity.action)}>
                        {formatAction(activity.action)}
                      </Badge>
                      <span className="text-sm font-medium">{activity.resourceTitle || activity.resourceType}</span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {activity.resourceType && (
                        <span>{activity.resourceType.charAt(0).toUpperCase() + activity.resourceType.slice(1)} • </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>

                    {/* Metadata */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {showPagination && activities.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || isLoading}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">Page {page + 1}</span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={activities.length < limit || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
