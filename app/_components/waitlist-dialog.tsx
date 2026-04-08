"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IconSparkles } from "@tabler/icons-react";

interface WaitlistDialogProps {
  children: React.ReactNode;
}

export function WaitlistDialog({ children }: WaitlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement waitlist submission logic
    console.log("Waitlist submission:", { name, email });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setOpen(false);
    setName("");
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconSparkles className="size-5 text-primary" />
            Daftar Waitlist Portofun
          </DialogTitle>
          <DialogDescription>
            Platform kami sedang dalam pengembangan. Daftarkan email Anda untuk
            mendapatkan akses awal dan notifikasi peluncuran!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Nama Lengkap</FieldLabel>
              <Input
                type="text"
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
          </FieldGroup>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Mendaftar..." : "Daftar Sekarang"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Kami akan mengirimkan update dan akses awal ke email Anda
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
