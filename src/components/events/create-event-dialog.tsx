"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { isStripeEnabled } from "@/lib/stripe";

export function CreateEventDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [priceCents, setPriceCents] = useState("0");
  const [stripePriceId, setStripePriceId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("events").insert({
      title,
      description,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      location: location || null,
      capacity: capacity ? parseInt(capacity, 10) : null,
      price_cents: parseInt(priceCents, 10) || 0,
      stripe_price_id: stripePriceId || null,
      created_by: user!.id,
      published: true,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Hold oprettet");
    setOpen(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="h-12 gap-2 bg-[#5B9BD5]">
          <Plus className="h-5 w-5" />
          Nyt hold
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Opret hold/arrangement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Titel</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="h-12" />
          </div>
          <div className="space-y-2">
            <Label>Beskrivelse</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Slut (valgfri)</Label>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sted</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-12" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Max deltagere (tom = ubegrænset)</Label>
              <Input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Pris (øre, 0 = gratis)</Label>
              <Input type="number" min="0" value={priceCents} onChange={(e) => setPriceCents(e.target.value)} className="h-12" />
            </div>
          </div>
          {isStripeEnabled() && (
            <div className="space-y-2">
              <Label>Stripe Price ID (valgfri)</Label>
              <Input value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} placeholder="price_..." />
            </div>
          )}
          <Button type="submit" disabled={loading} className="h-12 w-full bg-[#5B9BD5]">
            {loading ? "Opretter..." : "Opret"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
