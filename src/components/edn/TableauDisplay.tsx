import React, { useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Book, FileText, Flame, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useActivityTracking } from '@/hooks/useActivityTracking'
import { useGamification } from '@/hooks/useGamification'
import { supabase } from '@/integrations/supabase/client'

interface TableauSection {
  title: string
  content: string
  keywords?: string[]
}

interface TableauRang {
  title?: string
  sections?: TableauSection[]
}

interface TableauDisplayProps {
  tableau: TableauRang
  rang: 'A' | 'B'
  isComplete: boolean
  className?: string
}

export function TableauDisplay({ tableau, rang, isComplete, className }: TableauDisplayProps) {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_tableau', rang } });
        addPoints(user.id, 'itemReviewed');
      }
    };
    load();
  }, [loadStats, logActivity, addPoints, rang]);
  if (!tableau || !tableau.sections || tableau.sections.length === 0) {
    return (
      <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-warning/5", className)}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive to-warning opacity-80"></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-destructive/10 to-warning/10 rounded-xl flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Tableau Rang {rang} - Non disponible
              </CardTitle>
              <CardDescription>
                Contenu en cours de développement
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive mb-1">
                  Tableau non disponible
                </p>
                <p className="text-xs text-destructive/80">
                  Le tableau Rang {rang} n'est pas encore disponible pour cet item.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusIcon = isComplete ? (
    <CheckCircle className="h-5 w-5 text-success" />
  ) : (
    <AlertTriangle className="h-5 w-5 text-warning" />
  )

  const statusBadge = isComplete ? (
    <Badge variant="secondary" className="bg-success/10 text-success border-success/20 font-medium px-3 py-1">
      Complet
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 font-medium px-3 py-1">
      En développement
    </Badge>
  )

  return (
    <Card className={cn(
      "transition-all duration-300 border-0 shadow-sm hover:shadow-lg",
      isComplete 
        ? "bg-gradient-to-br from-success/5 to-success/10" 
        : "bg-gradient-to-br from-warning/5 to-warning/10",
      className
    )}>
      {/* Indicateur de progression */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isComplete 
          ? 'bg-gradient-to-r from-success to-success/80' 
          : 'bg-gradient-to-r from-warning to-warning/80'
      } opacity-80`}></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              isComplete 
                ? 'bg-gradient-to-br from-success/10 to-success/20' 
                : 'bg-gradient-to-br from-warning/10 to-warning/20'
            }`}>
              {statusIcon}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                {rang === 'A' ? <Book className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                {tableau.title || `Tableau Rang ${rang}`}
              </CardTitle>
              <CardDescription className="font-medium">
                {tableau.sections.length} section{tableau.sections.length > 1 ? 's' : ''} de connaissances structurées
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats && (
              <>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {stats.currentStreak}j
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Niv. {stats.level}
                </Badge>
              </>
            )}
            {statusBadge}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {tableau.sections.map((section, index) => (
            <div key={index} className="bg-background/60 rounded-xl p-4 border-l-4 border-l-primary/30 hover:border-l-primary/60 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <h4 className="font-bold text-foreground leading-tight">
                  {section.title}
                </h4>
              </div>
              
              <div className="pl-9">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {section.content}
                </p>
                
                {section.keywords && section.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {section.keywords.slice(0, 5).map((keyword, keywordIndex) => (
                      <Badge 
                        key={keywordIndex} 
                        variant="outline" 
                        className="text-xs px-2 py-1 bg-primary/5 border-primary/20 text-primary font-medium"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {section.keywords.length > 5 && (
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                        +{section.keywords.length - 5} autres
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Résumé */}
        <div className={`mt-6 p-4 rounded-xl border ${
          isComplete 
            ? 'border-success/20 bg-success/5' 
            : 'border-warning/20 bg-warning/5'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 font-medium text-muted-foreground">
              <span>📚 {tableau.sections.length} sections détaillées</span>
              <span>🎯 Connaissances rang {rang}</span>
            </div>
            <Badge variant="outline" className="font-medium">
              {isComplete ? 'Complet' : 'En développement'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}