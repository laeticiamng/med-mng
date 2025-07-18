import { z } from 'zod'
import { useState, useCallback } from 'react'

// Schéma pour la génération musicale
export const songGenerationSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Le prompt doit contenir au moins 10 caractères')
    .max(500, 'Le prompt ne peut pas dépasser 500 caractères')
    .regex(/^[a-zA-Z0-9\s\-_.,:;!?\u00e0\u00e2\u00e4\u00e9\u00e8\u00ea\u00eb\u00ef\u00ee\u00f4\u00f9\u00fb\u00fc\u00ff\u00e7]+$/, 'Caractères non autorisés détectés'),
  
  style: z.enum([
    'lofi-piano',
    'pop-melodique', 
    'jazz',
    'rock',
    'folk',
    'classique',
    'electronique'
  ], {
    errorMap: () => ({ message: 'Style musical non autorisé' })
  }),
  
  duration: z.enum(['2:00', '4:00', '6:00'], {
    errorMap: () => ({ message: 'Durée non autorisée' })
  }),
  
  title: z
    .string()
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-Z0-9\s\-_.\u00e0\u00e2\u00e4\u00e9\u00e8\u00ea\u00eb\u00ef\u00ee\u00f4\u00f9\u00fb\u00fc\u00ff\u00e7]*$/, 'Caractères non autorisés dans le titre')
    .optional()
})

// Schéma pour les réponses de quiz
export const quizAnswerSchema = z.object({
  questionId: z.string().uuid('ID de question invalide'),
  answer: z.string().min(1, 'Réponse requise').max(1000, 'Réponse trop longue'),
  timeSpent: z.number().min(0).max(3600, 'Temps de réponse invalide') // max 1h
})

// Schéma pour les commentaires/feedback
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'question']),
  title: z.string().min(5, 'Titre trop court').max(100, 'Titre trop long'),
  description: z.string().min(10, 'Description trop courte').max(2000, 'Description trop longue'),
  email: z.string().email('Email invalide').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
})

// Utilitaire de validation avec nettoyage
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    return { success: false, errors: ['Erreur de validation inconnue'] }
  }
}

// Hook de validation React
export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<string[]>([])
  
  const validate = useCallback((data: unknown) => {
    const result = validateAndSanitize(schema, data)
    
    if (result.success) {
      setErrors([])
      return result.data
    } else {
      setErrors(result.errors)
      return null
    }
  }, [schema])
  
  const clearErrors = useCallback(() => setErrors([]), [])
  
  return { validate, errors, clearErrors }
}
