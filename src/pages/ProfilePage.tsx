import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/TagChip";
import { User, Loader2, Edit2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProfileByUsername, getPublicOutfitsByUser, updateProfileBasic, PublicProfile, PublicOutfit } from "@/services/profile-service";
import { toast } from "sonner";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwnProfile = !username || (user && username === "me");
  const isViewingOthers = !!username && username !== "me";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [outfits, setOutfits] = useState<PublicOutfit[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    profile_picture_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, [username, user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const targetUsername = !username || username === "me" 
        ? null 
        : username;

      let profileData: PublicProfile | null = null;

      if (targetUsername) {
        profileData = await getProfileByUsername(targetUsername);
      } else if (user) {
        const { getProfile } = await import("@/services/profile-service");
        const fullProfile = await getProfile(user.id);
        if (fullProfile) {
          profileData = {
            id: fullProfile.id,
            user_id: fullProfile.user_id,
            username: (fullProfile as any).username || null,
            first_name: fullProfile.first_name || null,
            last_name: fullProfile.last_name || null,
            profile_picture_url: fullProfile.profile_picture_url || null,
            created_at: fullProfile.created_at,
            style_preferences: [],
          };
        }
      }

      if (!profileData) {
        toast.error(t("profile.profile") + " " + t("common.error").toLowerCase());
        navigate("/");
        return;
      }

      setProfile(profileData);
      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        username: profileData.username || "",
        profile_picture_url: profileData.profile_picture_url || "",
      });

      const outfitsData = await getPublicOutfitsByUser(profileData.user_id);
      setOutfits(outfitsData);
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error(t("profile.profile") + " " + t("common.error").toLowerCase());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfileBasic(user.id, {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        username: formData.username || null,
        profile_picture_url: formData.profile_picture_url || null,
      });
      toast.success(t("common.success") + "!");
      setEditing(false);
      loadProfile();
    } catch (err) {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.first_name || profile?.last_name 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() 
    : t("profile.anonymous");

  const handleOutfitClick = (outfitId: string) => {
    navigate(`/outfit/${outfitId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          {t("profile.back")}
        </Button>
        {isOwnProfile && !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            {t("profile.edit")}
          </Button>
        )}
      </div>

      <div className="px-4 py-6">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          {/* Avatar */}
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            {profile?.profile_picture_url ? (
              <img 
                src={profile.profile_picture_url} 
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t("profile.first_name")}
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-body text-foreground"
              />
              <input
                type="text"
                placeholder={t("profile.last_name")}
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-body text-foreground"
              />
              <input
                type="text"
                placeholder={t("profile.username")}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-body text-foreground"
              />
              <input
                type="text"
                placeholder={t("profile.profile_picture_url")}
                value={formData.profile_picture_url}
                onChange={(e) => setFormData({ ...formData, profile_picture_url: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-body text-foreground"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      first_name: profile?.first_name || "",
                      last_name: profile?.last_name || "",
                      username: profile?.username || "",
                      profile_picture_url: profile?.profile_picture_url || "",
                    });
                  }}
                >
                  {t("profile.cancel")}
                </Button>
                <Button 
                  className="flex-1 bg-primary text-primary-foreground" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.save")}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-display-2 text-foreground">{displayName}</h1>
              {profile?.username && (
                <p className="text-body text-muted-foreground">@{profile.username}</p>
              )}
              {profile?.style_preferences && profile.style_preferences.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {profile.style_preferences.map((style) => (
                    <TagChip key={style} label={style} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Published Outfits */}
        <div className="border-t border-border pt-6">
          <h2 className="font-display text-display-3 text-foreground mb-4">
            {t("profile.published_looks")}
          </h2>
          
          {outfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-body text-muted-foreground">
                {t("profile.no_published")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  onClick={() => handleOutfitClick(outfit.id)}
                  className="aspect-[3/4] cursor-pointer overflow-hidden rounded-lg bg-[#DEDAD9]"
                >
                  {outfit.composition_url?.startsWith("data:image/svg+xml") ? (
                    <div
                      className="h-full w-full overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const svg = decodeURIComponent(outfit.composition_url.replace("data:image/svg+xml;utf8,", ""));
                          return svg.replace(/width="500"/g, 'width="100%"').replace(/height="600"/g, 'height="100%"').replace(/<svg/, '<svg style="background-color: #DEDAD9"');
                        })()
                      }}
                    />
                  ) : outfit.composition_url ? (
                    <img
                      src={outfit.composition_url}
                      alt="Outfit"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}