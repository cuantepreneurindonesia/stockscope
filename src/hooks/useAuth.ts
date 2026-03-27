"use client";

import type { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";

import type { AuthUser } from "@/lib/auth/types";

export interface UseAuthReturn {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: typeof signIn;
  signOut: typeof signOut;
  user: AuthUser | null;
}

/**
 * Thin wrapper around next-auth useSession with strict typing.
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const user: AuthUser | null =
    session?.user && "plan" in session.user
      ? {
          id: (session.user as { id?: string }).id ?? "",
          email: session.user.email ?? null,
          name: session.user.name ?? null,
          image: session.user.image ?? null,
          plan: (session.user as { plan?: AuthUser["plan"] }).plan ?? "free",
        }
      : null;

  return {
    session,
    status,
    signIn,
    signOut,
    user,
  };
}
