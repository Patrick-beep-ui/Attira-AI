import { useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { Button } from "@/components/ui/button";
import { Bookmark, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedOutfit } from "@/services/ai-service";
import { motion } from "framer-motion";

export default function OutfitResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const outfit = location.state?.outfit as GeneratedOutfit | undefined;

  if (!outfit) {
    return (
      <AppShell>
        <HeaderBar title="Result" showBack />
        <div className="flex h-64 items-center justify-center px-4">
          <p className="text-body text-muted-foreground">No outfit to display. Try generating one first.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <HeaderBar
        title="Your Look"
        showBack
        right={<AiBadge label={`${Math.round(outfit.confidence * 100)}% match`} />}
      />

      <div className="space-y-6 px-4 pt-4 pb-8">
        {/* Items */}
        <div className="space-y-3">
          {outfit.items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="h-12 w-12 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <p className="text-body font-medium text-foreground">{item.name}</p>
                <p className="text-caption uppercase text-muted-foreground">{item.category}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Styling Notes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="rounded-lg border border-primary/20 bg-primary/5 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <AiBadge label="Styling Notes" />
          </div>
          <p className="text-body text-foreground">{outfit.stylingNotes}</p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex gap-3"
        >
          <Button
            onClick={() => {
              toast.success("Look saved!");
              navigate("/saved");
            }}
            className="flex-1 gap-2 rounded-xl py-6"
          >
            <Bookmark className="h-4 w-4" />
            Save Look
          </Button>
          <Button variant="outline" onClick={() => navigate("/generate")} className="gap-2 rounded-xl py-6">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => toast.info("Sharing coming soon")} className="gap-2 rounded-xl py-6">
            <Share2 className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </AppShell>
  );
}
