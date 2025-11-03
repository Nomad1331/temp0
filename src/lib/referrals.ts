import { supabase } from "@/integrations/supabase/client";

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  nextBadgeName?: string;
  nextBadgeIcon?: string;
  nextBadgeThreshold?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  referralThreshold: number;
}

export interface UserBadge {
  badge: Badge;
  earnedAt: string;
}

export const getReferralStats = async (userId: string): Promise<ReferralStats | null> => {
  try {
    const { data, error } = await (supabase as any)
      .rpc('get_referral_stats', { user_uuid: userId });

    if (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalReferrals: 0,
        completedReferrals: 0,
      };
    }

    const stats = data[0];
    return {
      totalReferrals: stats.total_referrals || 0,
      completedReferrals: stats.completed_referrals || 0,
      nextBadgeName: stats.next_badge_name,
      nextBadgeIcon: stats.next_badge_icon,
      nextBadgeThreshold: stats.next_badge_threshold,
    };
  } catch (error) {
    console.error('Error in getReferralStats:', error);
    return null;
  }
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('user_badges')
      .select(`
        earned_at,
        badge:badges(
          id,
          name,
          description,
          icon,
          referral_threshold
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      badge: {
        id: item.badge.id,
        name: item.badge.name,
        description: item.badge.description,
        icon: item.badge.icon,
        referralThreshold: item.badge.referral_threshold,
      },
      earnedAt: item.earned_at,
    }));
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
};

export const createReferral = async (referrerCode: string, referredUserId: string): Promise<boolean> => {
  try {
    // Get referrer profile by referral code
    const { data: referrerProfile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('referral_code', referrerCode.toLowerCase())
      .maybeSingle();

    if (profileError || !referrerProfile) {
      console.error('Referrer not found:', profileError);
      return false;
    }

    // Don't allow self-referrals
    if (referrerProfile.id === referredUserId) {
      return false;
    }

    // Create referral record
    const { error: insertError } = await (supabase as any)
      .from('referrals')
      .insert({
        referrer_id: referrerProfile.id,
        referred_id: referredUserId,
        completed: false,
      });

    if (insertError) {
      console.error('Error creating referral:', insertError);
      return false;
    }

    // Update referred user's profile
    await (supabase as any)
      .from('profiles')
      .update({ referred_by: referrerCode.toLowerCase() })
      .eq('id', referredUserId);

    return true;
  } catch (error) {
    console.error('Error in createReferral:', error);
    return false;
  }
};

export const completeReferral = async (referredUserId: string): Promise<void> => {
  try {
    await (supabase as any).rpc('complete_referral', { 
      referred_user_id: referredUserId 
    });
  } catch (error) {
    console.error('Error completing referral:', error);
  }
};

export const generateReferralCode = (username: string): string => {
  return username.toLowerCase().replace(/\s+/g, '');
};
