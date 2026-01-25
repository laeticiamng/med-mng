import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCVSSAssessments } from '@/hooks/useCVSSAssessments';
import { useUserRoles } from '@/hooks/useUserRoles';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Calendar, Check, Shield, Trash2 } from 'lucide-react';

export const CVSSList = () => {
  const { assessments, criticalVulns, unpatchedVulns, overdueVulns, updateAssessment, deleteAssessment, isUpdating, isDeleting } = useCVSSAssessments();
  const { isAdmin } = useUserRoles();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'High':
        return <Badge className="bg-warning text-warning-foreground">Élevée</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Moyenne</Badge>;
      case 'Low':
        return <Badge variant="outline">Faible</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getPriorityBadge = (priority: number) => {
    const labels = ['', 'P1 - Urgent', 'P2 - High', 'P3 - Medium', 'P4 - Low', 'P5 - Info'];
    const variants: any[] = ['', 'destructive', 'default', 'secondary', 'outline', 'outline'];
    return <Badge variant={variants[priority]}>{labels[priority]}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vulnérabilités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{criticalVulns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non Patchées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{unpatchedVulns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{overdueVulns.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerabilities List */}
      <Card>
        <CardHeader>
          <CardTitle>Évaluations CVSS</CardTitle>
          <CardDescription>
            {assessments.length} vulnérabilité{assessments.length > 1 ? 's' : ''} évaluée{assessments.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const isOverdue = assessment.patch_deadline && new Date(assessment.patch_deadline) < new Date() && !assessment.patched;
              
              return (
                <Card key={assessment.id} className={`border-l-4 ${
                  assessment.base_severity === 'Critical' ? 'border-l-destructive' :
                  assessment.base_severity === 'High' ? 'border-l-warning' :
                  'border-l-border'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">{assessment.vulnerability_name}</CardTitle>
                          {assessment.cve_id && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {assessment.cve_id}
                            </Badge>
                          )}
                        </div>
                        {assessment.description && (
                          <CardDescription>{assessment.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {getSeverityBadge(assessment.base_severity)}
                        {assessment.patch_priority && getPriorityBadge(assessment.patch_priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Score CVSS</div>
                        <div className="font-bold text-lg">{assessment.base_score}</div>
                      </div>
                      {assessment.temporal_score && (
                        <div>
                          <div className="text-muted-foreground text-xs">Score Temporel</div>
                          <div className="font-bold text-lg">{assessment.temporal_score}</div>
                        </div>
                      )}
                      {assessment.patch_deadline && (
                        <div>
                          <div className="text-muted-foreground text-xs">Deadline</div>
                          <div className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(assessment.patch_deadline).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-muted-foreground text-xs">Statut</div>
                        <Badge variant={assessment.patched ? 'default' : 'secondary'} className="mt-1">
                          {assessment.patched ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Patché
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Non Patché
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    {isOverdue && !assessment.patched && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          Deadline dépassée - Action urgente requise
                        </div>
                      </div>
                    )}

                    {assessment.notes && (
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <div className="font-medium mb-1">Notes:</div>
                        <p className="text-muted-foreground">{assessment.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Évalué {formatDistanceToNow(new Date(assessment.assessed_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                      <span>•</span>
                      <code className="bg-muted px-2 py-0.5 rounded">{assessment.vector_string}</code>
                    </div>

                    {!assessment.patched && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAssessment({ id: assessment.id, patched: true })}
                          disabled={isUpdating}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Marquer comme Patché
                        </Button>
                        
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAssessment(assessment.id)}
                            disabled={isDeleting}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {assessments.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune vulnérabilité évaluée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
