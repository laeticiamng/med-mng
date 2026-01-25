import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast'
import { useActivityTracking } from '@/hooks/useActivityTracking'
import { useGamification } from '@/hooks/useGamification'
import { supabase } from '@/integrations/supabase/client'
import { cn } from "@/lib/utils"
import { AlertTriangle, ArrowLeft, ArrowRight, Book, CheckCircle, FileText, Flame, Star } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from 'react'
import { TableauDisplay } from './TableauDisplay'

interface TableauSection {
  title: string
  content: string
  keywords?: string[]
}

interface TableauRang {
  title?: string
  sections?: TableauSection[]
}

interface TableauxNavigatorProps {
  itemCode: string
  itemTitle: string
  tableauRangA: TableauRang
  tableauRangB: TableauRang
  completeness: {
    rang_a_complete: boolean
    rang_b_complete: boolean
    overall_complete: boolean
    completeness_score: number
  }
}

export function TableauxNavigator({ 
  itemCode, 
  itemTitle, 
  tableauRangA, 
  tableauRangB, 
  completeness 
}: TableauxNavigatorProps) {
  const { logActivity } = useActivityTracking()
  const { _stats, loadStats, _addPoints } = useGamification()
  const { toast } = useToast()
  const hasTrackedRef = useRef(false)
  const [activeTab, setActiveTab] = useState<'rang-a' | 'rang-b'>('rang-a')
  const [_userProgress, setUserProgress] = useState({ rangA: 0, rangB: 0 })

  // Load user progress
  const loadUserProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { _data } = await supabase
      .from('user_competence_progress')
      .select('rang')
      .eq('user_id', user.id)
      .eq('item_code', itemCode)
      .eq('mastered', true)

    if (_data) {
      const rangACount = _data.filter(d => d.rang === 'A').length
      const rangBCount = _data.filter(d => d.rang === 'B').length
      setUserProgress({ rangA: rangACount, rangB: rangBCount })
    }
  }, [itemCode])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        loadStats(user.id)
        loadUserProgress()
      }
    }
    load()
  }, [loadStats, loadUserProgress])

  useEffect(() => {
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'tableaux_navigator', action: 'view', itemCode }
      })
    }
  }, [itemCode, logActivity])

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-destructive'
  }

  const getCompletenessText = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 50) return 'À améliorer'
    return 'Critique'
  }

  const switchToRangB = async () => {
    setActiveTab('rang-b')
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'tableaux_navigator', action: 'switch_to_rang_b', itemCode }
    })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await _addPoints(user.id, 'itemReviewed')
    }
  }
  
  const switchToRangA = () => {
    setActiveTab('rang-a')
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'tableaux_navigator', action: 'switch_to_rang_a', itemCode }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header avec score de complétude et gamification */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary">
              {itemCode} - Tableaux de connaissances
            </h2>
            <p className="text-primary/70 text-sm mt-1">{itemTitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {_stats && (
              <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-sm font-bold text-warning">{_stats?.currentStreak ?? 0}j</span>
                <Star className="h-4 w-4 text-primary ml-1" />
                <span className="text-sm font-bold text-primary">Nv.{_stats?.level ?? 1}</span>
              </div>
            )}
            <div className="text-right">
              <div className={cn(
                "text-2xl font-bold",
                getCompletenessColor(completeness.completeness_score)
              )}>
                {completeness.completeness_score}%
              </div>
              <div className="text-sm text-foreground/60">
                {getCompletenessText(completeness.completeness_score)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Alerte globale si incomplet */}
        {!completeness.overall_complete && (
          <Alert className="mt-3" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cet item nécessite des améliorations. 
              {!completeness.rang_a_complete && " Tableau Rang A incomplet."}
              {!completeness.rang_b_complete && " Tableau Rang B incomplet."}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'rang-a' | 'rang-b')}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-auto grid-cols-2">
            <TabsTrigger 
              value="rang-a" 
              className="flex items-center gap-2"
            >
              <Book className="h-4 w-4" />
              Rang A
              {completeness.rang_a_complete ? (
                <CheckCircle className="h-3 w-3 text-success" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-warning" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="rang-b"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Rang B
              {completeness.rang_b_complete ? (
                <CheckCircle className="h-3 w-3 text-success" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-warning" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Navigation rapide */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={switchToRangA}
              disabled={activeTab === 'rang-a'}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Rang A
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={switchToRangB}
              disabled={activeTab === 'rang-b'}
              className="flex items-center gap-1"
            >
              Rang B
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <TabsContent value="rang-a" className="mt-6">
          <TableauDisplay
            tableau={tableauRangA}
            rang="A"
            isComplete={completeness.rang_a_complete}
          />
        </TabsContent>

        <TabsContent value="rang-b" className="mt-6">
          <TableauDisplay
            tableau={tableauRangB}
            rang="B"
            isComplete={completeness.rang_b_complete}
          />
        </TabsContent>
      </Tabs>

      {/* Statistiques améliorées */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-gradient-to-br from-background to-muted/30 border-0 shadow-sm rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {(tableauRangA?.sections?.length || 0) + (tableauRangB?.sections?.length || 0)}
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">Sections de connaissances</div>
          <div className="text-xs text-muted-foreground mt-1">Rang A + Rang B</div>
        </div>
        
        <div className="bg-gradient-to-br from-background to-muted/30 border-0 shadow-sm rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              completeness.overall_complete ? 'bg-success/10' : 'bg-warning/10'
            }`}>
              {completeness.overall_complete ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className={`text-2xl font-bold ${
              completeness.overall_complete ? 'text-success' : 'text-warning'
            }`}>
              {completeness.completeness_score}%
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">Taux de complétude</div>
          <Badge 
            variant="outline"
            className={`text-xs mt-2 ${
              completeness.overall_complete 
                ? 'border-success/20 text-success bg-success/10' 
                : 'border-warning/20 text-warning bg-warning/10'
            }`}
          >
            {completeness.overall_complete ? "Complet" : "En développement"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
