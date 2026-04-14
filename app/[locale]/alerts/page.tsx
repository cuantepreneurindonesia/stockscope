"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Bell, Trash2, Plus, X, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { AppShell } from "@/components/features/integration/AppShell";

interface PriceAlert {
  id: string;
  ticker: string;
  condition: "above" | "below";
  targetPrice: number;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

interface AlertFormData {
  ticker: string;
  condition: "above" | "below";
  targetPrice: number;
}

export default function AlertsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AlertFormData>();

  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const canCreateAlerts = plan === "premium" || plan === "pro";

  useEffect(() => {
    if (session?.user) {
      fetchAlerts();
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/price-alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AlertFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, targetPrice: Number(data.targetPrice) }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create alert");
      }
      const created = await res.json();
      setAlerts((prev) => [created, ...prev]);
      setSuccess(`Alert for ${data.ticker.toUpperCase()} created.`);
      reset();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating alert");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setPendingDelete(null);
    try {
      const res = await fetch(`/api/price-alerts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete alert");
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Alert deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleToggle = async (alert: PriceAlert) => {
    try {
      const res = await fetch(`/api/price-alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !alert.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update alert");
      const updated = await res.json();
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <AppShell title="Price Alerts" subtitle="Monitor stocks at your target prices.">
        <section className="card animate-pulse space-y-3">
          <div className="h-6 w-40 bg-surface-elevated rounded" />
          <div className="h-16 bg-surface-elevated rounded" />
          <div className="h-16 bg-surface-elevated rounded" />
        </section>
      </AppShell>
    );
  }

  if (!session?.user) {
    return (
      <AppShell title="Price Alerts" subtitle="Sign in to manage your price alerts.">
        <section className="card text-center space-y-4">
          <p className="text-text-secondary text-sm">Sign in to create and manage price alerts.</p>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-2 bg-brand text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </section>
      </AppShell>
    );
  }

  if (!canCreateAlerts) {
    return (
      <AppShell title="Price Alerts" subtitle="Get notified when stocks hit your target price.">
        <section className="card text-center space-y-4">
          <Bell className="w-12 h-12 mx-auto text-text-muted" />
          <p className="text-text-primary font-semibold">Premium Feature</p>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Price alerts are available on the Premium and Pro plans. Upgrade to set up to 10 alerts.
          </p>
          <a
            href="/upgrade"
            className="inline-block px-6 py-2 bg-brand text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Upgrade to Premium
          </a>
        </section>
      </AppShell>
    );
  }

  const activeAlerts = alerts.filter((a) => a.isActive);
  const triggeredAlerts = alerts.filter((a) => a.triggeredAt);

  return (
    <AppShell
      title="Price Alerts"
      subtitle="Get notified when a stock crosses your target price."
    >
      {/* Notifications */}
      {(error || success) && (
        <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${error ? "bg-red-900/20 border border-red-800 text-red-400" : "bg-green-900/20 border border-green-800 text-green-400"}`}>
          {error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{error ?? success}</span>
          <button onClick={() => { setError(null); setSuccess(null); }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header / Create Button */}
      <section className="card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">Active</p>
            <p className="text-text-primary font-semibold text-lg">{activeAlerts.length} alert{activeAlerts.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Alert
          </button>
        </div>

        {/* Inline create form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 pt-4 border-t border-border-subtle space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Ticker</label>
                <input
                  {...register("ticker", { required: "Required" })}
                  placeholder="BBCA"
                  className="w-full px-3 py-2 bg-surface-elevated border border-border-subtle rounded-lg text-sm text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
                {errors.ticker && <p className="text-red-500 text-xs mt-1">{errors.ticker.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Condition</label>
                <select
                  {...register("condition", { required: true })}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border-subtle rounded-lg text-sm text-text-primary"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Target Price (IDR)</label>
                <input
                  type="number"
                  {...register("targetPrice", { required: "Required", valueAsNumber: true, min: { value: 1, message: "Must be > 0" } })}
                  placeholder="5500"
                  className="w-full px-3 py-2 bg-surface-elevated border border-border-subtle rounded-lg text-sm text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
                {errors.targetPrice && <p className="text-red-500 text-xs mt-1">{errors.targetPrice.message}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {submitting ? "Creating…" : "Create Alert"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); reset(); }}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <section className="card text-center py-10 space-y-2">
          <Bell className="w-10 h-10 mx-auto text-text-muted" />
          <p className="text-text-secondary text-sm">No alerts yet. Create one to get started.</p>
        </section>
      ) : (
        <section className="card space-y-3">
          <p className="label mb-3">All Alerts</p>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${alert.isActive ? "border-border-subtle bg-surface-elevated/40" : "border-border-subtle bg-surface-elevated/10 opacity-60"}`}
            >
              {/* Status icon */}
              <div className="shrink-0">
                {alert.triggeredAt ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : alert.isActive ? (
                  <Bell className="w-5 h-5 text-brand" />
                ) : (
                  <Clock className="w-5 h-5 text-text-muted" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-text-primary text-sm">{alert.ticker}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${alert.condition === "above" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                    {alert.condition} {Number(alert.targetPrice).toLocaleString("id-ID")}
                  </span>
                  {alert.triggeredAt && (
                    <span className="text-xs text-text-muted">
                      triggered {new Date(alert.triggeredAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Created {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(alert)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${alert.isActive ? "border-border-subtle text-text-secondary hover:border-brand hover:text-brand" : "border-brand text-brand hover:bg-brand-dim"}`}
                >
                  {alert.isActive ? "Pause" : "Resume"}
                </button>

                {pendingDelete === alert.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="text-xs px-2 py-1 text-text-secondary hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPendingDelete(alert.id)}
                    className="p-1 text-text-muted hover:text-red-500 transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </AppShell>
  );
}
