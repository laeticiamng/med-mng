// Hook to trigger badge unlock animations when badges are earned
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBadgeUnlock } from '@/components/gamification/BadgeUnlockAnimation';
import { BADGE_DEFINITIONS } from '@/hooks/useGamification';

export function useBadgeUnlockTrigger() {
  const { unlockedBadge, showBadgeUnlock, hideBadgeUnlock } = useBadgeUnlock();
  const previousBadgesRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Subscribe to badge changes
  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load initial badges
      const { _data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id)
        .eq('unlocked', true);

      if (existingBadges) {
        previousBadgesRef.current = new Set(existingBadges.map(b => b.badge_id));
      }

      // Mark initial load complete after a short delay
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 1000);

      // Subscribe to new badges
      channel = supabase
        .channel('badge-unlocks')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_badges',
            filter: `user_id=eq.${user.id}`
          },
          (payload: any) => {
            const newBadgeId = payload.new?.badge_id;
            
            // Only show animation if this is a genuinely new badge
            if (newBadgeId && !previousBadgesRef.current.has(newBadgeId) && !initialLoadRef.current) {
              previousBadgesRef.current.add(newBadgeId);
              
              const badgeDef = BADGE_DEFINITIONS.find(b => b.id === newBadgeId);
              if (badgeDef) {
                showBadgeUnlock({
                  id: newBadgeId,
                  name: badgeDef.name,
                  description: badgeDef.description,
                  icon: badgeDef.icon,
                  rarity: badgeDef.rarity
                });
              }
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [showBadgeUnlock]);

  // Manual trigger for immediate badge unlocks (when earned in the same session)
  const triggerBadgeUnlock = useCallback((badgeId: string) => {
    if (previousBadgesRef.current.has(badgeId)) return;
    
    previousBadgesRef.current.add(badgeId);
    
    const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (badgeDef) {
      showBadgeUnlock({
        id: badgeId,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        rarity: badgeDef.rarity
      });
    }
  }, [showBadgeUnlock]);

  return {
    unlockedBadge,
    hideBadgeUnlock,
    triggerBadgeUnlock
  };
}
