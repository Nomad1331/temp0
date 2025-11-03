import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Trophy, Crown, Medal } from "lucide-react";
import { getLeaderboard, getUsername } from "@/lib/storage";
import { LeaderboardEntry } from "@/types/poop";

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");

  useEffect(() => {
    const loadLeaderboard = async () => {
      const leaderboardData = await getLeaderboard();
      setEntries(leaderboardData);
      const username = await getUsername();
      setCurrentUser(username);
    };
    
    loadLeaderboard();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Global Top Performers</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-2 mb-8 items-end">
          {/* 2nd Place */}
          {entries[1] && (
            <Card className={`p-4 text-center bg-gradient-to-b ${getRankColor(2)}`}>
              <Medal className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-3xl font-bold mb-1">2</p>
              <p className="text-sm font-medium truncate">{entries[1].username}</p>
              <p className="text-xs text-muted-foreground">{entries[1].count} logs</p>
            </Card>
          )}

          {/* 1st Place */}
          {entries[0] && (
            <Card className={`p-4 text-center bg-gradient-to-b ${getRankColor(1)} transform scale-105`}>
              <Crown className="w-10 h-10 text-secondary mx-auto mb-2" />
              <p className="text-4xl font-bold mb-1">1</p>
              <p className="text-sm font-medium truncate">{entries[0].username}</p>
              <p className="text-xs text-muted-foreground">{entries[0].count} logs</p>
            </Card>
          )}

          {/* 3rd Place */}
          {entries[2] && (
            <Card className={`p-4 text-center bg-gradient-to-b ${getRankColor(3)}`}>
              <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold mb-1">3</p>
              <p className="text-sm font-medium truncate">{entries[2].username}</p>
              <p className="text-xs text-muted-foreground">{entries[2].count} logs</p>
            </Card>
          )}
        </div>

        {/* Full Leaderboard */}
        <div className="space-y-2">
          {entries.map((entry) => {
            const isCurrentUser = entry.username === currentUser;
            
            return (
              <Card
                key={entry.rank}
                className={`p-4 bg-gradient-to-r ${getRankColor(entry.rank)} ${
                  isCurrentUser ? "ring-2 ring-primary" : ""
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate">
                        {entry.username}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Rank #{entry.rank}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">{entry.count}</p>
                    <p className="text-xs text-muted-foreground">logs</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Keep logging to climb the ranks! 🚀
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Leaderboard;
