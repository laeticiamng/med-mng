import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TableauDisplay } from './TableauDisplay'
import { CheckCircle, AlertTriangle, Book, FileText, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [activeTab, setActiveTab] = useState<'rang-a' | 'rang-b'>('rang-a')

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-orange-500'
    return 'text-red-500'
  }

  const getCompletenessText = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 50) return 'À améliorer'
    return 'Critique'
  }

  const switchToRangB = () => setActiveTab('rang-b')
  const switchToRangA = () => setActiveTab('rang-a')

  return (
    <div className="space-y-6">
      {/* Header avec score de complétude */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">
              {itemCode} - Tableaux de connaissances
            </h2>
            <p className="text-blue-700 text-sm mt-1">{itemTitle}</p>
          </div>
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
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="rang-b"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Rang B
              {completeness.rang_b_complete ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
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
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Book className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {(tableauRangA?.sections?.length || 0) + (tableauRangB?.sections?.length || 0)}
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">Sections de connaissances</div>
          <div className="text-xs text-muted-foreground mt-1">Rang A + Rang B</div>
        </div>
        
        <div className="bg-gradient-to-br from-background to-muted/30 border-0 shadow-sm rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              completeness.overall_complete ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              {completeness.overall_complete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div className={`text-2xl font-bold ${
              completeness.overall_complete ? 'text-green-600' : 'text-orange-600'
            }`}>
              {completeness.completeness_score}%
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">Taux de complétude</div>
          <Badge 
            variant="outline"
            className={`text-xs mt-2 ${
              completeness.overall_complete 
                ? 'border-green-200 text-green-700 bg-green-50' 
                : 'border-orange-200 text-orange-700 bg-orange-50'
            }`}
          >
            {completeness.overall_complete ? "Complet" : "En développement"}
          </Badge>
        </div>
      </div>
    </div>
  )
}