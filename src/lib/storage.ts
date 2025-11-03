import { PoopLog, UserStats, LeaderboardEntry } from "@/types/poop";
import { supabase } from "@/integrations/supabase/client";

// Type helpers for database operations
type DbClient = typeof supabase;

export const getUsername = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return "Guest";
  
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();
  
  return profile?.username ?? "User";
};

export const setUsername = async (username: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const referralCode = username.toLowerCase().replace(/\s+/g, '');
  
  await (supabase as any)
    .from('profiles')
    .update({ 
      username,
      referral_code: referralCode 
    })
    .eq('id', user.id);
};

export const getLogs = async (): Promise<PoopLog[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await (supabase as any)
    .from('logs')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  
  return (data || []).map((log: any) => ({
    id: log.id,
    timestamp: log.timestamp,
    bristolType: log.bristol_type,
    duration: log.duration,
    satisfaction: log.satisfaction,
    urgency: log.urgency,
    location: log.location,
    notes: log.notes,
  }));
};

export const addLog = async (log: Omit<PoopLog, "id">): Promise<PoopLog | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await (supabase as any)
    .from('logs')
    .insert({
      user_id: user.id,
      timestamp: log.timestamp,
      bristol_type: log.bristolType,
      duration: log.duration,
      satisfaction: log.satisfaction,
      urgency: log.urgency,
      location: log.location,
      notes: log.notes,
    })
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error adding log:', error);
    return null;
  }
  
  // Check if this is the user's first log and complete referral if so
  const { data: logCount } = await (supabase as any)
    .from('logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  if (logCount === 1) {
    // This is the first log, complete the referral
    const { completeReferral } = await import('./referrals');
    await completeReferral(user.id);
  }
  
  const logData = data as any;
  return {
    id: logData.id,
    timestamp: logData.timestamp,
    bristolType: logData.bristol_type,
    duration: logData.duration,
    satisfaction: logData.satisfaction,
    urgency: logData.urgency,
    location: logData.location,
    notes: logData.notes,
  };
};

export const getStats = async (): Promise<UserStats> => {
  const logs = await getLogs();
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = now - 7 * 24 * 60 * 60 * 1000;

  const todayLogs = logs.filter(log => log.timestamp >= todayStart);
  const weekLogs = logs.filter(log => log.timestamp >= weekStart);

  const bristolCounts: Record<number, number> = {};
  let totalSatisfaction = 0;
  let totalDuration = 0;

  logs.forEach(log => {
    bristolCounts[log.bristolType] = (bristolCounts[log.bristolType] || 0) + 1;
    totalSatisfaction += log.satisfaction;
    totalDuration += log.duration;
  });

  const mostCommonBristol = Object.entries(bristolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 4;

  // Calculate streak
  let streak = 0;
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  let currentDate = new Date().setHours(0, 0, 0, 0);
  
  for (const log of sortedLogs) {
    const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
    if (logDate === currentDate || logDate === currentDate - 24 * 60 * 60 * 1000) {
      if (logDate < currentDate) {
        currentDate = logDate;
        streak++;
      }
    } else {
      break;
    }
  }

  return {
    totalLogs: logs.length,
    todayCount: todayLogs.length,
    weekCount: weekLogs.length,
    averageDuration: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0,
    mostCommonBristol: parseInt(mostCommonBristol as string),
    averageSatisfaction: logs.length > 0 ? totalSatisfaction / logs.length : 0,
    currentStreak: streak,
  };
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await (supabase as any)
    .rpc('get_leaderboard');
  
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  
  return (data || []).map((entry: any) => ({
    username: entry.username,
    count: entry.log_count,
    rank: entry.rank
  }));
};
