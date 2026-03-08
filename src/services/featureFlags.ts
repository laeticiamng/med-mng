/**
 * Feature Flags Service
 * Controls feature rollout safely without breaking production
 */

export interface FeatureFlags {
  edn_exam_simulation: boolean;
  ai_music_generation: boolean;
  social_sharing: boolean;
  karaoke_duels: boolean;
  clinical_cases: boolean;
  quick_revision: boolean;
  srs_playlist: boolean;
  national_exam: boolean;
  specialty_paths: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  edn_exam_simulation: true,
  ai_music_generation: true,
  social_sharing: true,
  karaoke_duels: false,
  clinical_cases: true,
  quick_revision: true,
  srs_playlist: true,
  national_exam: true,
  specialty_paths: true,
};

class FeatureFlagService {
  private flags: FeatureFlags = { ...DEFAULT_FLAGS };
  private overrides: Partial<FeatureFlags> = {};

  constructor() {
    // Load overrides from localStorage (dev only)
    if (import.meta.env.DEV) {
      try {
        const stored = localStorage.getItem('med-mng-feature-flags');
        if (stored) {
          this.overrides = JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    if (flag in this.overrides) {
      return this.overrides[flag]!;
    }
    return this.flags[flag] ?? false;
  }

  /** Set a remote config (e.g. from Supabase clinical_feature_flags table) */
  setRemoteFlags(remote: Partial<FeatureFlags>): void {
    this.flags = { ...DEFAULT_FLAGS, ...remote };
  }

  /** Dev override */
  setOverride(flag: keyof FeatureFlags, value: boolean): void {
    this.overrides[flag] = value;
    if (import.meta.env.DEV) {
      localStorage.setItem('med-mng-feature-flags', JSON.stringify(this.overrides));
    }
  }

  clearOverrides(): void {
    this.overrides = {};
    if (import.meta.env.DEV) {
      localStorage.removeItem('med-mng-feature-flags');
    }
  }

  getAllFlags(): FeatureFlags {
    return { ...this.flags, ...this.overrides };
  }
}

export const featureFlags = new FeatureFlagService();

/** React hook for feature flags */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(flag);
}
