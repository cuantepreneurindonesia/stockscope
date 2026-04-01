'use client';

import { useEffect, useState } from 'react';
import { MONITORING_CONFIG } from '@/lib/hypercare';

interface HypercareData {
  metrics: any;
  baseline: any;
  evaluation: {
    shouldRollback: boolean;
    triggeredCount: number;
    triggers: Array<{
      id: string;
      name: string;
      severity: string;
      action: string;
      description: string;
    }>;
  };
  report: string;
  timestamp: string;
}

export default function HypercareClient() {
  const [data, setData] = useState<HypercareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/hypercare');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchMetrics();
    }, MONITORING_CONFIG.checkInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading hypercare metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, baseline, evaluation } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🚨 Hypercare Dashboard</h1>
            <p className="text-slate-400">Paywall Launch Monitoring</p>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (5min)
            </label>
            
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Alert Status */}
        {evaluation.shouldRollback ? (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🚨</span>
              <h2 className="text-2xl font-bold text-red-400">CRITICAL: ROLLBACK RECOMMENDED</h2>
            </div>
            <p className="text-slate-300 mb-4">
              One or more critical triggers have fired. Immediate action required.
            </p>
            <div className="space-y-2">
              {evaluation.triggers
                .filter(t => t.severity === 'critical')
                .map(t => (
                  <div key={t.id} className="bg-red-900/20 border border-red-600 rounded p-3">
                    <div className="font-semibold text-red-300">{t.name}</div>
                    <div className="text-sm text-slate-400">{t.description}</div>
                  </div>
                ))}
            </div>
            <div className="mt-4 p-4 bg-slate-900 rounded">
              <div className="font-semibold mb-2">Rollback Steps:</div>
              <ol className="text-sm space-y-1 text-slate-300">
                {MONITORING_CONFIG.rollbackSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : evaluation.triggeredCount > 0 ? (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-2xl font-bold text-yellow-400">WARNING: Issues Detected</h2>
            </div>
            <p className="text-slate-300">
              {evaluation.triggeredCount} warning(s) or investigation(s) active. Monitor closely.
            </p>
          </div>
        ) : (
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h2 className="text-2xl font-bold text-green-400">ALL CLEAR</h2>
                <p className="text-slate-300">No issues detected. System operating normally.</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Conversion */}
          <MetricCard
            title="Free → Premium"
            value={`${metrics.freeToPremiumConversion.toFixed(2)}%`}
            baseline={`${baseline.freeToPremiumConversion.toFixed(2)}%`}
            change={metrics.freeToPremiumConversion - baseline.freeToPremiumConversion}
          />
          
          <MetricCard
            title="Premium → Pro"
            value={`${metrics.premiumToProConversion.toFixed(2)}%`}
            baseline={`${baseline.premiumToProConversion.toFixed(2)}%`}
            change={metrics.premiumToProConversion - baseline.premiumToProConversion}
          />
          
          <MetricCard
            title="Churn Rate"
            value={`${metrics.churnRate.toFixed(2)}%`}
            baseline={`${baseline.churnRate.toFixed(2)}%`}
            change={metrics.churnRate - baseline.churnRate}
            invertChange
          />
          
          <MetricCard
            title="Payment Failures"
            value={`${metrics.paymentFailures.toFixed(2)}%`}
            baseline={`${baseline.paymentFailures.toFixed(2)}%`}
            change={metrics.paymentFailures - baseline.paymentFailures}
            invertChange
          />
          
          <MetricCard
            title="Daily Revenue"
            value={`IDR ${metrics.dailyRevenue.toLocaleString()}`}
            baseline="Post-launch"
          />
          
          <MetricCard
            title="Retention Offers"
            value={`${metrics.retentionOfferAcceptance.toFixed(0)}%`}
            baseline="Acceptance Rate"
          />
          
          <MetricCard
            title="Critical Bugs"
            value={metrics.criticalBugs.toString()}
            baseline="Last 24h"
            danger={metrics.criticalBugs > 5}
          />
          
          <MetricCard
            title="Support Tickets"
            value={metrics.supportTickets.toString()}
            baseline={`${baseline.supportTickets} baseline`}
            change={metrics.supportTickets - baseline.supportTickets}
            invertChange
          />
          
          <MetricCard
            title="Upgrade Modal CVR"
            value={`${metrics.upgradeModalConversion.toFixed(2)}%`}
            baseline={`${metrics.featureGateImpressions.toLocaleString()} impressions`}
          />
        </div>

        {/* Triggered Alerts */}
        {evaluation.triggeredCount > 0 && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Active Alerts ({evaluation.triggeredCount})</h3>
            <div className="space-y-3">
              {evaluation.triggers.map(trigger => (
                <div 
                  key={trigger.id}
                  className={`border rounded-lg p-4 ${
                    trigger.severity === 'critical' 
                      ? 'bg-red-900/20 border-red-600' 
                      : trigger.severity === 'warning'
                        ? 'bg-yellow-900/20 border-yellow-600'
                        : 'bg-blue-900/20 border-blue-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{trigger.name}</div>
                      <div className="text-sm text-slate-400">{trigger.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trigger.severity === 'critical' 
                        ? 'bg-red-600' 
                        : trigger.severity === 'warning'
                          ? 'bg-yellow-600'
                          : 'bg-blue-600'
                    }`}>
                      {trigger.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Action: </span>
                    <span className="font-medium">{trigger.action.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancellation Reasons */}
        {Object.keys(metrics.cancellationReasons).length > 0 && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Top Cancellation Reasons</h3>
            <div className="space-y-2">
              {Object.entries(metrics.cancellationReasons)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between">
                    <span className="text-slate-300">{reason.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-slate-400">{count as number}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Feature Blocks */}
        {Object.keys(metrics.blockedFeatureAttempts).length > 0 && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Most Blocked Features</h3>
            <div className="space-y-2">
              {Object.entries(metrics.blockedFeatureAttempts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([feature, count]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-slate-300">{feature}</span>
                    <span className="font-mono text-slate-400">{count as number}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  baseline,
  change,
  invertChange = false,
  danger = false,
}: {
  title: string;
  value: string;
  baseline?: string;
  change?: number;
  invertChange?: boolean;
  danger?: boolean;
}) {
  const showChange = typeof change === 'number' && !isNaN(change);
  const isPositive = invertChange ? change! < 0 : change! > 0;
  
  return (
    <div className={`bg-slate-900 border rounded-lg p-5 ${danger ? 'border-red-600' : 'border-slate-700'}`}>
      <div className="text-slate-400 text-sm mb-2">{title}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {baseline && (
        <div className="text-slate-500 text-xs">{baseline}</div>
      )}
      {showChange && (
        <div className={`text-sm mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change!).toFixed(2)}
        </div>
      )}
    </div>
  );
}
