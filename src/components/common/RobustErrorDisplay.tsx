import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import {
    AlertTriangle,
    Bug,
    ChevronDown,
    ChevronUp,
    Clock,
    Copy,
    Database,
    ExternalLink,
    RefreshCw,
    Send,
    Server,
    Wifi
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RobustErrorDisplayProps {
  error: string | Error;
  type?: 'extraction' | 'auth' | 'network' | 'quota' | 'data' | 'admin' | 'system';
  title?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  onReport?: (details: string) => void;
  context?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function RobustErrorDisplay({
  error,
  type = 'system',
  title,
  showDetails = false,
  onRetry,
  onReport,
  context,
  severity = 'medium'
}: RobustErrorDisplayProps) {
  const [expanded, setExpanded] = useState(showDetails);
  const [reportDetails, setReportDetails] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { logActivity } = useActivityTracking();

  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Track error display
  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'error_displayed', errorType: type, severity }
    });
  }, [type, severity, logActivity]);

  const getErrorIcon = () => {
    switch (type) {
      case 'network': return <Wifi className="h-5 w-5" />;
      case 'data': return <Database className="h-5 w-5" />;
      case 'quota': return <Clock className="h-5 w-5" />;
      case 'admin':
      case 'system': return <Server className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getErrorColor = () => {
    switch (severity) {
      case 'critical': return 'border-destructive bg-destructive/5 text-destructive';
      case 'high': return 'border-destructive/70 bg-destructive/5 text-destructive';
      case 'medium': return 'border-warning bg-warning/5 text-warning-foreground';
      case 'low': return 'border-primary bg-primary/5 text-primary';
      default: return 'border-border bg-muted text-muted-foreground';
    }
  };

  const getErrorTypeLabel = () => {
    switch (type) {
      case 'extraction': return 'Erreur d\'extraction';
      case 'auth': return 'Erreur d\'authentification';
      case 'network': return 'Erreur réseau';
      case 'quota': return 'Quota dépassé';
      case 'data': return 'Erreur de données';
      case 'admin': return 'Erreur administration';
      case 'system': return 'Erreur système';
      default: return 'Erreur';
    }
  };

  const getSuggestions = () => {
    switch (type) {
      case 'network':
        return [
          'Vérifiez votre connexion internet',
          'Actualisez la page',
          'Essayez de nouveau dans quelques minutes'
        ];
      case 'quota':
        return [
          'Votre quota mensuel est épuisé',
          'Contactez l\'équipe pour augmenter votre quota',
          'Attendez le renouvellement automatique'
        ];
      case 'extraction':
        return [
          'Vérifiez les données source',
          'Redémarrez l\'extraction',
          'Contactez le support si le problème persiste'
        ];
      case 'auth':
        return [
          'Reconnectez-vous à votre compte',
          'Vérifiez vos identifiants',
          'Videz le cache de votre navigateur'
        ];
      case 'data':
        return [
          'Les données peuvent être corrompues',
          'Vérifiez l\'intégrité des données',
          'Contactez l\'équipe technique'
        ];
      default:
        return [
          'Actualisez la page',
          'Vérifiez votre connexion',
          'Contactez le support si nécessaire'
        ];
    }
  };

  const copyErrorDetails = () => {
    const details = [
      `Type: ${type}`,
      `Erreur: ${errorMessage}`,
      `Timestamp: ${new Date().toISOString()}`,
      ...(context ? [`Contexte: ${JSON.stringify(context, null, 2)}`] : []),
      ...(errorStack ? [`Stack: ${errorStack}`] : [])
    ].join('\n');

    navigator.clipboard.writeText(details);
    toast.success('Détails copiés dans le presse-papiers');
  };

  const submitReport = async () => {
    if (!onReport) return;
    
    setSubmitting(true);
    try {
      const fullReport = [
        `Rapport d'erreur`,
        `Type: ${type}`,
        `Sévérité: ${severity}`,
        `Message: ${errorMessage}`,
        `Timestamp: ${new Date().toISOString()}`,
        ...(context ? [`Contexte: ${JSON.stringify(context, null, 2)}`] : []),
        `Détails utilisateur: ${reportDetails}`,
        ...(errorStack ? [`Stack trace: ${errorStack}`] : [])
      ].join('\n');

      await onReport(fullReport);
      toast.success('Rapport envoyé avec succès');
      setShowReportForm(false);
      setReportDetails('');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi du rapport');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={`border-l-4 ${getErrorColor()}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getErrorIcon()}
            <div>
              <CardTitle className="text-lg">
                {title || getErrorTypeLabel()}
              </CardTitle>
              <p className="text-sm font-medium mt-1">
                {errorMessage}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={
              severity === 'critical' ? 'destructive' :
              severity === 'high' ? 'destructive' :
              severity === 'medium' ? 'default' : 'secondary'
            }>
              {severity}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copyErrorDetails}>
            <Copy className="h-4 w-4 mr-2" />
            Copier détails
          </Button>
          {onReport && (
            <Button variant="outline" size="sm" onClick={() => setShowReportForm(!showReportForm)}>
              <Bug className="h-4 w-4 mr-2" />
              Signaler
            </Button>
          )}
        </div>

        {/* Suggestions */}
        <div className="bg-background/50 p-3 rounded border">
          <h4 className="font-medium text-sm mb-2">Suggestions :</h4>
          <ul className="text-sm space-y-1">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-muted-foreground mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-3">
            {/* Context */}
            {context && (
              <div>
                <h4 className="font-medium text-sm mb-2">Contexte :</h4>
                <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                  {JSON.stringify(context, null, 2)}
                </pre>
              </div>
            )}

            {/* Stack Trace */}
            {errorStack && (
              <div>
                <h4 className="font-medium text-sm mb-2">Stack Trace :</h4>
                <pre className="text-xs bg-background p-2 rounded border overflow-x-auto max-h-32">
                  {errorStack}
                </pre>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground">
              Erreur survenue le {new Date().toLocaleString()}
            </div>
          </div>
        )}

        {/* Report Form */}
        {showReportForm && onReport && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Signaler cette erreur :</h4>
            <Textarea
              placeholder="Décrivez les circonstances de l'erreur, les actions effectuées avant qu'elle ne survienne..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReportForm(false)}
              >
                Annuler
              </Button>
              <Button 
                size="sm" 
                onClick={submitReport}
                disabled={submitting || !reportDetails.trim()}
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer
              </Button>
            </div>
          </div>
        )}

        {/* Help Link */}
        <div className="text-xs text-muted-foreground">
          Besoin d'aide ? 
          <Button variant="link" size="sm" className="p-0 h-auto ml-1 text-xs">
            <ExternalLink className="h-3 w-3 mr-1" />
            Documentation technique
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}