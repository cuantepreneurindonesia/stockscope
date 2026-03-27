import type { Plan } from "@/lib/auth/types";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      plan?: Plan;
    };
  }
}
