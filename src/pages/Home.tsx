import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogModal } from "@/components/LogModal";
import { UsernameModal } from "@/components/UsernameModal";
import { SettingsButton } from "@/components/SettingsButton";
import { StatCard } from "@/components/StatCard";
import { BottomNav } from "@/components/BottomNav";
import { PlusCircle, Clock, TrendingUp, Calendar, Flame } from "lucide-react";
import { getLogs, getStats } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { PoopLog, UserStats } from "@/types/poop";

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState<PoopLog[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  const loadData = async () => {
    const logs = await getLogs();
    setRecentLogs(logs.slice(0, 5));
    setStats(await getStats());
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 relative">
      <SettingsButton />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FlushHub
          </h1>
          <p className="text-muted-foreground">Track your bathroom habits professionally</p>
        </div>

        {/* Main CTA */}
        <Button
          onClick={() => setModalOpen(true)}
          size="lg"
          className="w-full h-24 text-xl font-bold mb-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
        >
          <PlusCircle className="w-8 h-8 mr-3" />
          Log It Now
        </Button>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard
              icon={Calendar}
              label="Today"
              value={stats.todayCount}
              subtitle="sessions"
            />
            <StatCard
              icon={TrendingUp}
              label="This Week"
              value={stats.weekCount}
              subtitle="total"
            />
            <StatCard
              icon={Clock}
              label="Avg Duration"
              value={`${Math.floor(stats.averageDuration / 60)}m`}
              subtitle="per session"
            />
            <StatCard
              icon={Flame}
              label="Streak"
              value={stats.currentStreak}
              subtitle="days"
            />
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No logs yet. Start tracking!</p>
              </Card>
            ) : (
              recentLogs.map(log => (
                <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{formatDate(log.timestamp)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Type {log.bristolType} · {log.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{formatDuration(log.duration)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ⭐ {log.satisfaction}/5
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

      <BottomNav />
    </div>
  );
};

export default Home;
