import React, { useState, useEffect } from 'react'
import { errorService } from '@/services/core/ErrorService';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Download, Eye } from "lucide-react"
import { ednTableauxService, CompletenessAuditResult, ItemCompleteness } from "@/services/ednTableauxService"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function CompletenessAuditDashboard() {
  const [auditResult, setAuditResult] = useState<CompletenessAuditResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null)

  const runAudit = async () => {
    setIsLoading(true)
    try {
      const result = await ednTableauxService.runCompletenessAudit()
      setAuditResult(result)
      setLastAuditTime(new Date().toLocaleString('fr-FR'))
      
      if (result.summary.incomplete_items > 0) {
        toast.warning(
          `Audit terminé: ${result.summary.incomplete_items} items à améliorer`,
          { description: `Taux de complétude: ${result.summary.completion_rate}%` }
        )
      } else {
        toast.success(
          "Audit terminé: Tous les items sont complets !",
          { description: `${result.summary.total_items} items vérifiés` }
        )
      }
    } catch (error) {
      errorService.handleError(error as Error, 'system', true);
      toast.error('Erreur lors de l\'audit', {
        description: 'Impossible d\'exécuter la vérification de complétude'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-run on mount
  useEffect(() => {
    runAudit()
  }, [])

  const getCriticalityBadge = (item: ItemCompleteness) => {
    const level = ednTableauxService.getCriticalityLevel(item.completeness_score)
    
    switch (level) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Complet</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">À améliorer</Badge>
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>
    }
  }

  const exportResults = () => {
    if (!auditResult) return
    
    const dataStr = JSON.stringify(auditResult, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `completeness-audit-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Résultats exportés', {
      description: 'Le fichier a été téléchargé avec succès'
    })
  }

  if (!auditResult && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit de Complétude</CardTitle>
          <CardDescription>
            Vérifiez l'état de complétude de tous les items EDN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAudit} className="w-full">
            Lancer l'audit
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit de Complétude EDN</h2>
          {lastAuditTime && (
            <p className="text-sm text-muted-foreground">
              Dernière vérification: {lastAuditTime}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportResults}
            disabled={!auditResult}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button
            onClick={runAudit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            {isLoading ? 'Vérification...' : 'Relancer'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {auditResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Total Items</p>
                    <p className="text-2xl font-bold">{auditResult.summary.total_items}</p>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Items Complets</p>
                    <p className="text-2xl font-bold text-green-600">{auditResult.summary.complete_items}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">À Améliorer</p>
                    <p className="text-2xl font-bold text-orange-500">{auditResult.summary.incomplete_items}</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Taux Global</p>
                    <p className="text-2xl font-bold">{auditResult.summary.completion_rate}%</p>
                  </div>
                  <div className="w-8">
                    <Progress 
                      value={auditResult.summary.completion_rate} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes pour les issues critiques */}
          {auditResult.critical_issues.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{auditResult.critical_issues.length} items critiques</strong> nécessitent une attention immédiate 
                (complétude &lt; 50%)
              </AlertDescription>
            </Alert>
          )}

          {/* Liste des items incomplets */}
          {auditResult.incomplete_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Items à Améliorer ({auditResult.incomplete_items.length})
                </CardTitle>
                <CardDescription>
                  Items avec un taux de complétude inférieur à 80%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditResult.incomplete_items.map((item, index) => (
                    <div key={item.item_id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.item_code}</span>
                          {getCriticalityBadge(item)}
                          <span className="text-sm font-medium">{item.completeness_score}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.title}
                        </p>
                        {item.issues.length > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            {ednTableauxService.formatIssues(item.issues)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Progress value={item.completeness_score} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* État parfait */}
          {auditResult.incomplete_items.length === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Parfait ! Tous les items sont complets
                  </h3>
                  <p className="text-green-700">
                    {auditResult.summary.total_items} items vérifiés avec succès
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Vérification en cours...</p>
              <p className="text-sm text-muted-foreground">
                Analyse de la complétude de tous les items EDN
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}