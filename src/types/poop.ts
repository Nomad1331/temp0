export interface PoopLog {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  bristolType: number; // 1-7
  satisfaction: number; // 1-5
  urgency: number; // 1-5
  location: string;
  notes?: string;
}

export interface UserStats {
  totalLogs: number;
  todayCount: number;
  weekCount: number;
  averageDuration: number;
  mostCommonBristol: number;
  averageSatisfaction: number;
  currentStreak: number;
}

export interface LeaderboardEntry {
  username: string;
  count: number;
  rank: number;
}
