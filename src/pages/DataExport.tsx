import { useState } from 'react'
import { Download, FileJson, FileText, Loader, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useFetchExportJobs,
  useCreateExportJob,
  useDeleteExpiredExports,
} from '@/hooks/useDataExport'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { toast } from 'sonner'

export default function DataExportPage() {
  const { user } = useAuth()
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('json')
  const [selectedType, setSelectedType] = useState<'personal_data' | 'posts' | 'comments' | 'interactions' | 'full_archive'>('full_archive')

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Veuillez vous connecter pour exporter vos données.
            </p>
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Queries and mutations
  const { data: jobs = [], isLoading } = useFetchExportJobs(user.id)
  const createExportMutation = useCreateExportJob(user.id)
  const deleteExpiredMutation = useDeleteExpiredExports(user.id)

  const handleCreateExport = () => {
    createExportMutation.mutate(
      { exportType: selectedType, format: selectedFormat },
      {
        onSuccess: () => {
          toast.success('Export job created! Processing your data...')
          setSelectedFormat('json')
          setSelectedType('full_archive')
        },
        onError: () => {
          toast.error('Failed to create export job')
        },
      }
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Complété</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-blue-600">En cours</Badge>
      case 'pending':
        return <Badge variant="default" className="bg-yellow-600">En attente</Badge>
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'personal_data':
        return 'Données personnelles'
      case 'posts':
        return 'Posts'
      case 'comments':
        return 'Commentaires'
      case 'interactions':
        return 'Interactions'
      case 'full_archive':
        return 'Archive complète'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Exporter mes données</h1>
          <p className="text-muted-foreground mt-2">
            Téléchargez vos données dans le format de votre choix
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Les fichiers d'export expirent après 30 jours. Les données sont compressées et sécurisées.
          </AlertDescription>
        </Alert>

        {/* Export Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Créer un nouvel export</CardTitle>
            <CardDescription>Configurez le type de données et le format d'export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium block mb-3">Type de données à exporter</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'personal_data', label: 'Données personnelles' },
                  { value: 'posts', label: 'Posts' },
                  { value: 'comments', label: 'Commentaires' },
                  { value: 'interactions', label: 'Interactions' },
                  { value: 'full_archive', label: 'Archive complète' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedType(option.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === option.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="text-sm font-medium block mb-3">Format d'export</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'json', label: 'JSON' },
                  { value: 'csv', label: 'CSV' },
                  { value: 'pdf', label: 'PDF' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFormat(option.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedFormat === option.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateExport}
              disabled={createExportMutation.isPending}
              className="w-full"
              size="lg"
              data-testid="create-export-button"
            >
              {createExportMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Créer l'export
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historique des exports</CardTitle>
                <CardDescription>Vos exports précédents et en cours</CardDescription>
              </div>
              {jobs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteExpiredMutation.mutate()}
                  disabled={deleteExpiredMutation.isPending}
                  data-testid="cleanup-expired-button"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Nettoyer
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Download className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
                <p className="text-muted-foreground">Aucun export pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                    data-testid={`export-job-${job.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {job.status === 'completed' && (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        )}
                        {job.status === 'processing' && (
                          <Loader className="h-6 w-6 text-blue-600 animate-spin" />
                        )}
                        {job.status === 'pending' && (
                          <Loader className="h-6 w-6 text-yellow-600" />
                        )}
                        {job.status === 'failed' && (
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium">
                            {getTypeLabel(job.export_type)} ({job.format.toUpperCase()})
                          </p>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(job.requested_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                          {job.status === 'processing' && (
                            <span>{job.progress}% complété</span>
                          )}
                          {job.file_size && (
                            <span>{(job.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          )}
                          {job.error_message && (
                            <span className="text-red-600">{job.error_message}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    {job.status === 'completed' && job.file_url && (
                      <a
                        href={job.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4"
                          data-testid={`download-export-${job.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Vos données sont chiffrées et accessibles uniquement par vous
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formats supportés</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              JSON, CSV et PDF pour faciliter l'import dans d'autres services
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Expiration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Les fichiers expirent après 30 jours pour des raisons de sécurité
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
