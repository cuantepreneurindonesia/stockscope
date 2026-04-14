"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { AppShell } from "@/components/features/integration/AppShell";

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "#6b8aad" },
  premium: { label: "Premium", color: "#2a9d8f" },
  pro: { label: "Pro", color: "#8b5cf6" },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as { name?: string; email?: string; image?: string; plan?: string } | undefined;
  const plan = user?.plan ?? "free";
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS.free;

  if (status === "loading") {
    return (
      <AppShell title="Profile" subtitle="Your account details and plan.">
        <section className="card">
          <div className="space-y-3 animate-pulse">
            <div className="h-6 w-48 bg-surface-elevated rounded" />
            <div className="h-4 w-72 bg-surface-elevated rounded" />
            <div className="h-4 w-40 bg-surface-elevated rounded" />
          </div>
        </section>
      </AppShell>
    );
  }

  if (!session?.user) {
    return (
      <AppShell title="Profile" subtitle="Sign in to view your profile.">
        <section className="card text-center space-y-4">
          <p className="text-text-secondary text-sm">You are not signed in.</p>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-2 bg-brand text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Sign In with Google
          </button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Plan, identity, and preferences backed by the existing auth session."
    >
      {/* Identity */}
      <section className="card space-y-4">
        <p className="label">Identity</p>
        <div className="flex items-center gap-4">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="Avatar"
              className="w-14 h-14 rounded-full border border-border-subtle"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-dim flex items-center justify-center text-brand font-bold text-xl">
              {(user?.name ?? user?.email ?? "?")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-text-primary font-semibold text-lg leading-tight">
              {user?.name ?? "—"}
            </p>
            <p className="text-text-secondary text-sm">{user?.email ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section className="card space-y-3 mt-4">
        <p className="label">Subscription Plan</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: `${planMeta.color}22`,
                color: planMeta.color,
                border: `1px solid ${planMeta.color}55`,
              }}
            >
              {planMeta.label}
            </span>
            <span className="text-text-secondary text-sm">
              {plan === "free"
                ? "Limited access — upgrade to unlock full features"
                : plan === "premium"
                ? "Full access to AI insights, alerts, and watchlists"
                : "Unlimited access including API and exports"}
            </span>
          </div>
          {plan !== "pro" && (
            <button
              onClick={() => router.push("/upgrade")}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-brand text-brand hover:bg-brand-dim transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </section>

      {/* Plan Features */}
      <section className="card space-y-3 mt-4">
        <p className="label">Your Limits</p>
        <ul className="space-y-2 text-sm text-text-secondary">
          {plan === "free" && (
            <>
              <li>• Up to 3 watchlists, 20 stocks each</li>
              <li>• Basic stock screening</li>
              <li>• No price alerts</li>
              <li>• No AI insights</li>
            </>
          )}
          {plan === "premium" && (
            <>
              <li>• Up to 20 watchlists, 100 stocks each</li>
              <li>• AI-powered insights</li>
              <li>• Up to 10 price alerts</li>
              <li>• 20 saved screeners</li>
              <li>• Ownership data access</li>
            </>
          )}
          {plan === "pro" && (
            <>
              <li>• Unlimited watchlists and stocks</li>
              <li>• Up to 100 price alerts</li>
              <li>• Unlimited saved screeners</li>
              <li>• Full API access</li>
              <li>• Historical data export</li>
            </>
          )}
        </ul>
        {plan === "pro" && (
          <a
            href="/developer/api-keys"
            className="inline-block mt-2 text-sm text-brand hover:underline"
          >
            Manage API Keys →
          </a>
        )}
      </section>
    </AppShell>
  );
}
