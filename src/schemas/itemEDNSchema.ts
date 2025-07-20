
import { z } from 'zod';

// Schema Zod pour validation TypeScript
export const ItemEDNSchemaV2 = z.object({
  item_metadata: z.object({
    code: z.string().regex(/^IC-[0-9]+$/, "Format code invalide (attendu: IC-X)"),
    title: z.string().min(5).max(200),
    subtitle: z.string().max(300).optional(),
    category: z.enum([
      'relation_medecin_malade',
      'valeurs_professionnelles', 
      'raisonnement_decision',
      'qualite_securite',
      'organisation_systeme'
    ]),
    difficulty: z.enum(['A', 'B', 'AB']),
    version: z.string().regex(/^v2\.[0-9]+\.[0-9]+$/, "Version invalide (attendu: v2.X.Y)"),
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug invalide (a-z, 0-9, - uniquement)"),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional()
  }),
  
  content: z.object({
    rang_a: z.object({
      theme: z.string().min(1),
      competences: z.array(z.object({
        competence_id: z.string().regex(/^[A-Z0-9_]+$/),
        concept: z.string().min(3).max(150),
        definition: z.string().min(10),
        exemple: z.string().min(10),
        piege: z.string().min(10),
        mnemo: z.string().min(3),
        subtilite: z.string().min(10),
        application: z.string().min(10),
        vigilance: z.string().min(10),
        paroles_chantables: z.array(z.string().min(10))
      })).min(1)
    }),
    rang_b: z.object({
      theme: z.string().min(1),
      competences: z.array(z.object({
        competence_id: z.string().regex(/^[A-Z0-9_]+$/),
        concept: z.string().min(3).max(150),
        definition: z.string().min(10),
        exemple: z.string().min(10),
        piege: z.string().min(10),
        mnemo: z.string().min(3),
        subtilite: z.string().min(10),
        application: z.string().min(10),
        vigilance: z.string().min(10),
        paroles_chantables: z.array(z.string().min(10))
      })).min(1)
    })
  }),
  
  generation_config: z.object({
    music_enabled: z.boolean(),
    bd_enabled: z.boolean(),
    quiz_enabled: z.boolean(),
    interactive_enabled: z.boolean()
  }),
  
  ai_prompts: z.object({
    music_prompt_base: z.string().optional(),
    bd_prompt_base: z.string().optional(),
    quiz_prompt_base: z.string().optional()
  }).optional()
});

export type ItemEDNV2 = z.infer<typeof ItemEDNSchemaV2>;
export type CompetenceV2 = z.infer<typeof ItemEDNSchemaV2>['content']['rang_a']['competences'][0];
export type RangContentV2 = z.infer<typeof ItemEDNSchemaV2>['content']['rang_a'];

// Fonction de validation avec messages d'erreur clairs
export function validateItemEDN(item: unknown): { success: true; data: ItemEDNV2 } | { success: false; errors: string[] } {
  try {
    const validatedItem = ItemEDNSchemaV2.parse(item);
    return { success: true, data: validatedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erreur de validation inconnue'] };
  }
}

// Helper pour créer un item vide conforme
export function createEmptyItemEDN(code: string, title: string, category: ItemEDNV2['item_metadata']['category']): ItemEDNV2 {
  return {
    item_metadata: {
      code,
      title,
      category,
      difficulty: 'AB',
      version: 'v2.0.0',
      slug: code.toLowerCase().replace('ic-', 'ic-'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    content: {
      rang_a: {
        theme: `${title} - Rang A`,
        competences: []
      },
      rang_b: {
        theme: `${title} - Rang B`, 
        competences: []
      }
    },
    generation_config: {
      music_enabled: true,
      bd_enabled: true,
      quiz_enabled: true,
      interactive_enabled: true
    }
  };
}
