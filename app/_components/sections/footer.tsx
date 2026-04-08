import { Separator } from "@/components/ui/separator";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconMail,
} from "@tabler/icons-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Learning Center", href: "/learning-center/dashboard" },
    { label: "Testimonials", href: "#testimonials" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Help Center", href: "/help" },
    { label: "Community", href: "/community" },
    { label: "FAQ", href: "#faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "License", href: "/license" },
  ],
};

const socialLinks = [
  { icon: IconBrandTwitter, href: "#", label: "Twitter" },
  { icon: IconBrandGithub, href: "#", label: "GitHub" },
  { icon: IconBrandLinkedin, href: "#", label: "LinkedIn" },
  { icon: IconMail, href: "mailto:hello@example.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Temporarily disabled - full footer content */}
        {/* <div className="grid gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  P
                </span>
              </div>
              <span className="text-xl font-bold">Portofun</span>
            </Link>
            <p className="max-w-sm text-muted-foreground">
              Empowering learners worldwide with high-quality education and
              cutting-edge learning tools.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label={social.label}
                  >
                    <Icon className="size-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Portofun. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div> */}

        {/* Temporary minimal footer - only copyright */}
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Portofun. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
