import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/server/actions/auth";
import UserAvatar from "./_components/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "./_components/sidebar";
import { FolderIcon } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <TooltipProvider>
      <div className="h-(--navbar-height) w-full flex justify-between gap-4 py-4 px-4 md:px-8 items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Portofun</h1>
        </div>
        {user && (
          <UserAvatar
            id={user.id}
            name={user.name}
            email={user.email}
            image={user.image ?? undefined}
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6">
        <div className="h-[calc(100dvh-var(--navbar-height))] hidden md:flex flex-col gap-4 overflow-y-auto p-4">
          <Sidebar />
        </div>
        <ScrollArea className="max-w-6xl w-full h-[calc(100dvh-var(--navbar-height))] overflow-auto mx-auto col-span-5 p-4 ">
          <div>{children}</div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
