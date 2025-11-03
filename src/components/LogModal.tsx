import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Star, AlertCircle } from "lucide-react";
import { addLog } from "@/lib/storage";
import { toast } from "sonner";

interface LogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogAdded: () => void;
}

const bristolTypes = [
  { value: 1, label: "Type 1", description: "Separate hard lumps" },
  { value: 2, label: "Type 2", description: "Lumpy and sausage-like" },
  { value: 3, label: "Type 3", description: "Sausage with cracks" },
  { value: 4, label: "Type 4", description: "Smooth and soft (ideal)" },
  { value: 5, label: "Type 5", description: "Soft blobs" },
  { value: 6, label: "Type 6", description: "Mushy consistency" },
  { value: 7, label: "Type 7", description: "Liquid consistency" },
];

const locations = [
  "Home", "Work", "Friend's House", "Restaurant", "Public Restroom", 
  "Hotel", "Gym", "Other"
];

export const LogModal = ({ open, onOpenChange, onLogAdded }: LogModalProps) => {
  const [duration, setDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualSeconds, setManualSeconds] = useState("");
  const [bristolType, setBristolType] = useState<number>(4);
  const [satisfaction, setSatisfaction] = useState<number>(3);
  const [urgency, setUrgency] = useState<number>(3);
  const [location, setLocation] = useState<string>("Home");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    let finalDuration = duration;
    
    // If in manual mode, calculate duration from inputs
    if (manualMode) {
      const mins = parseInt(manualMinutes) || 0;
      const secs = parseInt(manualSeconds) || 0;
      finalDuration = mins * 60 + secs;
    }
    
    if (finalDuration === 0) {
      toast.error("Please record a duration");
      return;
    }

    const result = await addLog({
      timestamp: Date.now(),
      duration: finalDuration,
      bristolType,
      satisfaction,
      urgency,
      location,
      notes: notes.trim() || undefined,
    });

    if (result) {
      toast.success("Log added successfully! 👑");
      resetForm();
      onLogAdded();
      onOpenChange(false);
    } else {
      toast.error("Failed to save log. Please try again.");
    }
  };

  const resetForm = () => {
    setDuration(0);
    setIsTimerRunning(false);
    setManualMode(false);
    setManualMinutes("");
    setManualSeconds("");
    setBristolType(4);
    setSatisfaction(3);
    setUrgency(3);
    setLocation("Home");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Log Your Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Timer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setManualMode(!manualMode);
                  setIsTimerRunning(false);
                }}
                className="text-xs"
              >
                {manualMode ? "Use Stopwatch" : "Enter Manually"}
              </Button>
            </div>

            {!manualMode ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-2xl font-mono font-bold text-center">
                  {formatTime(duration)}
                </div>
                <Button
                  type="button"
                  variant={isTimerRunning ? "destructive" : "default"}
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-24"
                >
                  {isTimerRunning ? "Stop" : "Start"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    min="0"
                    max="60"
                    className="text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center">minutes</p>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="flex-1 space-y-1">
                  <Input
                    type="number"
                    placeholder="Seconds"
                    value={manualSeconds}
                    onChange={(e) => setManualSeconds(e.target.value)}
                    min="0"
                    max="59"
                    className="text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center">seconds</p>
                </div>
              </div>
            )}
          </div>

          {/* Bristol Scale */}
          <div className="space-y-2">
            <Label>Bristol Stool Scale</Label>
            <Select value={bristolType.toString()} onValueChange={(v) => setBristolType(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bristolTypes.map(type => (
                  <SelectItem key={type.value} value={type.value.toString()}>
                    {type.label} - {type.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Satisfaction */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Satisfaction
            </Label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSatisfaction(rating)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= satisfaction
                        ? "fill-secondary text-secondary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Urgency Level
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    level <= urgency
                      ? "bg-accent border-accent text-accent-foreground"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              1 = Calm · 5 = Emergency
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              className="resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            Save Log
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
