import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2, Save } from "lucide-react";

interface WardrobeItem {
  id: string;
  name: string;
  category_id: number | null;
  category_name?: string;
  color: string | null;
  fabric?: string | null;
  size?: string | null;
  brand?: string | null;
  image_url: string | null;
}

interface Props {
  item: WardrobeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}


export function WardrobeItemDetail({ item, open, onOpenChange, onUpdated }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync form when item changes (robust to refactors; respond to prop changes)
  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setColor(item.color ?? "");
    setFabric(item.fabric ?? "");
    setSize(item.size ?? "");
    setBrand(item.brand ?? "");
  }, [item?.id, item?.name, item?.color, item?.fabric, item?.size, item?.brand]);

  if (!item) return null;

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");

    setSaving(true);

    const { data, error } = await supabase
      .from("wardrobe_items")
      .update({
        name: name.trim(),
        color: color.trim() || null,
        fabric: fabric.trim() || null,
        size: size.trim() || null,
        brand: brand.trim() || null,
      })
      .eq("id", item.id)
      .select();

    setSaving(false);

    if (error) return toast.error(error.message);

    console.log("Updated rows:", data);

    if (!data || data.length === 0) {
      toast.error("Update failed (no rows affected)");
      return;
    }

    toast.success("Item updated");
    onOpenChange(false);
    onUpdated();
  };

  const handleDelete = async () => {
    setDeleting(true);
    // Delete image from storage if exists
    if (item.image_url) {
      const path = item.image_url.split("/wardrobe-images/")[1];
      if (path) await supabase.storage.from("wardrobe-images").remove([path]);
    }
    const { error } = await supabase.from("wardrobe_items").delete().eq("id", item.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Item deleted");
    onOpenChange(false);
    onUpdated();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-6 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-display-3">Item Details</SheetTitle>
        </SheetHeader>

        {/* Large Image */}
        <div className="mb-5 flex items-center justify-center overflow-hidden rounded-xl bg-muted/50 border border-border" style={{ minHeight: 200 }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="max-h-72 w-full object-contain" />
          ) : (
            <div className="h-24 w-24 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.color || "#ccc" }} />
          )}
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-body-sm">Name</Label>
            <Input className="rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-body-sm">Color</Label>
            <Input className="rounded-xl" placeholder="e.g. Navy Blue" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-body-sm">Fabric</Label>
            <Input className="rounded-xl" placeholder="e.g. Cotton, Wool" value={fabric} onChange={(e) => setFabric(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-body-sm">Size</Label>
            <Input className="rounded-xl" placeholder="e.g. M, 32W 30L" value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-body-sm">Brand</Label>
            <Input className="rounded-xl" placeholder="e.g. Uniqlo, Nike" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <p className="text-caption text-muted-foreground">Category: {item.category_name || "Unknown"}</p>

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl py-5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full rounded-xl py-5">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 max-w-sm rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently remove this item from your wardrobe.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-xl">
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
