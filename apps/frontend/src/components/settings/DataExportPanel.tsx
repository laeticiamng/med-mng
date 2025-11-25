import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Archive,
  User,
  MessageSquare,
  Heart,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import logger from '@/lib/logger';

type DataExportType = 'personal_data' | 'posts' | 'comments' | 'interactions' | 'full_archive' | 'learning_progress' | 'quiz_history' | 'music_library';
type DataExportFormat = 'csv' | 'json' | 'pdf';
type DataExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface DataExportJob {
  id: string;
  user_id: string;
  export_type: DataExportType;
  format: DataExportFormat;
  status: DataExportStatus;
  progress: number;
  total_items: number;
  processed_items: number;
  file_url?: string;
  file_size?: number;
  error_message?: string;
  requested_at: string;
  completed_at?: string;
  expires_at: string;
}

const exportTypeConfig: Record<DataExportType, { label: string; icon: React.ReactNode; description: string }> = {
  personal_data: {
    label: 'Données personnelles',
    icon: <User className="w-4 h-4" />,
    description: 'Profil, préférences et paramètres',
  },
  posts: {
    label: 'Publications',
    icon: <FileText className="w-4 h-4" />,
    description: 'Tous vos posts et articles',
  },
  comments: {
    label: 'Commentaires',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'Vos commentaires sur les contenus',
  },
  interactions: {
    label: 'Interactions',
    icon: <Heart className="w-4 h-4" />,
    description: 'Likes, favoris et partages',
  },
  learning_progress: {
    label: 'Progression d\'apprentissage',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Historique de progression EDN',
  },
  quiz_history: {
    label: 'Historique des quiz',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    description: 'Résultats de tous vos quiz',
  },
  music_library: {
    label: 'Bibliothèque musicale',
    icon: <Archive className="w-4 h-4" />,
    description: 'Chansons et playlists générées',
  },
  full_archive: {
    label: 'Archive complète',
    icon: <Archive className="w-4 h-4" />,
    description: 'Toutes vos données (RGPD)',
  },
};

const formatConfig: Record<DataExportFormat, { label: string; icon: React.ReactNode; mimeType: string }> = {
  csv: {
    label: 'CSV',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    mimeType: 'text/csv',
  },
  json: {
    label: 'JSON',
    icon: <FileJson className="w-4 h-4" />,
    mimeType: 'application/json',
  },
  pdf: {
    label: 'PDF',
    icon: <FileText className="w-4 h-4" />,
    mimeType: 'application/pdf',
  },
};

const statusConfig: Record<DataExportStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="w-4 h-4" />,
  },
  processing: {
    label: 'En cours',
    color: 'bg-blue-100 text-blue-800',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
  },
  completed: {
    label: 'Terminé',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  failed: {
    label: 'Échoué',
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="w-4 h-4" />,
  },
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const useExportJobs = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['export-jobs', userId],
    queryFn: async (): Promise<DataExportJob[]> => {
      if (!userId) return [];

      const { data, error } = await (supabase as any)
        .from('export_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('Error fetching export jobs:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
    refetchInterval: (query) => {
      // Refetch every 5 seconds if there are pending/processing jobs
      const jobs = query.state.data;
      const hasActiveJobs = jobs?.some(
        (job: DataExportJob) => job.status === 'pending' || job.status === 'processing'
      );
      return hasActiveJobs ? 5000 : false;
    },
  });
};

const useCreateExportJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ exportType, format }: { exportType: DataExportType; format: DataExportFormat }) => {
      const { data, error } = await (supabase as any).rpc('create_export_job', {
        export_type_param: exportType,
        format_param: format,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs', user?.id] });
      toast.success('Export demandé', {
        description: 'Votre export est en cours de préparation',
      });
    },
    onError: (error) => {
      logger.error('Error creating export job:', error);
      toast.error('Erreur', {
        description: 'Impossible de créer l\'export',
      });
    },
  });
};

const useDeleteExportJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await (supabase as any)
        .from('export_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs', user?.id] });
      toast.success('Export supprimé');
    },
    onError: (error) => {
      logger.error('Error deleting export job:', error);
      toast.error('Erreur lors de la suppression');
    },
  });
};

export const DataExportPanel: React.FC = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<DataExportType>('personal_data');
  const [selectedFormat, setSelectedFormat] = useState<DataExportFormat>('json');

  const { data: jobs, isLoading } = useExportJobs(user?.id);
  const createExportMutation = useCreateExportJob();
  const deleteExportMutation = useDeleteExportJob();

  const handleCreateExport = () => {
    createExportMutation.mutate({
      exportType: selectedType,
      format: selectedFormat,
    });
  };

  const handleDownload = (job: DataExportJob) => {
    if (job.file_url) {
      window.open(job.file_url, '_blank');
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Connectez-vous pour exporter vos données
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter vos données
          </CardTitle>
          <CardDescription>
            Téléchargez une copie de vos données conformément au RGPD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de données</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as DataExportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(exportTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {exportTypeConfig[selectedType].description}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as DataExportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(formatConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleCreateExport}
            disabled={createExportMutation.isPending}
            className="w-full md:w-auto"
          >
            {createExportMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Demander l'export
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Historique des exports
          </CardTitle>
          <CardDescription>
            Vos exports récents (disponibles pendant 7 jours)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted">
                      {exportTypeConfig[job.export_type]?.icon || <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">
                          {exportTypeConfig[job.export_type]?.label || job.export_type}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {formatConfig[job.format]?.label || job.format}
                        </Badge>
                        <Badge className={cn('text-xs', statusConfig[job.status].color)}>
                          <span className="mr-1">{statusConfig[job.status].icon}</span>
                          {statusConfig[job.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(job.requested_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                        {job.file_size && (
                          <span>{formatFileSize(job.file_size)}</span>
                        )}
                      </div>
                      {(job.status === 'pending' || job.status === 'processing') && (
                        <Progress value={job.progress} className="h-1 mt-2" />
                      )}
                      {job.error_message && (
                        <p className="text-xs text-destructive mt-1">{job.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {job.status === 'completed' && job.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(job)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Télécharger
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteExportMutation.mutate(job.id)}
                      disabled={deleteExportMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Aucun export pour le moment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportPanel;
