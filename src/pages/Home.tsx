import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogModal } from "@/components/LogModal";
import { UsernameModal } from "@/components/UsernameModal";
import { SettingsButton } from "@/components/SettingsButton";
import { StatCard } from "@/components/StatCard";
import { BottomNav } from "@/components/BottomNav";
import { ReferralModal } from "@/components/ReferralModal";
import { PlusCircle, Clock, TrendingUp, Calendar, Flame, Users } from "lucide-react";
import { getLogs, getStats } from "@/lib/storage";
import { getReferralStats } from "@/lib/referrals";
import { supabase } from "@/integrations/supabase/client";
import { PoopLog, UserStats } from "@/types/poop";

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState<PoopLog[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState({
    completedReferrals: 0,
    nextBadgeName: undefined as string | undefined,
    nextBadgeIcon: undefined as string | undefined,
    nextBadgeThreshold: undefined as number | undefined,
  });

  const loadData = async () => {
    const logs = await getLogs();
    setRecentLogs(logs.slice(0, 5));
    setStats(await getStats());
    
    // Load referral data
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }
      
      const refStats = await getReferralStats(user.id);
      if (refStats) {
        setReferralStats({
          completedReferrals: refStats.completedReferrals,
          nextBadgeName: refStats.nextBadgeName,
          nextBadgeIcon: refStats.nextBadgeIcon,
          nextBadgeThreshold: refStats.nextBadgeThreshold,
        });
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const hasSeenWelcome = localStorage.getItem("flushhub_welcome_seen");
      
      if (!hasSeenWelcome && user) {
        setUsernameModalOpen(true);
      }
      
      loadData();
    };
    
    checkAuth();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pb-24 relative">
      <SettingsButton />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-float">💩</div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            FlushHub
          </h1>
          <p className="text-lg font-medium text-muted-foreground">Your #1 place for #2</p>
        </div>

        {/* Main CTA */}
        <Button
          onClick={() => setModalOpen(true)}
          size="lg"
          className="w-full h-28 text-2xl font-black mb-8 shadow-[var(--shadow-teal)] animate-pulse-glow"
        >
          <PlusCircle className="w-10 h-10 mr-3" />
          Drop a Log 💩
        </Button>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:scale-105 transition-transform cursor-pointer shadow-[var(--shadow-card)]">
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-2">🚽</div>
                <p className="text-sm font-bold text-muted-foreground mb-1">Today</p>
                <p className="text-4xl font-black bg-gradient-to-r from-primary to-[hsl(var(--teal-glow))] bg-clip-text text-transparent">{stats.todayCount}</p>
              </div>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 hover:scale-105 transition-transform cursor-pointer shadow-[var(--shadow-card)]">
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm font-bold text-muted-foreground mb-1">This Week</p>
                <p className="text-4xl font-black bg-gradient-to-r from-secondary to-[hsl(var(--gold-pop))] bg-clip-text text-transparent">{stats.weekCount}</p>
              </div>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 hover:scale-105 transition-transform cursor-pointer shadow-[var(--shadow-card)]">
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-2">⏱️</div>
                <p className="text-sm font-bold text-muted-foreground mb-1">Avg Time</p>
                <p className="text-4xl font-black bg-gradient-to-r from-accent to-[hsl(var(--purple-fun))] bg-clip-text text-transparent">{Math.floor(stats.averageDuration / 60)}m</p>
              </div>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30 hover:scale-105 transition-transform cursor-pointer shadow-[var(--shadow-card)]">
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-2">🔥</div>
                <p className="text-sm font-bold text-muted-foreground mb-1">Streak</p>
                <p className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{stats.currentStreak}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Invite Friends Button */}
        <Button
          onClick={() => setReferralModalOpen(true)}
          variant="fun"
          className="w-full mb-8 h-16 text-base"
        >
          <Users className="w-6 h-6 mr-2" />
          <div className="flex-1 text-left">
            <div className="font-black">🎁 Invite Friends & Get Rewards</div>
            <div className="text-xs opacity-90">
              {referralStats.completedReferrals} friend{referralStats.completedReferrals !== 1 ? 's' : ''} joined the throne
            </div>
          </div>
        </Button>

        {/* Recent Activity */}
        <div className="mb-4">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <span className="text-2xl">📜</span>
            Recent Drops
          </h2>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-to-br from-muted/50 to-muted/30 border-dashed border-2">
                <div className="text-5xl mb-3">🤷</div>
                <p className="font-bold text-lg">Nothing logged yet!</p>
                <p className="text-sm text-muted-foreground mt-1">Hit that button above to get started</p>
              </Card>
            ) : (
              recentLogs.map(log => (
                <Card key={log.id} className="p-4 bg-gradient-to-r from-card via-card to-muted/20 border-l-4 border-l-primary hover:scale-[1.02] hover:shadow-[var(--shadow-card)] transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-base">{formatDate(log.timestamp)}</p>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        Type {log.bristolType} · {log.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-base font-bold">{formatDuration(log.duration)}</span>
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {'⭐'.repeat(log.satisfaction)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <UsernameModal
        open={usernameModalOpen}
        onComplete={(username) => {
          localStorage.setItem("flushhub_welcome_seen", "true");
          setUsernameModalOpen(false);
        }}
      />

      <LogModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onLogAdded={loadData}
      />

      <ReferralModal
        open={referralModalOpen}
        onOpenChange={setReferralModalOpen}
        referralCode={referralCode}
        stats={referralStats}
      />

      <BottomNav />
    </div>
  );
};

export default Home;
