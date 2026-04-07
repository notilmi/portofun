"use client";
import Link from "next/link";
import { DashboardRoute, getDashboardRoutes } from "./sidebar.constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/auth.client";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="flex flex-col gap-1">
      {isPending
        ? Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-md" />
          ))
        : getDashboardRoutes(session?.user?.role === "admin").map((route) => (
            <SidebarMenu key={route.href} {...route} />
          ))}
    </div>
  );
}
