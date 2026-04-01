/**
 * Hypercare Monitoring Configuration (Sprint 7)
 * 
 * Monitor paywall launch metrics and define rollback triggers
 */

export interface HypercareMetrics {
  // Conversion metrics
  freeToPremiumConversion: number; // Percentage
  premiumToProConversion: number; // Percentage
  experimentVariantWinner: string | null; // Best performing variant
  
  // Churn metrics
  churnRate: number; // Percentage (daily)
  retentionOfferAcceptance: number; // Percentage
  cancellationReasons: Record<string, number>; // Count by reason
  
  // Support metrics
  criticalBugs: number; // Count (last 24h)
  supportTickets: number; // Count (last 24h)
  avgResponseTime: number; // Minutes
  
  // Revenue metrics
  dailyRevenue: number; // IDR
  paymentFailures: number; // Percentage
  averageOrderValue: number; // IDR
  
  // Feature gate metrics
  featureGateImpressions: number; // How many times gates shown
  upgradeModalConversion: number; // Percentage who clicked upgrade
  blockedFeatureAttempts: Record<string, number>; // Count by feature
  
  timestamp: Date;
}

export interface RollbackTrigger {
  id: string;
  name: string;
  condition: (metrics: HypercareMetrics, baseline: HypercareMetrics) => boolean;
  severity: 'critical' | 'warning' | 'info';
  action: 'rollback' | 'alert' | 'investigate';
  description: string;
}

/**
 * Baseline metrics (before paywall launch)
 * These should be updated with actual pre-launch data
 */
export const BASELINE_METRICS: HypercareMetrics = {
  freeToPremiumConversion: 2.5, // 2.5% conversion (industry standard)
  premiumToProConversion: 5.0, // 5% upgrade rate
  experimentVariantWinner: null,
  churnRate: 3.0, // 3% monthly churn
  retentionOfferAcceptance: 30.0, // 30% accept retention offers
  cancellationReasons: {},
  criticalBugs: 0,
  supportTickets: 15, // ~15 tickets/day baseline
  avgResponseTime: 120, // 2 hours average
  dailyRevenue: 0, // Will grow post-launch
  paymentFailures: 2.0, // 2% payment failures (normal)
  averageOrderValue: 17_000, // Base premium price
  featureGateImpressions: 0,
  upgradeModalConversion: 0,
  blockedFeatureAttempts: {},
  timestamp: new Date(),
};

/**
 * Rollback triggers for paywall launch
 * If any CRITICAL trigger fires, immediate rollback recommended
 */
export const ROLLBACK_TRIGGERS: RollbackTrigger[] = [
  // CRITICAL: Conversion drops significantly
  {
    id: 'conversion_drop',
    name: 'Conversion Rate Drop',
    severity: 'critical',
    action: 'rollback',
    description: 'Free-to-Premium conversion dropped >30% from baseline',
    condition: (current, baseline) => {
      if (baseline.freeToPremiumConversion === 0) return false;
      const drop = ((baseline.freeToPremiumConversion - current.freeToPremiumConversion) / baseline.freeToPremiumConversion) * 100;
      return drop > 30;
    },
  },
  
  // CRITICAL: Too many bugs
  {
    id: 'critical_bugs',
    name: 'High Critical Bug Count',
    severity: 'critical',
    action: 'rollback',
    description: 'More than 5 critical bugs reported in 24 hours',
    condition: (current) => current.criticalBugs > 5,
  },
  
  // CRITICAL: Payment system failing
  {
    id: 'payment_failures',
    name: 'High Payment Failure Rate',
    severity: 'critical',
    action: 'rollback',
    description: 'Payment failures exceed 10% (indicates integration issue)',
    condition: (current) => current.paymentFailures > 10,
  },
  
  // WARNING: Churn spike
  {
    id: 'churn_spike',
    name: 'Churn Rate Spike',
    severity: 'warning',
    action: 'alert',
    description: 'Churn rate doubled from baseline',
    condition: (current, baseline) => {
      return current.churnRate > baseline.churnRate * 2;
    },
  },
  
  // WARNING: Support overload
  {
    id: 'support_overload',
    name: 'Support Ticket Surge',
    severity: 'warning',
    action: 'alert',
    description: 'Support tickets increased >50% (may indicate UX confusion)',
    condition: (current, baseline) => {
      if (baseline.supportTickets === 0) return false;
      const increase = ((current.supportTickets - baseline.supportTickets) / baseline.supportTickets) * 100;
      return increase > 50;
    },
  },
  
  // INFO: Low retention offer acceptance
  {
    id: 'retention_ineffective',
    name: 'Low Retention Offer Acceptance',
    severity: 'info',
    action: 'investigate',
    description: 'Retention offers accepted <20% (may need better offers)',
    condition: (current) => current.retentionOfferAcceptance < 20,
  },
  
  // INFO: Feature gate not converting
  {
    id: 'gate_not_converting',
    name: 'Feature Gates Not Converting',
    severity: 'info',
    action: 'investigate',
    description: 'Upgrade modal conversion <1% (poor CTA or targeting)',
    condition: (current) => {
      return current.featureGateImpressions > 100 && current.upgradeModalConversion < 1;
    },
  },
];

/**
 * Calculate current hypercare metrics from analytics events
 */
