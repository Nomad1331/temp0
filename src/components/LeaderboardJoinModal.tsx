import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trophy, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardJoinModalProps {
  open: boolean;
  onJoin: (entryId: string, username: string) => void;
  onSkip: () => void;
}

export const LeaderboardJoinModal = ({ open, onJoin, onSkip }: LeaderboardJoinModalProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must be 20 characters or less";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscores allowed";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = username.trim();
    const validationError = validateUsername(trimmed);
    
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setSuggestions([]);

    try {
      // Check if username is available
      const { data: isAvailable } = await (supabase as any)
        .rpc('check_username_available', { desired_username: trimmed });

      if (!isAvailable) {
        // Get suggestions
        const { data: suggestedNames } = await (supabase as any)
          .rpc('suggest_usernames', { base_username: trimmed });
        
        setSuggestions(suggestedNames || []);
        toast.error("That name is taken. Try one of the suggestions below!");
        setLoading(false);
        return;
      }

      // Create leaderboard entry
      const { data: entryId, error } = await (supabase as any)
        .rpc('create_leaderboard_entry', { 
          entry_username: trimmed,
          entry_user_id: null
        });

      if (error) throw error;

      toast.success(`🎉 You're now competing globally as ${trimmed}!`, {
        duration: 4000,
      });
      
      onJoin(entryId, trimmed);
    } catch (error) {
      console.error('Error joining leaderboard:', error);
      toast.error("Failed to join leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Join the Global Leaderboard?
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-base">
            Compete with users worldwide! No email needed - just pick a username.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-2">
          <div className="flex items-center gap-2 justify-center">
            <Mail className="w-5 h-5 text-primary" />
            <p className="font-bold text-primary text-center">
              No email required - just pick a username and start competing!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaderboard-username">Choose your leaderboard name</Label>
            <Input
              id="leaderboard-username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setSuggestions([]);
              }}
              placeholder="Pick a display name..."
              maxLength={20}
              autoFocus
              className="text-lg"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This is just a display name - no email or personal info required
            </p>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Try these instead:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUsername(suggestion);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Leaderboard"}
          </Button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
