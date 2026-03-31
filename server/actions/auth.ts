import { auth } from "../better-auth/auth";
import { headers } from "next/headers";
import { ServerActionError } from "./_common";

export async function getSession(adminOnly?: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: {
      disableCookieCache: true,
    },
  });

  if (!session) {
    return null;
  }

  if (adminOnly && !(session.user.role as string).includes("admin")) {
    return null;
  }

  return session.user;
}

export async function getSessionThrowable(adminOnly?: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: {
      disableCookieCache: true,
    },
  });

  if (!session) {
    throw new ServerActionError("Unauthorized", "UNAUTHORIZED");
  }

  if (adminOnly && !(session.user.role as string).includes("admin")) {
    throw new ServerActionError("Unauthorized", "UNAUTHORIZED");
  }

  return session.user;
}
