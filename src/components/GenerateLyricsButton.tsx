import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { generateAllAdvancedLyrics } from '@/utils/generateAllAdvancedLyrics'
import { useToast } from '@/hooks/use-toast'
import { useActivityTracking } from '@/hooks/useActivityTracking'

export const GenerateLyricsButton = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentItem, setCurrentItem] = useState('')
  const { toast } = useToast()
  const { logActivity } = useActivityTracking()

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)
    setCurrentItem('')
    
    try {
      // Progrès déterministe pendant la génération
      let progressStep = 0;
      const progressInterval = setInterval(() => {
        progressStep += 1;
        setProgress(prev => Math.min(90, prev + (90 - prev) * 0.1));
      }, 500);

      const result = await generateAllAdvancedLyrics()
      
      clearInterval(progressInterval)
      setProgress(100)
      
      toast({
        title: "✅ Génération terminée",
        description: `Paroles générées pour ${result.successful || 0} items sur ${result.processed || 0} traités (${result.failed || 0} échecs)`,
      })
      
      logActivity({ 
        activity_type: 'music_generation', 
        metadata: { 
          action: 'generate_lyrics',
          successful: result.successful, 
          processed: result.processed 
        } 
      })
      
      if (result.errors && result.errors.length > 0) {
        console.log('Erreurs détaillées:', result.errors)
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
        {isGenerating ? "🔄 Génération style Nekfeu en cours..." : "🎵 Générer paroles style Nekfeu (367 items)"}
      </Button>
      
      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-center text-muted-foreground">
            Progression: {Math.round(progress)}% • Génération avec contenu médical dense et assonances
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
