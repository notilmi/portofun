"use client";
import Link from "next/link";
import { DASHBOARD_ROUTES, DashboardRoute } from "./sidebar.constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function SidebarMenu({ href, label }: DashboardRoute) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        "w-full px-6 py-3 hover:bg-muted rounded-md block text-lg",
        pathname === href &&
          "bg-primary text-primary-foreground hover:bg-primary",
      )}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <div className="flex flex-col gap-1">
      {DASHBOARD_ROUTES.map((route) => (
        <SidebarMenu key={route.href} {...route} />
      ))}
    </div>
  );
}
