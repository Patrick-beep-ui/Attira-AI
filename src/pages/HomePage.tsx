import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTodaysLook } from "@/services/ai-service";
import { getPublicOutfits, toggleLike, getLikeCount, getUserLikes } from "@/services/outfit-service";
import { CommentDialog } from "@/components/CommentDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
  like_count?: number;
  comment_count?: number;
  profiles?: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    profile_picture_url: string | null;
  } | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const { t, tValue, language } = useLanguage();
  const navigate = useNavigate();
  const todaysLook = getTodaysLook();

  const [feed, setFeed] = useState<FeedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const updateCommentCount = (outfitId: string, delta: number) => {
    setCommentCounts(prev => ({
      ...prev,
      [outfitId]: (prev[outfitId] || 0) + delta
    }));
    setFeed(prev => prev.map(o => 
      o.id === outfitId 
        ? { ...o, comment_count: (o.comment_count || 0) + delta }
        : o
    ));
  };

useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      const { data, error } = await getPublicOutfits(20);
      if (error) {
        console.error("Failed to fetch feed:", error);
      } else {
        const outfits = data as unknown as FeedOutfit[];
        setFeed(outfits);
        
        const counts: Record<string, number> = {};
        const commentCountsMap: Record<string, number> = {};
        for (const o of outfits) {
          const { count } = await getLikeCount(o.id);
          counts[o.id] = count;
          commentCountsMap[o.id] = o.comment_count || 0;
        }
        setLikeCounts(counts);
        setCommentCounts(commentCountsMap);
        
        if (user) {
          const ids = outfits.map((o) => o.id);
          const liked = await getUserLikes(user.id, ids);
          setUserLikes(liked);
        }
      }
      setLoading(false);
    };
    fetchFeed();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("home.greeting_morning");
    if (h < 18) return t("home.greeting_afternoon");
    return t("home.greeting_evening");
  };

  const dateStr = new Date().toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).replace(/^./, (c) => c.toUpperCase());

  return (
    <AppShell>
      <HeaderBar title={t("home.feed")} />
      
      <div className="px-4 pt-14 pb-20">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-caption uppercase tracking-wider text-primary">Attira</p>
          <h1 className="mt-1 font-display text-display-2 text-foreground">{greeting()}</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">{dateStr}</p>
        </div>

        {/* Generate Button */}
        <Button onClick={() => navigate("/generate")} className="w-full gap-2 rounded-xl py-6 mb-6">
          <Sparkles className="h-4 w-4" />
          {t("home.generate_outfit")}
        </Button>

        {/* Feed Section */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-display-3 text-foreground">{t("home.community_looks")}</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-body text-muted-foreground">{t("home.no_outfits")}</p>
              <p className="text-body-sm text-muted-foreground mt-1">
                {t("home.be_first")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {feed.map((outfit) => (
                <FeedCard 
                  key={outfit.id} 
                  outfit={outfit} 
                  isLiked={userLikes.includes(outfit.id)}
                  likeCount={likeCounts[outfit.id] || 0}
                  commentCount={commentCounts[outfit.id] || 0}
                  outfitOwnerId={outfit.user_id}
                  setUserLikes={setUserLikes}
                  setLikeCounts={setLikeCounts}
                  onCommentChange={updateCommentCount}
                />
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

function FeedCard({ 
  outfit, 
  isLiked: initialIsLiked, 
  likeCount: initialLikeCount,
  commentCount: initialCommentCount,
  outfitOwnerId,
  setUserLikes,
  setLikeCounts,
  onCommentChange
}: { 
  outfit: FeedOutfit; 
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  outfitOwnerId: string;
  setUserLikes: React.Dispatch<React.SetStateAction<string[]>>;
  setLikeCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onCommentChange: (outfitId: string, delta: number) => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tValue } = useLanguage();
  const compositionUrl = outfit.composition_url;
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(initialLikeCount);
    setCommentCount(initialCommentCount);
  }, [initialIsLiked, initialLikeCount, initialCommentCount]);
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || loading) return;
    
    const wasLiked = isLiked;
    const prevCount = likeCount;
    
    setLoading(true);
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);
    setUserLikes(prev => wasLiked 
      ? prev.filter(id => id !== outfit.id) 
      : [...prev, outfit.id]
    );
    setLikeCounts(prev => ({ ...prev, [outfit.id]: wasLiked ? prevCount - 1 : prevCount + 1 }));
    
    try {
      await toggleLike(user.id, outfit.id);
    } catch (err) {
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
      setUserLikes(prev => wasLiked 
        ? [...prev, outfit.id] 
        : prev.filter(id => id !== outfit.id)
      );
      setLikeCounts(prev => ({ ...prev, [outfit.id]: prevCount }));
      toast.error("Failed to like");
    } finally {
      setLoading(false);
    }
  };
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
        {outfit.profiles?.profile_picture_url ? (
          <img 
            src={outfit.profiles.profile_picture_url} 
            alt="Profile" 
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-body-sm font-medium text-primary">
              {outfit.profiles?.username?.slice(0, 2).toUpperCase() || "O"}
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (outfit.profiles?.username) {
              navigate(`/u/${outfit.profiles.username}`);
            }
          }}
          className="flex-1 text-left"
        >
          <p className="text-body font-medium text-foreground">@{outfit.profiles?.username || "user"}</p>
          <p className="text-caption text-muted-foreground">
            {outfit.published_at ? new Date(outfit.published_at).toLocaleDateString() : new Date(outfit.created_at).toLocaleDateString()}
          </p>
        </button>
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
          {outfit.occasion && <TagChip label={tValue("occasions", outfit.occasion)} active />}
          {outfit.formality && <TagChip label={tValue("formality", outfit.formality)} active={false} />}
        </div>
        
        {outfit.styling_notes && (
          <p className="text-body-sm text-foreground line-clamp-2">
            {outfit.styling_notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-body-sm ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount > 0 ? likeCount : t("home.like")}</span>
          </button>
          <CommentDialog 
            outfitId={outfit.id} 
            outfitOwnerId={outfitOwnerId}
            commentCount={commentCount}
            onCommentAdded={() => onCommentChange(outfit.id, 1)}
          />
        </div>
      </div>
    </motion.div>
  );
}
