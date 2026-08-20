"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { brand } from "@/lib/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n—${name} (${email})`);
    const phoneNumber = brand.whatsappNumber;
    window.open(`https://wa.me/${phoneNumber}?text=${body}&subject=${subject}`, "_blank");
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="c-name">Your name</Label>
        <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="c-email">Email</Label>
        <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="c-message">How can we help?</Label>
        <Textarea id="c-message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      <Button type="submit" className="gap-2">
        <MessageCircle size={16} /> Send via WhatsApp
      </Button>
      {sent && (
        <p className="text-sm text-emerald-700">
          Opening a WhatsApp chat with your message — we usually reply within a few hours (Mon–Sat).
        </p>
      )}
    </form>
  );
}