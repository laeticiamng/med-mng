import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConsistentBackground } from '@/components/layout/ConsistentBackground'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableauxNavigator } from "@/components/edn/TableauxNavigator"
import { ednTableauxService } from "@/services/ednTableauxService"
import { ArrowLeft, RefreshCw, AlertTriangle, Table } from "lucide-react"
import { toast } from "sonner"
import { Link } from 'react-router-dom'

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
      <ConsistentBackground variant="secondary">
        <div className="container mx-auto px-4 py-8 space-y-6">
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
      </ConsistentBackground>
    )
  }

  if (error || !itemData) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Erreur de chargement"
            subtitle="Impossible de charger les tableaux de connaissances"
            icon={AlertTriangle}
            showBackButton
            backTo="/edn"
          />

          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Une erreur inattendue s\'est produite'}
            </AlertDescription>
          </Alert>

          <Button onClick={fetchItemTableaux} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </ConsistentBackground>
    )
  }

  return (
    <ConsistentBackground variant="secondary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Tableaux de Connaissances"
          subtitle={`${itemData.item_code} - ${itemData.title}`}
          icon={Table}
          showBackButton
          backTo="/edn"
          actions={
            <Button 
              variant="outline" 
              onClick={fetchItemTableaux} 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          }
        />

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
                <span className={`ml-2 ${itemData.completeness.overall_complete ? 'text-green-600' : 'text-orange-500'}`}>
                  {itemData.completeness.overall_complete ? 'Complet' : 'Incomplet'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsistentBackground>
  )
}