/**
 * Auth types for session and plan
 */

export type Plan = "free" | "premium" | "pro";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  plan: Plan;
}

export type SessionUser = AuthUser | null;
