import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, LogOut, Shield, Trophy, Mail } from "lucide-react";
import { getUsername, setUsername } from "@/lib/storage";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTier, getLeaderboardUsername } from "@/lib/leaderboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const SettingsButton = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [userTier, setUserTier] = useState<'anonymous' | 'leaderboard' | 'verified'>('anonymous');
  const [leaderboardName, setLeaderboardName] = useState<string>("");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserInfo();
  }, [user]);

  const loadUserInfo = async () => {
    const tier = await getUserTier();
    setUserTier(tier);
    
    if (tier === 'verified') {
      const username = await getUsername();
      setInputValue(username);
    } else if (tier === 'leaderboard') {
      const name = getLeaderboardUsername();
      setLeaderboardName(name || "");
    }
  };

  const handleOpen = async () => {
    await loadUserInfo();
    setOpen(true);
  };

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      toast.error("Username cannot be empty");
      return;
    }
    
    if (trimmed.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    
    if (trimmed.length > 20) {
      toast.error("Username must be 20 characters or less");
      return;
    }

    await setUsername(trimmed);
    toast.success("Username updated! 🌊");
    setOpen(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  const handleJoinLeaderboard = () => {
    setOpen(false);
    navigate('/');
    // The leaderboard join modal will be triggered after next log
    toast.info("Log your next session to join the leaderboard!");
  };

  const handleCreateAccount = () => {
    setOpen(false);
    navigate('/auth');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpen}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              {userTier === 'anonymous' && "Join the leaderboard or create an account"}
              {userTier === 'leaderboard' && "Protect your ranking with an account"}
              {userTier === 'verified' && "Manage your account settings"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Anonymous User */}
            {userTier === 'anonymous' && (
              <>
                <Card className="p-4 bg-primary/10 border-primary/30">
                  <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm mb-1">Join Global Leaderboard</p>
                      <p className="text-xs text-muted-foreground">
                        Start competing with users worldwide - no email needed!
                      </p>
                    </div>
                  </div>
                </Card>
                <Button
                  onClick={handleJoinLeaderboard}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Join Leaderboard
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">FAQ</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-bold mb-1">Q: Do I need an email to compete on the leaderboard?</p>
                    <p className="text-muted-foreground">A: Nope! Just pick a username. Email is only needed if you want to sync across devices and protect your name.</p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Q: What happens if I clear my browser data?</p>
                    <p className="text-muted-foreground">A: Without an account, you'll lose your local data. Your leaderboard entry stays, but you can't update it. Create an account to prevent this.</p>
                  </div>
                </div>
              </>
            )}

            {/* Leaderboard User */}
            {userTier === 'leaderboard' && (
              <>
                <div className="space-y-2">
                  <Label>Your leaderboard name</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-bold">{leaderboardName}</p>
                  </div>
                </div>

                <Card className="p-4 bg-accent/10 border-accent/30">
                  <div className="flex items-start gap-3 mb-4">
                    <Shield className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm mb-2">Create Account to Protect Your Ranking</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>✅ Claim your username forever (no one else can use it)</p>
                        <p>✅ Sync your data across all devices</p>
                        <p>✅ Never lose your progress</p>
                        <p>✅ Get verified ✓ badge on leaderboard</p>
                        <p>✅ Recover data if you clear your browser</p>
                      </div>
                      <p className="text-xs font-bold mt-2">Your leaderboard stats will remain the same.</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateAccount}
                    className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </Card>
              </>
            )}

            {/* Verified User */}
            {userTier === 'verified' && (
              <>
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <p className="font-bold text-sm">Verified account ✅</p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username-edit">Display Name</Label>
                  <Input
                    id="username-edit"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter your username..."
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    3-20 characters • This appears on leaderboards
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};