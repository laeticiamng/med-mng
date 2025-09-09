// ============================================================================
// PACKAGES/CORE - Logique métier pure EDN (sans dépendance UI/réseau)
// ============================================================================

export interface EDNItem {
  id: string;
  number: number;
  title: string;
  category: 'cardio' | 'pneumo' | 'neuro' | 'gastro' | 'nephro' | 'endocrino' | 'hemato' | 'infectio' | 'dermato' | 'rhumato' | 'ophtalmo' | 'orl' | 'uro' | 'gyneco' | 'pediatrie' | 'psychiatrie' | 'urgences' | 'geriatrie' | 'medecine-generale';
  subcategory?: string;
  description: string;
  objectives: string[];
  keyPoints: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedStudyTime: number; // minutes
  prerequisites?: string[];
  relatedItems?: string[];
  lastUpdated: Date;
}

export interface UserProgress {
  userId: string;
  itemId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  completionRate: number; // 0-100
  timeSpent: number; // minutes
  lastAccessed: Date;
  attempts: number;
  bestScore?: number;
}

export interface StudySession {
  id: string;
  userId: string;
  itemIds: string[];
  startTime: Date;
  endTime?: Date;
  totalTime: number; // minutes
  completedItems: number;
  averageScore: number;
  focusMode: boolean;
  notes?: string;
}

// ============================================================================
// RÈGLES MÉTIER EDN (logique pure, testable facilement)
// ============================================================================

export class EDNCore {
  /**
   * Calcule le score de progression global d'un utilisateur
   */
  static calculateOverallProgress(userProgresses: UserProgress[]): {
    completionRate: number;
    totalTimeSpent: number;
    masteredItems: number;
    totalItems: number;
  } {
    const totalItems = userProgresses.length;
    const completedItems = userProgresses.filter(p => p.status === 'completed' || p.status === 'mastered').length;
    const masteredItems = userProgresses.filter(p => p.status === 'mastered').length;
    const totalTimeSpent = userProgresses.reduce((sum, p) => sum + p.timeSpent, 0);
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      completionRate: Math.round(completionRate),
      totalTimeSpent,
      masteredItems,
      totalItems
    };
  }

  /**
   * Recommande les prochains items à étudier
   */
  static getRecommendedItems(
    allItems: EDNItem[],
    userProgresses: UserProgress[],
    userLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate'
  ): EDNItem[] {
    const progressMap = new Map(userProgresses.map(p => [p.itemId, p]));
    
    // Items non commencés du niveau approprié
    const notStartedItems = allItems.filter(item => {
      const progress = progressMap.get(item.id);
      return (!progress || progress.status === 'not-started') && 
             this.isAppropriateLevel(item.difficulty, userLevel);
    });

    // Items en cours
    const inProgressItems = allItems.filter(item => {
      const progress = progressMap.get(item.id);
      return progress?.status === 'in-progress';
    });

    // Priorise: en cours > niveau approprié > prérequis satisfaits
    return [
      ...inProgressItems,
      ...notStartedItems
        .filter(item => this.hasPrerequisites(item, userProgresses))
        .slice(0, 5)
    ].slice(0, 10);
  }

  /**
   * Calcule le niveau suggéré basé sur les performances
   */
  static calculateUserLevel(userProgresses: UserProgress[]): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (userProgresses.length < 10) return 'beginner';
    
    const avgScore = userProgresses.reduce((sum, p) => sum + (p.bestScore || 0), 0) / userProgresses.length;
    const masteredRate = userProgresses.filter(p => p.status === 'mastered').length / userProgresses.length;
    
    if (avgScore >= 90 && masteredRate >= 0.8) return 'expert';
    if (avgScore >= 80 && masteredRate >= 0.6) return 'advanced';
    if (avgScore >= 70 && masteredRate >= 0.4) return 'intermediate';
    return 'beginner';
  }

  /**
   * Calcule le temps d'étude optimal pour un item
   */
  static calculateOptimalStudyTime(item: EDNItem, userLevel: string): number {
    let baseTime = item.estimatedStudyTime;
    
    // Ajuste selon le niveau utilisateur vs difficulté item
    const levelMultiplier = this.getLevelMultiplier(userLevel, item.difficulty);
    
    return Math.round(baseTime * levelMultiplier);
  }

  /**
   * Détecte les lacunes dans la progression
   */
  static identifyKnowledgeGaps(
    userProgresses: UserProgress[], 
    allItems: EDNItem[]
  ): { category: string; itemsCount: number; avgScore: number }[] {
    const itemsMap = new Map(allItems.map(item => [item.id, item]));
    const categoryStats = new Map<string, { total: number; scores: number[] }>();

    userProgresses.forEach(progress => {
      const item = itemsMap.get(progress.itemId);
      if (!item || !progress.bestScore) return;

      const category = item.category;
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { total: 0, scores: [] });
      }
      
      const stats = categoryStats.get(category)!;
      stats.total++;
      stats.scores.push(progress.bestScore);
    });

    return Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        itemsCount: stats.total,
        avgScore: stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length
      }))
      .filter(gap => gap.avgScore < 75) // Seuil de lacune
      .sort((a, b) => a.avgScore - b.avgScore);
  }

  // ============================================================================
  // MÉTHODES PRIVÉES (helpers)
  // ============================================================================

  private static isAppropriateLevel(itemDifficulty: string, userLevel: string): boolean {
    const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const itemIndex = difficultyLevels.indexOf(itemDifficulty);
    const userIndex = difficultyLevels.indexOf(userLevel);
    
    // Permet items du niveau actuel ± 1
    return Math.abs(itemIndex - userIndex) <= 1;
  }

  private static hasPrerequisites(item: EDNItem, userProgresses: UserProgress[]): boolean {
    if (!item.prerequisites?.length) return true;
    
    const progressMap = new Map(userProgresses.map(p => [p.itemId, p]));
    
    return item.prerequisites.every(prereqId => {
      const progress = progressMap.get(prereqId);
      return progress?.status === 'completed' || progress?.status === 'mastered';
    });
  }

  private static getLevelMultiplier(userLevel: string, itemDifficulty: string): number {
    const levelMap = { 'beginner': 0, 'intermediate': 1, 'advanced': 2, 'expert': 3 };
    const userLevelNum = levelMap[userLevel as keyof typeof levelMap] || 1;
    const itemLevelNum = levelMap[itemDifficulty as keyof typeof levelMap] || 1;
    
    const difference = itemLevelNum - userLevelNum;
    
    if (difference > 1) return 1.5; // Item trop difficile
    if (difference === 1) return 1.2; // Item un peu difficile
    if (difference === 0) return 1.0; // Niveau approprié
    if (difference === -1) return 0.8; // Item facile
    return 0.6; // Item très facile
  }
}

