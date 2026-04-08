"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { IconMenu2 } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WaitlistDialog } from "../waitlist-dialog";

const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "Tentang", href: "#about" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Harga", href: "#pricing" },
  { label: "Testimoni", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="w-full bg-background/95 backdrop-blur">
      <nav className="container mx-auto flex h-24 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/*<h1 className="text-2xl font-bold">Portofun</h1>*/}
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img src={"/portofun.svg"} alt="Portofun" className="w-32" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <WaitlistDialog>
            <Button>Daftar Waitlist</Button>
          </WaitlistDialog>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <IconMenu2 className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-100">
            <div className="flex h-full flex-col gap-8 p-6">
              {/* Mobile Logo */}
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={handleLinkClick}
              >
                {/*eslint-disable-next-line @next/next/no-img-element*/}
                <img src={"/portofun.svg"} alt="Portofun" className="w-24" />
              </Link>

              {/* Mobile Links */}
              <nav className="flex flex-1 flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className="rounded-lg py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile CTA */}
              <div className="flex flex-col gap-3 border-t pt-6">
                <WaitlistDialog>
                  <Button className="w-full" size="lg">
                    Daftar Waitlist
                  </Button>
                </WaitlistDialog>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
