import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

const XP_REFERRER = 500;
const XP_REFERRED = 200;

export function useReferralSystem(userId?: string) {
  const queryClient = useQueryClient();

  // Get or create user's referral code
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['referral-code', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: existing } = await supabase
        .from('user_referral_codes')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) return existing;

      // Generate new code
      const { data: code } = await supabase.rpc('generate_referral_code');
      
      const { data: created, error } = await supabase
        .from('user_referral_codes')
        .insert({ user_id: userId, referral_code: code as string })
        .select()
        .single();
      
      if (error) throw error;
      return created;
    },
    enabled: !!userId,
  });

  // Get referral stats
  const { data: referrals } = useQuery({
    queryKey: ['referrals', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId!)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });

  // Track social share
  const trackShare = useMutation({
    mutationFn: async ({ shareType, platform, contentData }: { 
      shareType: string; platform: string; contentData?: Record<string, string | number | boolean> 
    }) => {
      if (!userId) return;
      await supabase.from('social_shares').insert([{
        user_id: userId,
        share_type: shareType,
        platform,
        content_data: (contentData ?? {}) as any,
      }]);
    },
  });

  // Validate a referral code (for new users)
  const validateReferralCode = useCallback(async (code: string) => {
    const { data } = await supabase
      .from('user_referral_codes')
      .select('user_id, referral_code')
      .eq('referral_code', code.toUpperCase())
      .maybeSingle();
    return data;
  }, []);

  // Complete a referral
  const completeReferral = useMutation({
    mutationFn: async ({ referralCode, referredId }: { referralCode: string; referredId: string }) => {
      const ref = await validateReferralCode(referralCode);
      if (!ref) throw new Error('Code invalide');

      // Insert referral record
      await supabase.from('referrals').insert({
        referrer_id: ref.user_id,
        referral_code: referralCode,
        referred_id: referredId,
        status: 'completed',
        xp_awarded_referrer: XP_REFERRER,
        xp_awarded_referred: XP_REFERRED,
        completed_at: new Date().toISOString(),
      });

      // Update referral stats
      await supabase
        .from('user_referral_codes')
        .update({
          total_referrals: (ref as any).total_referrals + 1,
          total_xp_earned: (ref as any).total_xp_earned + XP_REFERRER,
        })
        .eq('user_id', ref.user_id);

      toast.success(`🎉 Parrainage validé ! +${XP_REFERRED} XP`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-code'] });
    },
  });

  const shareUrl = referralData
    ? `${window.location.origin}/signup?ref=${referralData.referral_code}`
    : '';

  return {
    referralCode: referralData?.referral_code ?? '',
    shareUrl,
    totalReferrals: referralData?.total_referrals ?? 0,
    totalXPEarned: referralData?.total_xp_earned ?? 0,
    referrals: referrals ?? [],
    isLoading,
    trackShare: trackShare.mutate,
    validateReferralCode,
    completeReferral: completeReferral.mutate,
  };
}