export async function calculateHypercareMetrics(
  startDate: Date,
  endDate: Date
): Promise<HypercareMetrics> {
  // This would query the analytics database
  // For now, return placeholder structure
  return {
    freeToPremiumConversion: 0,
    premiumToProConversion: 0,
    experimentVariantWinner: null,
    churnRate: 0,
    retentionOfferAcceptance: 0,
    cancellationReasons: {},
    criticalBugs: 0,
    supportTickets: 0,
    avgResponseTime: 0,
    dailyRevenue: 0,
    paymentFailures: 0,
    averageOrderValue: 0,
    featureGateImpressions: 0,
    upgradeModalConversion: 0,
    blockedFeatureAttempts: {},
    timestamp: new Date(),
  };
}

/**
 * Evaluate all rollback triggers against current metrics
 */
export function evaluateTriggers(
  current: HypercareMetrics,
  baseline: HypercareMetrics = BASELINE_METRICS
): {
  triggered: RollbackTrigger[];
  shouldRollback: boolean;
  alerts: RollbackTrigger[];
  investigations: RollbackTrigger[];
} {
  const triggered = ROLLBACK_TRIGGERS.filter(trigger => 
    trigger.condition(current, baseline)
  );
  
  const shouldRollback = triggered.some(t => t.severity === 'critical' && t.action === 'rollback');
  const alerts = triggered.filter(t => t.action === 'alert');
  const investigations = triggered.filter(t => t.action === 'investigate');
  
  return {
    triggered,
    shouldRollback,
    alerts,
    investigations,
  };
}

/**
 * Monitoring dashboard configuration
 */
export const MONITORING_CONFIG = {
  // How often to check metrics
  checkInterval: 5 * 60 * 1000, // 5 minutes
  
  // How far back to look for metrics
  metricsWindow: 24 * 60 * 60 * 1000, // 24 hours
  
  // Alert channels
  alertChannels: {
    slack: '#paywall-alerts',
    email: ['devops@stockscope.id', 'product@stockscope.id'],
    pagerduty: true, // For critical issues
  },
  
  // Feature flags for gradual rollout
  featureFlags: {
    paywallEnabled: true, // Master switch
    featureGatingEnabled: true,
    experimentingEnabled: true,
    retentionOffersEnabled: true,
  },
  
  // Rollback plan
  rollbackSteps: [
    '1. Disable paywall feature flag (instant)',
    '2. Switch all users to free tier temporarily',
    '3. Notify active paying users via email',
    '4. Investigate root cause',
    '5. Fix issues in staging',
    '6. Re-enable with monitoring',
  ],
};

/**
 * Format metrics for display
 */
export function formatMetricsReport(metrics: HypercareMetrics, baseline: HypercareMetrics): string {
  const evaluation = evaluateTriggers(metrics, baseline);
  
  const sections = [
    '## Paywall Hypercare Report',
    `**Timestamp:** ${metrics.timestamp.toISOString()}`,
    '',
    '### Conversion Metrics',
    `- Free → Premium: ${metrics.freeToPremiumConversion.toFixed(2)}% (baseline: ${baseline.freeToPremiumConversion.toFixed(2)}%)`,
    `- Premium → Pro: ${metrics.premiumToProConversion.toFixed(2)}% (baseline: ${baseline.premiumToProConversion.toFixed(2)}%)`,
    `- Experiment Winner: ${metrics.experimentVariantWinner || 'TBD'}`,
    '',
    '### Churn Metrics',
    `- Daily Churn Rate: ${metrics.churnRate.toFixed(2)}% (baseline: ${baseline.churnRate.toFixed(2)}%)`,
    `- Retention Offer Acceptance: ${metrics.retentionOfferAcceptance.toFixed(2)}%`,
    `- Top Cancellation Reasons: ${Object.entries(metrics.cancellationReasons).slice(0, 3).map(([r, c]) => `${r} (${c})`).join(', ') || 'None'}`,
    '',
    '### Support & Quality',
    `- Critical Bugs (24h): ${metrics.criticalBugs}`,
    `- Support Tickets (24h): ${metrics.supportTickets} (baseline: ${baseline.supportTickets})`,
    `- Avg Response Time: ${metrics.avgResponseTime} min`,
    '',
    '### Revenue Metrics',
    `- Daily Revenue: IDR ${metrics.dailyRevenue.toLocaleString()}`,
    `- Payment Failures: ${metrics.paymentFailures.toFixed(2)}% (baseline: ${baseline.paymentFailures.toFixed(2)}%)`,
    `- Average Order Value: IDR ${metrics.averageOrderValue.toLocaleString()}`,
    '',
    '### Feature Gate Performance',
    `- Gate Impressions: ${metrics.featureGateImpressions.toLocaleString()}`,
    `- Upgrade Modal Conversion: ${metrics.upgradeModalConversion.toFixed(2)}%`,
    '',
    '### Alert Status',
    evaluation.shouldRollback 
      ? '🚨 **CRITICAL: ROLLBACK RECOMMENDED**'
      : evaluation.triggered.length > 0
        ? '⚠️  **WARNING: Issues Detected**'
        : '✅ **ALL CLEAR: No Issues Detected**',
    '',
  ];
  
  if (evaluation.triggered.length > 0) {
    sections.push('### Triggered Alerts');
    evaluation.triggered.forEach(trigger => {
      const icon = trigger.severity === 'critical' ? '🚨' : trigger.severity === 'warning' ? '⚠️' : 'ℹ️';
      sections.push(`${icon} **${trigger.name}** (${trigger.severity})`);
      sections.push(`   ${trigger.description}`);
      sections.push(`   Action: ${trigger.action.toUpperCase()}`);
      sections.push('');
    });
  }
  
  return sections.join('\n');
}
