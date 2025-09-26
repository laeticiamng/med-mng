import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { generateAllAdvancedLyrics } from '@/utils/lyrics/generateAllAdvancedLyrics'
import { useToast } from '@/hooks/use-toast'

export const GenerateLyricsButton = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentItem, setCurrentItem] = useState('')
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)
    setCurrentItem('')
    
    try {
      // Simuler le progrès pendant la génération
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + Math.random() * 3
          return prev
        })
      }, 500)

      const result = await generateAllAdvancedLyrics()
      
      clearInterval(progressInterval)
      setProgress(100)
      
      toast({
        title: "✅ Génération terminée",
        description: `Paroles générées pour ${result.successful || 0} items sur ${result.processed || 0} traités (${result.failed || 0} échecs)`,
      })
      
      if (result.errors && result.errors.length > 0) {
        // Errors already handled by toast notifications in the previous block
      }
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Échec de la génération des paroles",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setTimeout(() => {
        setProgress(0)
        setCurrentItem('')
      }, 2000)
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="bg-primary text-primary-foreground w-full"
      >
        {isGenerating ? "🔄 Génération musicale en cours..." : "🎵 Générer paroles musicales (367 items)"}
      </Button>
      
      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-center text-muted-foreground">
            Progression: {Math.round(progress)}% • Génération avec contenu médical intégré
          </div>
          {currentItem && (
            <div className="text-xs text-center text-muted-foreground">
              Traitement: {currentItem}
            </div>
          )}
        </div>
      )}
    </div>
  )
}