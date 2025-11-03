import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogModal } from "@/components/LogModal";
import { BottomNav } from "@/components/BottomNav";

const Log = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-open modal when navigating to /log
    setModalOpen(true);
  }, []);

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Navigate back to home when modal is closed
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
      <LogModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onLogAdded={() => {}}
      />
      <BottomNav />
    </div>
  );
};

export default Log;
