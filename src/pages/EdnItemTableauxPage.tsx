import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TableauxNavigator } from "@/components/edn/TableauxNavigator"
import { ednTableauxService } from "@/services/ednTableauxService"
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { ROUTE_PATHS } from '@/config/routes'

interface ItemTableauxData {
  item_id: string
  item_code: string
  title: string
  tableau_rang_a: any
  tableau_rang_b: any
  completeness: {
    rang_a_complete: boolean
    rang_b_complete: boolean
    overall_complete: boolean
    completeness_score: number
  }
}

export function EdnItemTableauxPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const [itemData, setItemData] = useState<ItemTableauxData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItemTableaux = async () => {
    if (!itemId) {
      setError('ID d\'item manquant')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const data = await ednTableauxService.getBothTableaux(itemId)
      setItemData(data)
      
      // Toast selon le niveau de complétude
      if (data.completeness.overall_complete) {
        toast.success('Item complet', {
          description: 'Tous les tableaux sont correctement renseignés'
        })
      } else {
        toast.warning('Item incomplet', {
          description: `Complétude: ${data.completeness.completeness_score}%`
        })
      }
      
    } catch (err) {
      console.error('❌ Error fetching item tableaux:', err)
      setError('Impossible de charger les tableaux de l\'item')
      toast.error('Erreur de chargement', {
        description: 'Impossible de récupérer les données de l\'item'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItemTableaux()
  }, [itemId])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !itemData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTE_PATHS.ednLegacy}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Erreur de chargement</h1>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Une erreur inattendue s\'est produite'}
          </AlertDescription>
        </Alert>

        <div className="mt-4">
          <Button onClick={fetchItemTableaux} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTE_PATHS.ednLegacy}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux items
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Tableaux de Connaissances
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          onClick={fetchItemTableaux} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Main content */}
      <TableauxNavigator
        itemCode={itemData.item_code}
        itemTitle={itemData.title}
        tableauRangA={itemData.tableau_rang_a}
        tableauRangB={itemData.tableau_rang_b}
        completeness={itemData.completeness}
      />

      {/* Informations additionnelles */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Informations sur l'item</CardTitle>
          <CardDescription>
            Détails techniques et méta-données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">ID Item:</span>
              <span className="ml-2 text-muted-foreground">{itemData.item_id}</span>
            </div>
            <div>
              <span className="font-medium">Code Item:</span>
              <span className="ml-2 text-muted-foreground">{itemData.item_code}</span>
            </div>
            <div>
              <span className="font-medium">Score de complétude:</span>
              <span className="ml-2 font-mono">{itemData.completeness.completeness_score}%</span>
            </div>
            <div>
              <span className="font-medium">État global:</span>
              <span className={`ml-2 ${itemData.completeness.overall_complete ? 'text-success' : 'text-warning'}`}>
                {itemData.completeness.overall_complete ? 'Complet' : 'Incomplet'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}