// ============================================================================
// VALIDATEURS (règles d'invariants)
// ============================================================================

export class EDNValidators {
  static validateEDNItem(item: Partial<EDNItem>): string[] {
    const errors: string[] = [];
    
    if (!item.number || item.number < 1 || item.number > 367) {
      errors.push('Le numéro EDN doit être entre 1 et 367');
    }
    
    if (!item.title || item.title.trim().length < 5) {
      errors.push('Le titre doit contenir au moins 5 caractères');
    }
    
    if (!item.category) {
      errors.push('La catégorie est obligatoire');
    }
    
    if (!item.objectives || item.objectives.length === 0) {
      errors.push('Au moins un objectif pédagogique est requis');
    }
    
    if (!item.estimatedStudyTime || item.estimatedStudyTime < 5) {
      errors.push('Le temps d\'étude estimé doit être d\'au moins 5 minutes');
    }
    
    return errors;
  }
  
  static validateUserProgress(progress: Partial<UserProgress>): string[] {
    const errors: string[] = [];
    
    if (!progress.userId) {
      errors.push('L\'ID utilisateur est obligatoire');
    }
    
    if (!progress.itemId) {
      errors.push('L\'ID de l\'item EDN est obligatoire');
    }
    
    if (progress.completionRate !== undefined && 
        (progress.completionRate < 0 || progress.completionRate > 100)) {
      errors.push('Le taux de completion doit être entre 0 et 100');
    }
    
    if (progress.timeSpent !== undefined && progress.timeSpent < 0) {
      errors.push('Le temps passé ne peut pas être négatif');
    }
    
    if (progress.bestScore !== undefined && 
        (progress.bestScore < 0 || progress.bestScore > 100)) {
      errors.push('Le meilleur score doit être entre 0 et 100');
    }
    
    return errors;
  }
}

export default EDNCore;