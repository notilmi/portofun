"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur">
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
          <Button variant="ghost" asChild>
            <Link href="/auth">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/learning-center/dashboard">Mulai Belajar Gratis</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <IconMenu2 className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 py-6">
              {/* Mobile Logo */}
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={handleLinkClick}
              >
                <Image
                  src="/portofun.svg"
                  alt="Portofun"
                  width={32}
                  height={32}
                  className="size-8"
                />
                <span className="text-xl font-bold">Portofun</span>
              </Link>

              {/* Mobile Links */}
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile CTA */}
              <div className="flex flex-col gap-3 pt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth" onClick={handleLinkClick}>
                    Masuk
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link
                    href="/learning-center/dashboard"
                    onClick={handleLinkClick}
                  >
                    Mulai Belajar Gratis
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
