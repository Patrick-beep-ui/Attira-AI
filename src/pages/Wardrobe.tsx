import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import { Plus, Camera, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { WardrobeItemDetail } from "@/components/WardrobeItemDetails";

const categories = ["All", "Tops", "Bottoms", "Shoes", "Accessories", "Outerwear"];

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  image_url: string | null;
}

export default function Wardrobe() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailItem, setDetailItem] = useState<WardrobeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wardrobe_items")
      .select("id, name, category, color, image_url")
      .order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setColor("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAdd = async () => {
    if (!user) return toast.error("Please sign in first");
    if (!name || !category) return toast.error("Name and category are required");

    setSaving(true);
    let image_url: string | null = null;

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

    const { error } = await supabase.from("wardrobe_items").insert({
      user_id: user.id,
      name,
      category,
      color: color || null,
      image_url,
    });

    setSaving(false);
    if (error) return toast.error(error.message);

    toast.success("Item added!");
    resetForm();
    setAddOpen(false);
    fetchItems();
  };

  const filtered = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <AppShell>
      <HeaderBar title="Wardrobe" right={<span className="text-body-sm text-muted-foreground">{items.length} items</span>} />

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
        {categories.map((c) => (
          <TagChip key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
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
            No items yet. Tap + to add your first piece.
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
                <p className="text-caption text-muted-foreground">{item.category}</p>
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
        <DialogContent className="mx-4 max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-display-3">Add Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30 overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="h-6 w-6" />
                  <span className="text-body-sm">Upload Photo</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">Name</Label>
              <Input placeholder="e.g. Blue Oxford Shirt" className="rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c !== "All").map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">Color (optional)</Label>
              <Input placeholder="e.g. Navy Blue" className="rounded-xl" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <Button onClick={handleAdd} disabled={saving} className="w-full rounded-xl py-5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? "Adding..." : "Add to Wardrobe"}
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
