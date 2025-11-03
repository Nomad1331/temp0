import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUsername } from "@/lib/storage";
import { toast } from "sonner";
import { Waves } from "lucide-react";

interface UsernameModalProps {
  open: boolean;
  onComplete: (username: string) => void;
}

export const UsernameModal = ({ open, onComplete }: UsernameModalProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = inputValue.trim();
    if (!trimmed) {
      toast.error("Please enter a username");
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
    toast.success(`Welcome to FlushHub, ${trimmed}! 🌊`);
    onComplete(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()}>

        <DialogHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Waves className="w-8 h-8 text-primary" />
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to FlushHub
            </DialogTitle>
          </div>
          <DialogDescription className="text-center">
            Choose a display name to get started. This will appear on leaderboards and you can change it anytime.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Display Name</Label>
            <Input
              id="username"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your username..."
              maxLength={20}
              autoFocus
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters • Can be anonymous or your real name
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            Start Tracking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
