import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import { Plus, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["All", "Tops", "Bottoms", "Shoes", "Accessories", "Outerwear"];

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
}

const MOCK_ITEMS: WardrobeItem[] = [
  { id: "1", name: "Navy Blazer", category: "Outerwear", color: "#2C3442" },
  { id: "2", name: "White Cotton Shirt", category: "Tops", color: "#FAFAFA" },
  { id: "3", name: "Charcoal Trousers", category: "Bottoms", color: "#3A3A3A" },
  { id: "4", name: "Brown Loafers", category: "Shoes", color: "#8B6F47" },
  { id: "5", name: "Linen Button-Up", category: "Tops", color: "#E8DDD0" },
  { id: "6", name: "Canvas Sneakers", category: "Shoes", color: "#F5F5F5" },
  { id: "7", name: "Silk Blouse", category: "Tops", color: "#1A1A1A" },
  { id: "8", name: "Gold Earrings", category: "Accessories", color: "#C4A265" },
];

export default function Wardrobe() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items] = useState(MOCK_ITEMS);
  const [addOpen, setAddOpen] = useState(false);

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
        {filtered.map((item) => (
          <div key={item.id} className="animate-fade-slide-up overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex h-32 items-center justify-center bg-muted/50">
              <div className="h-16 w-16 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.color }} />
            </div>
            <div className="p-3">
              <p className="text-body-sm font-medium text-foreground">{item.name}</p>
              <p className="text-caption text-muted-foreground">{item.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
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
            <div className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-6 w-6" />
                <span className="text-body-sm">Upload Photo</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">Name</Label>
              <Input placeholder="e.g. Blue Oxford Shirt" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-body-sm">Category</Label>
              <Select>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c !== "All").map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setAddOpen(false)} className="w-full rounded-xl py-5">
              Add to Wardrobe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
