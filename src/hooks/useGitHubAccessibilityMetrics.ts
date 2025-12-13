import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  createdAt: string;
  closedAt?: string;
  merged: boolean;
  statusCheckRollup?: {
    state: string;
    contexts: Array<{
      context: string;
      state: string;
      description: string;
    }>;
  };
}

interface AccessibilityViolation {
  type: string;
  count: number;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  prNumbers: number[];
}

interface DeveloperMetrics {
  login: string;
  totalPRs: number;
  passedPRs: number;
  failedPRs: number;
  avgFixTime: number; // en heures
  conformityRate: number; // pourcentage
}

interface AccessibilityMetrics {
  blockedPRs: PullRequest[];
  violations: AccessibilityViolation[];
  developers: DeveloperMetrics[];
  avgFixTime: number;
  totalPRs: number;
  passedPRs: number;
  failedPRs: number;
  conformityRate: number;
}

const GITHUB_API_URL = 'https://api.github.com/graphql';

// Configuration du repo - À ajuster selon votre repo
const REPO_OWNER = 'med-mng';
const REPO_NAME = 'med-mng';

// Requête GraphQL pour récupérer les PRs et leurs status checks
const PULL_REQUESTS_QUERY = `
  query($owner: String!, $name: String!, $first: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: $first, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          id
          number
          title
          author {
            login
          }
          createdAt
          closedAt
          merged
          commits(last: 1) {
            nodes {
              commit {
                statusCheckRollup {
                  state
                  contexts(first: 20) {
                    nodes {
                      ... on StatusContext {
                        context
                        state
                        description
                      }
                      ... on CheckRun {
                        name
                        conclusion
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Fonction pour extraire les violations d'accessibilité depuis les descriptions de status checks
const parseAccessibilityViolations = (prs: any[]): AccessibilityViolation[] => {
  const violationMap = new Map<string, AccessibilityViolation>();

  prs.forEach(pr => {
    const contexts = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes || [];
    
    contexts.forEach((context: any) => {
      const name = context.context || context.name;
      const description = context.description || context.title || '';
      
      // Identifier les tests d'accessibilité
      if (name?.includes('accessibilit') || name?.includes('axe') || name?.includes('Lighthouse')) {
        const state = context.state || context.conclusion;
        
        if (state === 'FAILURE' || state === 'ERROR') {
          // Parser la description pour identifier le type de violation
          let violationType = 'Violation générale';
          let severity: 'critical' | 'serious' | 'moderate' | 'minor' = 'moderate';
          
          if (description.toLowerCase().includes('color contrast')) {
            violationType = 'Contraste des couleurs';
            severity = 'serious';
          } else if (description.toLowerCase().includes('aria') || description.toLowerCase().includes('label')) {
            violationType = 'Labels ARIA manquants';
            severity = 'serious';
          } else if (description.toLowerCase().includes('heading')) {
            violationType = 'Hiérarchie des titres';
            severity = 'moderate';
          } else if (description.toLowerCase().includes('alt') || description.toLowerCase().includes('image')) {
            violationType = 'Textes alternatifs';
            severity = 'critical';
          } else if (description.toLowerCase().includes('keyboard') || description.toLowerCase().includes('focus')) {
            violationType = 'Navigation clavier';
            severity = 'critical';
          } else if (description.toLowerCase().includes('landmark')) {
            violationType = 'Landmarks ARIA';
            severity = 'moderate';
          }
          
          const existing = violationMap.get(violationType);
          if (existing) {
            existing.count++;
            existing.prNumbers.push(pr.number);
          } else {
            violationMap.set(violationType, {
              type: violationType,
              count: 1,
              severity,
              prNumbers: [pr.number]
            });
          }
        }
      }
    });
  });

  return Array.from(violationMap.values()).sort((a, b) => b.count - a.count);
};

// Calculer les métriques par développeur
const calculateDeveloperMetrics = (prs: any[]): DeveloperMetrics[] => {
  const devMap = new Map<string, DeveloperMetrics>();

  prs.forEach(pr => {
    const login = pr.author?.login || 'Unknown';
    const contexts = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes || [];
    
    const accessibilityTests = contexts.filter((c: any) => {
      const name = c.context || c.name;
      return name?.includes('accessibilit') || name?.includes('axe') || name?.includes('Lighthouse');
    });
    
    const hasFailed = accessibilityTests.some((c: any) => {
      const state = c.state || c.conclusion;
      return state === 'FAILURE' || state === 'ERROR';
    });
    
    const hasPassed = accessibilityTests.length > 0 && !hasFailed;
    
    // Calculer le temps de correction (si la PR est fermée)
    let fixTime = 0;
    if (pr.closedAt && pr.createdAt) {
      const created = new Date(pr.createdAt).getTime();
      const closed = new Date(pr.closedAt).getTime();
      fixTime = (closed - created) / (1000 * 60 * 60); // en heures
    }
    
    const existing = devMap.get(login);
    if (existing) {
      existing.totalPRs++;
      if (hasPassed) existing.passedPRs++;
      if (hasFailed) existing.failedPRs++;
      if (fixTime > 0) {
        existing.avgFixTime = (existing.avgFixTime * (existing.totalPRs - 1) + fixTime) / existing.totalPRs;
      }
      existing.conformityRate = (existing.passedPRs / existing.totalPRs) * 100;
    } else {
      devMap.set(login, {
        login,
        totalPRs: 1,
        passedPRs: hasPassed ? 1 : 0,
        failedPRs: hasFailed ? 1 : 0,
        avgFixTime: fixTime,
        conformityRate: hasPassed ? 100 : 0
      });
    }
  });

  return Array.from(devMap.values()).sort((a, b) => b.conformityRate - a.conformityRate);
};

// Fonction pour identifier les PRs bloquées
const identifyBlockedPRs = (prs: any[]): PullRequest[] => {
  return prs
    .filter(pr => {
      if (pr.merged || pr.closedAt) return false;
      
      const contexts = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes || [];
      const accessibilityTests = contexts.filter((c: any) => {
        const name = c.context || c.name;
        return name?.includes('accessibilit') || name?.includes('axe') || name?.includes('Lighthouse');
      });
      
      return accessibilityTests.some((c: any) => {
        const state = c.state || c.conclusion;
        return state === 'FAILURE' || state === 'ERROR';
      });
    })
    .map(pr => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      author: pr.author?.login || 'Unknown',
      createdAt: pr.createdAt,
      closedAt: pr.closedAt,
      merged: pr.merged,
      statusCheckRollup: pr.commits?.nodes?.[0]?.commit?.statusCheckRollup
    }));
};

export const useGitHubAccessibilityMetrics = (githubToken?: string) => {
  const [metrics, setMetrics] = useState<AccessibilityMetrics | null>(null);

  // Query pour récupérer les PRs
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['github-accessibility-metrics', REPO_OWNER, REPO_NAME],
    queryFn: async () => {
      // Try to get token from multiple sources
      let token = githubToken;
      
      if (!token) {
        // Try Supabase first
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: tokenData } = await (supabase as any)
            .from('user_integration_tokens')
            .select('encrypted_token')
            .eq('user_id', user.id)
            .eq('integration_name', 'github')
            .maybeSingle();
          
          if (tokenData?.encrypted_token) {
            token = tokenData.encrypted_token;
          }
        }
      }
      
      // Fallback to localStorage
      if (!token) {
        token = localStorage.getItem('github_token') || '';
      }
      
      if (!token) {
        throw new Error('GitHub token requis. Configurez-le dans les paramètres.');
      }

      const response = await fetch(GITHUB_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: PULL_REQUESTS_QUERY,
          variables: {
            owner: REPO_OWNER,
            name: REPO_NAME,
            first: 50
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL query failed');
      }

      return result.data?.repository?.pullRequests?.nodes || [];
    },
    enabled: false, // Ne pas exécuter automatiquement
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculer les métriques quand les données changent
  useEffect(() => {
    if (data && data.length > 0) {
      const blockedPRs = identifyBlockedPRs(data);
      const violations = parseAccessibilityViolations(data);
      const developers = calculateDeveloperMetrics(data);
      
      // Calculer le temps de correction moyen
      const closedPRs = data.filter((pr: any) => pr.closedAt && pr.createdAt);
      const totalFixTime = closedPRs.reduce((sum: number, pr: any) => {
        const created = new Date(pr.createdAt).getTime();
        const closed = new Date(pr.closedAt).getTime();
        return sum + (closed - created) / (1000 * 60 * 60);
      }, 0);
      const avgFixTime = closedPRs.length > 0 ? totalFixTime / closedPRs.length : 0;
      
      // Compter les PRs réussies/échouées
      let passedCount = 0;
      let failedCount = 0;
      
      data.forEach((pr: any) => {
        const contexts = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes || [];
        const accessibilityTests = contexts.filter((c: any) => {
          const name = c.context || c.name;
          return name?.includes('accessibilit') || name?.includes('axe') || name?.includes('Lighthouse');
        });
        
        if (accessibilityTests.length > 0) {
          const hasFailed = accessibilityTests.some((c: any) => {
            const state = c.state || c.conclusion;
            return state === 'FAILURE' || state === 'ERROR';
          });
          
          if (hasFailed) {
            failedCount++;
          } else {
            passedCount++;
          }
        }
      });
      
      const totalPRs = passedCount + failedCount;
      const conformityRate = totalPRs > 0 ? (passedCount / totalPRs) * 100 : 0;
      
      setMetrics({
        blockedPRs,
        violations,
        developers,
        avgFixTime,
        totalPRs,
        passedPRs: passedCount,
        failedPRs: failedCount,
        conformityRate
      });
    }
  }, [data]);

  return {
    metrics,
    isLoading,
    error,
    refetch
  };
};
