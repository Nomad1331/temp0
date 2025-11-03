import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, LogOut } from "lucide-react";
import { getUsername, setUsername } from "@/lib/storage";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SettingsButton = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { signOut, user } = useAuth();

  const handleOpen = async () => {
    const username = await getUsername();
    setInputValue(username);
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
          </DialogHeader>

          <div className="space-y-6 pt-4">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};