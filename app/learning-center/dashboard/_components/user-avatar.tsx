"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@/server/better-auth/auth.client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type UserAvatarProps = {
  id: string;
  name: string;
  image?: string;
  email: string;
};

export default function UserAvatar({ name, image, email }: UserAvatarProps) {
  const { setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth"); // redirect to login page
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={
            "flex items-center gap-4 p-4 rounded-md hover:bg-secondary cursor-pointer"
          }
        >
          <Avatar>
            <AvatarImage src={image} alt={name} className="grayscale" />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className={"hidden md:flex flex-col"}>
            <p className={"text-sm font-medium"}>{name}</p>
            <p className={"text-xs text-muted-foreground"}>{email}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <Link href={"/dashboard/management"}>
            <DropdownMenuItem>
              <UserIcon className={"h-4 w-4"} />
              Profile
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className={"text-red-500"} onClick={handleLogout}>
            <LogOutIcon className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <SunIcon className={"size-4"} />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <MoonIcon className={"size-4"} />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <MonitorIcon className={"size-4"} />
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
