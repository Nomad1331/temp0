import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { SettingsButton } from "@/components/SettingsButton";
import { Trophy, Crown, Medal, CheckCircle } from "lucide-react";
import { getFullLeaderboard, getLeaderboardUsername, type LeaderboardEntry } from "@/lib/leaderboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [sortBy, setSortBy] = useState<'total' | 'week'>('total');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const leaderboardData = await getFullLeaderboard(sortBy);
    setEntries(leaderboardData);
    const username = getLeaderboardUsername();
    setCurrentUser(username || "");
    setLoading(false);
  };

  const currentUserEntry = entries.find(e => e.username === currentUser);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-secondary" />;
      case 2:
        return <Medal className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-secondary/20 to-secondary/5 border-secondary/30";
      case 2:
        return "from-muted to-muted/50 border-muted-foreground/20";
      case 3:
        return "from-amber-500/20 to-amber-500/5 border-amber-600/30";
      default:
        return "from-card to-muted/30 border-border";
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/5 via-background to-background pb-24 relative">
      <SettingsButton />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-float">🏆</div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            Hall of Flush
          </h1>
          <p className="text-lg font-bold text-muted-foreground">Who's sitting on the throne?</p>
        </div>

        {/* Current User Rank */}
        {currentUserEntry && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40">
            <div className="text-center">
              <p className="text-sm font-bold text-muted-foreground mb-1">Your Ranking</p>
              <p className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                #{currentUserEntry.rank}
              </p>
            </div>
          </Card>
        )}

        {/* Sorting Tabs */}
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as 'total' | 'week')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="total">All Time</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-3 mb-8 items-end">
          {/* 2nd Place */}
          {entries[1] && (
            <Card className="p-5 text-center bg-gradient-to-br from-slate-400/20 to-slate-500/10 border-slate-400/40 hover:scale-105 transition-all shadow-[0_0_20px_rgba(148,163,184,0.3)]">
              <div className="text-4xl mb-2">🥈</div>
              <p className="text-4xl font-black mb-2">2</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold truncate">{entries[1].username}</p>
                {entries[1].isVerified && <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />}
              </div>
              <p className="text-2xl font-black mt-2 text-slate-400">{sortBy === 'total' ? entries[1].totalLogs : entries[1].weekLogs}</p>
            </Card>
          )}

          {/* 1st Place */}
          {entries[0] && (
            <Card className="p-6 text-center bg-gradient-to-br from-secondary via-secondary/80 to-secondary/60 border-secondary shadow-[var(--shadow-gold)] transform scale-110 hover:scale-115 transition-all animate-pulse-glow">
              <div className="text-5xl mb-2">👑</div>
              <p className="text-5xl font-black mb-2">1</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-base font-black truncate">{entries[0].username}</p>
                {entries[0].isVerified && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
              </div>
              <p className="text-3xl font-black mt-2">{sortBy === 'total' ? entries[0].totalLogs : entries[0].weekLogs}</p>
            </Card>
          )}

          {/* 3rd Place */}
          {entries[2] && (
            <Card className="p-5 text-center bg-gradient-to-br from-amber-600/20 to-amber-700/10 border-amber-600/40 hover:scale-105 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]">
              <div className="text-4xl mb-2">🥉</div>
              <p className="text-4xl font-black mb-2">3</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold truncate">{entries[2].username}</p>
                {entries[2].isVerified && <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />}
              </div>
              <p className="text-2xl font-black mt-2 text-amber-600">{sortBy === 'total' ? entries[2].totalLogs : entries[2].weekLogs}</p>
            </Card>
          )}
        </div>

        {/* Full Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-bold text-muted-foreground">No entries yet. Be the first! 🚀</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isCurrentUser = entry.username === currentUser;
              const medal = entry.rank === 1 ? "👑" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : "💩";
              const count = sortBy === 'total' ? entry.totalLogs : entry.weekLogs;
              
              return (
                <Card
                  key={entry.id}
                  className={`p-4 bg-gradient-to-r ${getRankColor(entry.rank)} ${
                    isCurrentUser ? "ring-4 ring-primary shadow-[var(--shadow-teal)] scale-105" : ""
                  } hover:scale-[1.02] transition-all hover:shadow-[var(--shadow-card)]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14">
                      <span className="text-3xl">{medal}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-lg truncate">
                          {entry.username}
                        </p>
                        {entry.isVerified && (
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        {isCurrentUser && (
                          <span className="text-xs font-black bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-muted-foreground">
                        Rank #{entry.rank}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{count}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">drops</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-base font-bold text-muted-foreground mt-8">
          💪 Keep dropping to level up!
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Leaderboard;
