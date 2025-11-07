import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  createdAt: string;
  closedAt?: string;
  merged: boolean;
  statusCheckRollup?: {
    state: string;
    contexts: Array<{
      context: string;
      state: string;
      description: string;
    }>;
  };
}

interface BlockedPRsListProps {
  blockedPRs: PullRequest[];
}

export const BlockedPRsList: React.FC<BlockedPRsListProps> = ({ blockedPRs }) => {
  const getFailedAccessibilityChecks = (pr: PullRequest) => {
    if (!pr.statusCheckRollup?.contexts) return [];
    
    return pr.statusCheckRollup.contexts.filter(context => {
      const name = context.context;
      const isAccessibilityCheck = name?.includes('accessibilit') || 
                                   name?.includes('axe') || 
                                   name?.includes('Lighthouse');
      const hasFailed = context.state === 'FAILURE' || context.state === 'ERROR';
      return isAccessibilityCheck && hasFailed;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          PRs Bloquées
          <Badge variant="destructive">{blockedPRs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {blockedPRs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">✅ Aucune PR bloquée</p>
            <p className="text-sm mt-2">Tous les tests d'accessibilité sont au vert!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedPRs.map((pr) => {
              const failedChecks = getFailedAccessibilityChecks(pr);
              const timeAgo = formatDistanceToNow(new Date(pr.createdAt), { 
                addSuffix: true, 
                locale: fr 
              });

              return (
                <div 
                  key={pr.id}
                  className="p-4 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-foreground">
                          #{pr.number}
                        </span>
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {pr.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{pr.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{timeAgo}</span>
                        </div>
                      </div>

                      {/* Tests échoués */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-red-700">
                          Tests d'accessibilité échoués:
                        </p>
                        {failedChecks.map((check, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-2 text-xs p-2 rounded bg-background/50"
                          >
                            <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{check.context}</p>
                              {check.description && (
                                <p className="text-muted-foreground mt-0.5">{check.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        window.open(
                          `https://github.com/med-mng/med-mng/pull/${pr.number}`,
                          '_blank'
                        );
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
