import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode: string;
  stats: {
    completedReferrals: number;
    nextBadgeName?: string;
    nextBadgeIcon?: string;
    nextBadgeThreshold?: number;
  };
}

export const ReferralModal = ({ open, onOpenChange, referralCode, stats }: ReferralModalProps) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;
  
  const progressPercent = stats.nextBadgeThreshold 
    ? (stats.completedReferrals / stats.nextBadgeThreshold) * 100 
    : 100;
  
  const referralsNeeded = stats.nextBadgeThreshold 
    ? stats.nextBadgeThreshold - stats.completedReferrals 
    : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessages = [
    `I'm tracking my bathroom habits on FlushHub and competing globally 😂 Join me: ${referralLink}`,
    `Currently competing on the FlushHub leaderboard. Think you can beat me? ${referralLink}`,
    `Join me on FlushHub - the most honest health tracker out there 💩 ${referralLink}`
  ];

  const handleShare = async (platform: 'twitter' | 'whatsapp' | 'native') => {
    const message = shareMessages[0];
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } else if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join FlushHub',
          text: message,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Invite Friends & Earn Rewards
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Your Referral Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border border-border"
              />
              <Button
                size="icon"
                onClick={handleCopy}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 bg-gradient-to-br from-card to-muted/30 rounded-lg border border-border">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-foreground">{stats.completedReferrals}</p>
              <p className="text-sm text-muted-foreground">Friends Recruited</p>
            </div>

            {stats.nextBadgeName && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next Reward</span>
                    <span className="font-medium">
                      {stats.nextBadgeIcon} {stats.nextBadgeName}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {referralsNeeded} more referral{referralsNeeded !== 1 ? 's' : ''} to unlock
                  </p>
                </div>
              </>
            )}
            
            {!stats.nextBadgeName && stats.completedReferrals > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                🎉 You've earned all badges!
              </p>
            )}
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Share with friends</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('whatsapp')}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
            {navigator.share && (
              <Button
                variant="outline"
                onClick={() => handleShare('native')}
                className="w-full gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Link
              </Button>
            )}
          </div>

          {/* Message Templates */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pre-written messages</p>
            <div className="space-y-2">
              {shareMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted rounded-lg text-xs text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(msg);
                    toast.success("Message copied!");
                  }}
                >
                  {msg.replace(referralLink, '[link]')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
