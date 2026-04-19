import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import { Plus, Camera, Loader2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { WardrobeItemDetail } from "@/components/WardrobeItemDetails";
import { fetchWardrobeItems } from "@/lib/services/wardrobeService";
import { removeBackground } from "@/services/image-composition-service";
import { CameraCapture, CameraMode } from "@/components/CameraCapture";
import { ColorPicker } from "@/components/ColorPicker";
//import * as ColorThief from "colorthief";
//import { getColorSync } from "colorthief";
//import { rgbToHex } from "@/lib/colorUtils";
import { FastAverageColor } from "fast-average-color";
import namer from "color-namer";


// Categories state (fetched from DB)
interface Category {
  id: number;
  name: string;
  parent_category_id: number | null;
}

interface WardrobeItem {
  id: string;
  name: string;
  category_id: number | null;
  color: string | null;
  image_url: string | null;
  processed_image_url?: string | null; 
  processing_status?: string | null; 
  category_name?: string;
}

type DetectedColor = {
  hex: string;
  name: string;
};

export default function Wardrobe() {
  const { user } = useAuth();
  const { t, tValue } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<number>(0); // 0 = All
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailItem, setDetailItem] = useState<WardrobeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera state
  const [cameraMode, setCameraMode] = useState<CameraMode>("flatlay");
  const [cameraOpen, setCameraOpen] = useState(false);

  // Color detection state
  const [detectedColorHex, setDetectedColorHex] = useState<string | null>(null);
  const [colorDetectAttempted, setColorDetectAttempted] = useState(false);
  const [detectedPalette, setDetectedPalette] = useState<DetectedColor[]>([]);

    const hasSubcategories = parentCategoryId
    ? subCategories.some((c) => c.parent_category_id === parentCategoryId)
    : false;

  const fetchItems = async () => {
    if (!user) return;
    const items = await fetchWardrobeItems();

    if (items) {
      setItems(items);
    }
    setLoading(false);
  };


  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("clothing_categories").select("id, name, parent_category_id");
      if (data) {
        setCategories(data);
        setParentCategories(data.filter((c: Category) => c.parent_category_id === null));
        setSubCategories(data.filter((c: Category) => c.parent_category_id !== null));
      }
      console.log("Fetched categories:", categories);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [user]);

    // 🎯 PALETTE EXTRACTION
    const extractPalette = (img: HTMLImageElement) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return [];

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const colorMap = new Map<string, number>();
      const step = 20;

      for (let i = 0; i < data.length; i += 4 * step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // ✅ skip transparent pixels (background removed)
        if (a < 50) continue;

        // ✅ quantization (reduce noise)
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;

        const hex = `#${[qr, qg, qb]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`;

        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }

      return [...colorMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([hex]) => hex)
        .slice(0, 5);
    };

    const fac = new FastAverageColor();

    const detectColorFromImage = (imageData: string) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageData;

      img.onload = async () => {
        try {
          // 🔥 dominant color
          const dominant = await fac.getColorAsync(img);

          const dominantHex = `#${[dominant.value[0], dominant.value[1], dominant.value[2]]
            .map((x) => x.toString(16).padStart(2, "0"))
            .join("")}`;

          const palette = extractPalette(img);

          const allColors = [dominantHex, ...palette];

          const unique = [...new Set(allColors)];

          const formatted: DetectedColor[] = unique.map((hex) => {
            const result = namer(hex);
            return {
              hex,
              name: result.ntc?.[0]?.name || hex,
            };
          });

          setDetectedPalette(formatted);

          if (formatted.length > 0) {
            setColor(formatted[0].name);
          }
        } catch (err) {
          console.error("Color detection failed:", err);
        }
      };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageFile(file);

      const reader = new FileReader();

      reader.onload = async (ev) => {
        const imageData = ev.target?.result as string;

        try {
          setImageProcessing(true);
          // 🔥 REMOVE BACKGROUND FIRST
          const blob = await removeBackground(imageData);
          const cleanUrl = URL.createObjectURL(blob);

          setImagePreview(cleanUrl);

          // ✅ detect AFTER cleanup
          detectColorFromImage(cleanUrl);
        } catch (err) {
          console.error(err);

          // fallback to original
          setImagePreview(imageData);
          detectColorFromImage(imageData);
        }
        finally {
          setImageProcessing(false);
        }
      };

      reader.readAsDataURL(file);
    };

  const resetForm = () => {
    setName("");
    setParentCategoryId(null);
    setCategoryId(null);
    setColor("");
    setFabric("");
    setSize("");
    setBrand("");
    setImageFile(null);
    setImagePreview(null);
    setProcessedImage(null);
    setCameraOpen(false);
    setDetectedColorHex(null);
    setColorDetectAttempted(false);
  };

    const handleCameraCapture = async (file: File) => {
      setImageFile(file);

      const reader = new FileReader();

      reader.onload = async (ev) => {
        const imageData = ev.target?.result as string;

        try {
          setImageProcessing(true);

          const blob = await removeBackground(imageData);
          const cleanUrl = URL.createObjectURL(blob);

          setImagePreview(cleanUrl);
          detectColorFromImage(cleanUrl);
        } catch (err) {
          console.error(err);
          setImagePreview(imageData);
          detectColorFromImage(imageData);
        }
        finally {
          setImageProcessing(false);
        }
      };

      reader.readAsDataURL(file);

      setCameraOpen(false);
    };

  const handleAdd = async () => {
    if (!user) return toast.error("Please sign in first");

    const hasSubcategory = parentCategoryId
      ? subCategories.some((c) => c.parent_category_id === parentCategoryId)
      : false;

    if (!name || !parentCategoryId)
      return toast.error("Name, and parent category are required");

    if (hasSubcategory && !categoryId)
      return toast.error("subcategory is required for this parent category");

    setSaving(true);

    let image_url: string | null = null;

    // ✅ 1. Upload ORIGINAL image
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("wardrobe-images")
        .upload(path, imageFile);

      if (uploadError) {
        setSaving(false);
        return toast.error("Image upload failed: " + uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from("wardrobe-images")
        .getPublicUrl(path);

      image_url = urlData.publicUrl;
    }

    // ✅ 2. Insert item FIRST (fast UX)
    const { data: insertedItem, error } = await supabase
      .from("wardrobe_items")
      .insert({
        user_id: user.id,
        name,
        category_id: hasSubcategory ? categoryId : parentCategoryId,
        color: color || null,
        fabric: fabric || null,
        size: size || null,
        brand: brand || null,
        image_url,
        processing_status: "pending", // ✅ NEW
      })
      .select()
      .single();

    if (error || !insertedItem) {
      setSaving(false);
      return toast.error(error?.message || "Insert failed");
    }

    // ✅ UI responds instantly
    toast.success("Item added!");
    resetForm();
    setAddOpen(false);
    fetchItems();
    setSaving(false);

    // 🚀 3. PROCESS IMAGE ASYNC (NON-BLOCKING)
    if (imagePreview) {
      removeBackground(imagePreview)
        .then(async (blob) => {
          const path = `${user.id}/${crypto.randomUUID()}.png`;

          const { error: uploadError } = await supabase.storage
            .from("wardrobe-images")
            .upload(path, blob, {
              contentType: "image/png",
            });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("wardrobe-images")
            .getPublicUrl(path);

          // ✅ update item with processed image
          await supabase
            .from("wardrobe_items")
            .update({
              processed_image_url: data.publicUrl,
              processing_status: "done",
            })
            .eq("id", insertedItem.id);

        })
        .catch(async (err) => {
          console.error("Async BG removal failed:", err);

          await supabase
            .from("wardrobe_items")
            .update({
              processing_status: "failed",
            })
            .eq("id", insertedItem.id);
        });
    }
  };

  // Filtering: if a parent category is selected, show all items whose category is a subcategory of that parent
  const filtered = activeCategory === 0
    ? items
    : items.filter((i) => {
        // Subcategories of the selected parent
        const subIds = subCategories
          .filter((c) => c.parent_category_id === activeCategory)
          .map((c) => c.id);

        return (
          subIds.includes(i.category_id!) || // subcategory match
          i.category_id === activeCategory   // parent match (legacy or no-subcategory)
        );
      });

      const testRemoveBg = async () => {
    if (!imagePreview) return;

    try {
      const blob = await removeBackground(imagePreview);

      const url = URL.createObjectURL(blob);

      console.log("Processed image:", url);

      // 👇 show result instantly
      setImagePreview(url);
      //setProcessedImage(url);

    } catch (err) {
      console.error(err);
      toast.error("Background removal failed");
    }
  };

  return (
    <AppShell>
      <HeaderBar title={t("wardrobe.wardrobe")} right={<span className="text-body-sm text-muted-foreground">{items.length} items</span>} />

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
        <TagChip key={0} label={t("wardrobe.all")} active={activeCategory === 0} onClick={() => setActiveCategory(0)} />
        {parentCategories.map((c) => (
          <TagChip key={c.id} label={tValue("categories", c.name)} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-24 pt-3">
        {loading ? (
          <div className="col-span-2 flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="col-span-2 py-12 text-center text-body-sm text-muted-foreground">
            {t("wardrobe.no_items")}
          </p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} 
            onClick={() => { setDetailItem(item); setDetailOpen(true); }}
            className="animate-fade-slide-up overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="flex h-32 items-center justify-center bg-muted/50 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.color || "#ccc" }} />
                )}
              </div>
              <div className="p-3">
                <p className="text-body-sm font-medium text-foreground">{item.name}</p>
                <p className="text-caption text-muted-foreground">{item.category_name ? tValue("categories", item.category_name) : ""}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild>
          <button className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
            <Plus className="h-6 w-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="mx-4 max-w-sm rounded-2xl max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="font-display text-display-3">{t("wardrobe.add_item")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 64px)' }}>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            
            {cameraOpen ? (
              <CameraCapture
                mode={cameraMode}
                onCapture={handleCameraCapture}
                onCancel={() => setCameraOpen(false)}
              />
            ) : imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover rounded-xl" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 px-2 text-white bg-black/50 hover:bg-black/70"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setProcessedImage(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {imageProcessing ? (
                  <div className="col-span-2 flex items-center justify-center h-24 rounded-xl border border-border bg-muted/30">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-body-sm text-muted-foreground">{t("wardrobe.upload")}</span>
                    </button>

                    <button
                      onClick={() => setCameraOpen(true)}
                      className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30"
                    >
                      <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span className="text-body-sm text-muted-foreground">{t("wardrobe.camera")}</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {processedImage && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Background Removed:</p>
                <img
                  src={processedImage}
                  alt="Processed"
                  className="h-32 w-full object-contain rounded-lg border bg-muted"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.name")}</Label>
              <Input placeholder={t("wardrobe.name_placeholder")} className="rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.category")}</Label>
              <Select 
              value={parentCategoryId ? String(parentCategoryId) : ""} 
              onValueChange={(val) => {
                const parentId = Number(val);
                setParentCategoryId(Number(val));
                setCategoryId(null); // Reset subcategory

                const subs = subCategories.filter(
                  (c) => c.parent_category_id === parentId
                );

                setCategoryId(subs.length > 0 ? subs[0].id : null);

              }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t("wardrobe.select_category")} /></SelectTrigger>
                <SelectContent>
                  {parentCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{tValue("categories", c.name)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.subcategory")}</Label>
              <Select 
              value={categoryId ? String(categoryId) : ""}
               onValueChange={(val) => setCategoryId(Number(val))} 
                disabled={!hasSubcategories}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t("wardrobe.select_category")} /></SelectTrigger>
                <SelectContent>
                  {subCategories.filter((c) => c.parent_category_id === parentCategoryId).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{tValue("categories", c.name)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {detectedPalette.length > 0 && (
            <div className="space-y-2">
              <Label>{t("wardrobe.detected_colors")}</Label>

              <div className="flex gap-2 flex-wrap">
                {detectedPalette.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColor(c.name)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${
                      color === c.name ? "border-primary" : "border-border"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <ColorPicker value={color} onChange={setColor} />
            <div className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.fabric")} <span className="text-muted-foreground">{t("wardrobe.optional_recommended")}</span></Label>
              <Input placeholder={t("wardrobe.fabric_placeholder")} className="rounded-xl" value={fabric} onChange={(e) => setFabric(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.size")} <span className="text-muted-foreground">{t("wardrobe.optional_recommended")}</span></Label>
              <Input placeholder={t("wardrobe.size_placeholder")} className="rounded-xl" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.brand")} <span className="text-muted-foreground">{t("wardrobe.optional_recommended")}</span></Label>
              <Input placeholder={t("wardrobe.brand_placeholder")} className="rounded-xl" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              {/*
              <Button onClick={testRemoveBg} variant="secondary">
                Test Remove BG
              </Button>
              */}
            </div>
            <Button onClick={handleAdd} disabled={saving} className="w-full rounded-xl py-5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? t("wardrobe.adding") : t("wardrobe.add_to_wardrobe")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <WardrobeItemDetail
        item={detailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={fetchItems}
      />
    </AppShell>
  );
}