import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
  username: string;
  userId: string | null;
  isVerified: boolean;
  totalLogs: number;
  weekLogs: number;
  rank: number;
}

// LocalStorage keys
const LEADERBOARD_ID_KEY = 'leaderboard_entry_id';
const LEADERBOARD_USERNAME_KEY = 'leaderboard_username';

export const getLeaderboardEntryId = (): string | null => {
  return localStorage.getItem(LEADERBOARD_ID_KEY);
};

export const getLeaderboardUsername = (): string | null => {
  return localStorage.getItem(LEADERBOARD_USERNAME_KEY);
};

export const saveLeaderboardInfo = (entryId: string, username: string): void => {
  localStorage.setItem(LEADERBOARD_ID_KEY, entryId);
  localStorage.setItem(LEADERBOARD_USERNAME_KEY, username);
};

export const clearLeaderboardInfo = (): void => {
  localStorage.removeItem(LEADERBOARD_ID_KEY);
  localStorage.removeItem(LEADERBOARD_USERNAME_KEY);
};

export const hasJoinedLeaderboard = (): boolean => {
  return getLeaderboardEntryId() !== null;
};

export const updateLeaderboardStats = async (entryId: string): Promise<void> => {
  try {
    await (supabase as any).rpc('update_leaderboard_stats', {
      entry_id: entryId,
      increment_total: 1,
      increment_week: 1
    });
  } catch (error) {
    console.error('Error updating leaderboard stats:', error);
  }
};

export const getFullLeaderboard = async (sortBy: 'total' | 'week' = 'total'): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await (supabase as any)
      .rpc('get_full_leaderboard', { sort_by: sortBy });

    if (error) throw error;

    return (data || []).map((entry: any) => ({
      id: entry.id,
      username: entry.username,
      userId: entry.user_id,
      isVerified: entry.is_verified,
      totalLogs: entry.total_logs,
      weekLogs: entry.week_logs,
      rank: entry.rank,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const linkLeaderboardToAccount = async (entryId: string, userId: string): Promise<void> => {
  try {
    await (supabase as any).rpc('link_leaderboard_to_account', {
      entry_id: entryId,
      account_user_id: userId
    });
  } catch (error) {
    console.error('Error linking leaderboard to account:', error);
    throw error;
  }
};

export const getUserTier = async (): Promise<'anonymous' | 'leaderboard' | 'verified'> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) return 'verified';
  if (hasJoinedLeaderboard()) return 'leaderboard';
  return 'anonymous';
};
