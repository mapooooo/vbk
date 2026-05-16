"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

export function MembershipApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [dogInfo, setDogInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        phone: phone || null,
        message,
        dog_info: dogInfo || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Noget gik galt");
      return;
    }

    setSubmitted(true);
    toast.success("Ansøgning sendt!");
  }

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-medium">Tak for din ansøgning!</p>
        <p className="text-muted-foreground">
          Bestyrelsen gennemgår den og vender tilbage på e-mail, når du kan få
          adgang til medlemsplatformen.
        </p>
        <Link href="/" className="inline-block text-[#5B9BD5] hover:underline">
          Tilbage til forsiden
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Fulde navn</Label>
        <Input
          id="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="h-12 text-base"
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 text-base"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon (valgfri)</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 text-base"
          autoComplete="tel"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dog">Din hund — navn og race (valgfri)</Label>
        <Input
          id="dog"
          value={dogInfo}
          onChange={(e) => setDogInfo(e.target.value)}
          placeholder="Fx Max, schæferhund"
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Kort om dig og hvorfor du vil være med</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Fx erfaring med hund, hvad du håber at få ud af klubben..."
          className="text-base"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-[#5B9BD5] text-base hover:bg-[#4a8ac4]"
      >
        {loading ? "Sender..." : "Send ansøgning"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Har du allerede fået invitation?{" "}
        <Link href="/log-ind" className="text-[#5B9BD5] hover:underline">
          Log ind her
        </Link>
      </p>
    </form>
  );
}
