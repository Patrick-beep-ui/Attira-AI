import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTodaysLook } from "@/services/ai-service";
import { getPublicOutfits } from "@/services/outfit-service";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { GeneratedOutfit } from "@/services/ai-service";

interface FeedOutfit {
  id: string;
  user_id: string;
  created_at: string;
  is_public: boolean;
  composition_url: string | null;
  occasion: string | null;
  formality: string | null;
  styling_notes: string | null;
  published_at: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todaysLook = getTodaysLook();

  const [feed, setFeed] = useState<FeedOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      const { data, error } = await getPublicOutfits(20);
      if (error) {
        console.error("Failed to fetch feed:", error);
      } else {
        setFeed((data || []) as unknown as FeedOutfit[]);
      }
      setLoading(false);
    };
    fetchFeed();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      <HeaderBar title="Feed" />
      
      <div className="px-4 pt-14 pb-20">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-caption uppercase tracking-wider text-primary">Dressly</p>
          <h1 className="mt-1 font-display text-display-2 text-foreground">{greeting()}</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">{dateStr}</p>
        </div>

        {/* Generate Button */}
        <Button onClick={() => navigate("/generate")} className="w-full gap-2 rounded-xl py-6 mb-6">
          <Sparkles className="h-4 w-4" />
          Generate Your Outfit
        </Button>

        {/* Feed Section */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-display-3 text-foreground">Community Looks</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-body text-muted-foreground">No public outfits yet.</p>
              <p className="text-body-sm text-muted-foreground mt-1">
                Be the first to publish an outfit!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {feed.map((outfit) => (
                <FeedCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function adjustSvgForCard(svgString: string): string {
  const adjusted = svgString
    .replace(/width="500"/g, 'width="100%"')
    .replace(/height="600"/g, 'height="100%"');
  
  if (!adjusted.includes('style="background-color')) {
    return adjusted.replace('<svg', '<svg style="background-color: #DEDAD9"');
  }
  return adjusted;
}

function FeedCard({ outfit }: { outfit: FeedOutfit }) {
  const navigate = useNavigate();
  const compositionUrl = outfit.composition_url;
  const hasCanvas = !!compositionUrl;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
      onClick={() => navigate(`/outfit/${outfit.id}`)}
    >
      {/* User Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-body-sm font-medium text-primary">
            {outfit.occasion?.charAt(0).toUpperCase() || "O"}
          </span>
        </div>
        <div>
          <p className="text-body font-medium text-foreground">Outfit</p>
          <p className="text-caption text-muted-foreground">
            {outfit.published_at ? new Date(outfit.published_at).toLocaleDateString() : new Date(outfit.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Outfit Preview */}
      <div className="aspect-[5/6] bg-[#DEDAD9] flex items-center justify-center overflow-hidden">
        {hasCanvas ? (
          <div
            className="w-full h-full overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: adjustSvgForCard(
                decodeURIComponent(compositionUrl!.replace("data:image/svg+xml;utf8,", ""))
              )
            }}
          />
        ) : (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 w-16 rounded-lg bg-primary/10"
              />
            ))}
          </div>
        )}
      </div>

      {/* Outfit Info */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {outfit.occasion && <TagChip label={outfit.occasion} active />}
          {outfit.formality && <TagChip label={outfit.formality} active={false} />}
        </div>
        
        {outfit.styling_notes && (
          <p className="text-body-sm text-foreground line-clamp-2">
            {outfit.styling_notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <button className="flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground">
            <Heart className="h-4 w-4" />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
