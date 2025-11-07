import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { SettingsButton } from "@/components/SettingsButton";
import { StatCard } from "@/components/StatCard";
import { Trophy, Clock, Star, Target, TrendingUp, Calendar, Users } from "lucide-react";
import { getLogs, getStats } from "@/lib/storage";
import { getUserBadges, getReferralStats } from "@/lib/referrals";
import { supabase } from "@/integrations/supabase/client";
import { UserStats } from "@/types/poop";
import type { UserBadge } from "@/lib/referrals";

const Stats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [bristolDistribution, setBristolDistribution] = useState<Record<number, number>>({});
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const currentStats = await getStats();
      setStats(currentStats);

      // Calculate bristol distribution
      const logs = await getLogs();
      const distribution: Record<number, number> = {};
      logs.forEach(log => {
        distribution[log.bristolType] = (distribution[log.bristolType] || 0) + 1;
      });
      setBristolDistribution(distribution);

      // Load badges and referral stats
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userBadges = await getUserBadges(user.id);
        setBadges(userBadges);
        
        const refStats = await getReferralStats(user.id);
        if (refStats) {
          setReferralCount(refStats.completedReferrals);
        }
      }
    };
    
    loadData();
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading stats...</p>
      </div>
    );
  }

  const bristolTypes = [1, 2, 3, 4, 5, 6, 7];
  const maxCount = Math.max(...Object.values(bristolDistribution), 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 relative">
      <SettingsButton />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Statistics</h1>
          <p className="text-muted-foreground">Personal performance metrics</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={Trophy}
            label="Total Logs"
            value={stats.totalLogs}
            subtitle="all time"
          />
          <StatCard
            icon={TrendingUp}
            label="This Week"
            value={stats.weekCount}
            subtitle="sessions"
          />
          <StatCard
            icon={Clock}
            label="Avg Duration"
            value={`${Math.floor(stats.averageDuration / 60)}m ${stats.averageDuration % 60}s`}
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value={stats.averageSatisfaction.toFixed(1)}
            subtitle="out of 5"
          />
        </div>

        {/* Referral Stats */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/20">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            Friends Recruited
          </h2>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-foreground">{referralCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total referrals completed</p>
          </div>
          
          {badges.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Earned Badges</p>
              <div className="flex flex-wrap gap-2">
                {badges.map((userBadge) => (
                  <Badge
                    key={userBadge.badge.id}
                    variant="secondary"
                    className="text-base px-3 py-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/30"
                  >
                    {userBadge.badge.icon} {userBadge.badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Bristol Scale Distribution */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Bristol Scale Distribution
          </h2>
          <div className="space-y-3">
            {bristolTypes.map(type => {
              const count = bristolDistribution[type] || 0;
              const percentage = stats.totalLogs > 0 ? (count / stats.totalLogs) * 100 : 0;
              const barWidth = stats.totalLogs > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Type {type}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {stats.mostCommonBristol && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Most common: Type {stats.mostCommonBristol}
            </p>
          )}
        </Card>

        {/* Streak Info */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-1">{stats.currentStreak} Days</h3>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-xs text-muted-foreground mt-2">
              Keep logging daily to maintain your streak! 🔥
            </p>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Stats;
