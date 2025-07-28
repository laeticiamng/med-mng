import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateAllAdvancedLyrics } from '@/utils/generateAllAdvancedLyrics'
import { useToast } from '@/hooks/use-toast'

export const GenerateLyricsButton = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateAllAdvancedLyrics()
      toast({
        title: "✅ Génération terminée",
        description: `Paroles générées pour ${result.successful || 0} items sur ${result.processed || 0}`,
      })
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Échec de la génération des paroles",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={isGenerating}
      className="bg-primary text-primary-foreground"
    >
      {isGenerating ? "🔄 Génération en cours..." : "🎵 Générer paroles style Nekfeu (367 items)"}
    </Button>
  )
}