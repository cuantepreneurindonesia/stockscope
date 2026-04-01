/**
 * GET /api/hypercare
 * 
 * Returns current paywall hypercare metrics and rollback trigger status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import prisma from '@/lib/prisma';
import {
  type HypercareMetrics,
  BASELINE_METRICS,
  evaluateTriggers,
  formatMetricsReport,
} from '@/lib/hypercare';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Only admins can view hypercare dashboard
  if (!session?.user?.email || session.user.email !== 'admin@stockscope.id') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Calculate metrics from last 24 hours
    const metrics = await calculateMetrics(yesterday, now);
    
    // Evaluate triggers
    const evaluation = evaluateTriggers(metrics, BASELINE_METRICS);
    
    // Format report
    const report = formatMetricsReport(metrics, BASELINE_METRICS);
    
    return NextResponse.json({
      metrics,
      baseline: BASELINE_METRICS,
      evaluation: {
        shouldRollback: evaluation.shouldRollback,
        triggeredCount: evaluation.triggered.length,
        triggers: evaluation.triggered.map(t => ({
          id: t.id,
          name: t.name,
          severity: t.severity,
          action: t.action,
          description: t.description,
        })),
      },
      report,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch hypercare metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

async function calculateMetrics(startDate: Date, endDate: Date): Promise<HypercareMetrics> {
  // Conversion metrics
  const conversionEvents = await prisma.analyticsEvent.findMany({
    where: {
      eventName: { in: ['subscription_started', 'subscription_upgraded'] },
      timestamp: { gte: startDate, lte: endDate },
    },
  });
  
  const pageViews = await prisma.analyticsEvent.count({
    where: {
      eventName: 'page_view',
      timestamp: { gte: startDate, lte: endDate },
    },
  });
  
  const uniqueUsers = await prisma.analyticsEvent.findMany({
    where: {
      timestamp: { gte: startDate, lte: endDate },
    },
    distinct: ['userId'],
  });
  
  const premiumConversions = conversionEvents.filter(e => {
    const props = e.properties as any;
    return props?.plan === 'premium';
  }).length;
  
  const proConversions = conversionEvents.filter(e => {
    const props = e.properties as any;
    return props?.plan === 'pro';
  }).length;
  
  const freeUsers = uniqueUsers.length;
  const freeToPremiumConversion = freeUsers > 0 ? (premiumConversions / freeUsers) * 100 : 0;
  const premiumToProConversion = premiumConversions > 0 ? (proConversions / premiumConversions) * 100 : 0;
  
  // Churn metrics
  const cancellations = await prisma.cancellationFeedback.findMany({
    where: {
      cancelledAt: { gte: startDate, lte: endDate },
    },
  });
  
  const retentionAccepted = cancellations.filter(c => c.retentionOfferAccepted).length;
  const retentionOfferAcceptance = cancellations.length > 0 
    ? (retentionAccepted / cancellations.length) * 100 
    : 0;
  
  const cancellationReasons: Record<string, number> = {};
  cancellations.forEach(c => {
    cancellationReasons[c.reason] = (cancellationReasons[c.reason] || 0) + 1;
  });
  
  const activeSubscriptions = await prisma.user.count({
    where: {
      plan: { in: ['premium', 'pro'] },
    },
  });
  
  const churnRate = activeSubscriptions > 0 
    ? (cancellations.length / activeSubscriptions) * 100 
    : 0;
  
  // Support metrics (placeholder - would integrate with support system)
  const criticalBugs = 0; // Would query bug tracker
  const supportTickets = 0; // Would query support system
  const avgResponseTime = 0; // Would calculate from support system
  
  // Revenue metrics
  const transactions = await prisma.paymentTransaction.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['success', 'failed'] },
    },
  });
  
  const successfulTransactions = transactions.filter(t => t.status === 'success');
  const failedTransactions = transactions.filter(t => t.status === 'failed');
  
  const dailyRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
  const paymentFailures = transactions.length > 0 
    ? (failedTransactions.length / transactions.length) * 100 
    : 0;
  const averageOrderValue = successfulTransactions.length > 0 
    ? dailyRevenue / successfulTransactions.length 
    : 0;
  
  // Feature gate metrics
  const gateImpressions = await prisma.analyticsEvent.count({
    where: {
      eventName: 'feature_gate_shown',
      timestamp: { gte: startDate, lte: endDate },
    },
  });
  
  const upgradeClicks = await prisma.analyticsEvent.count({
    where: {
      eventName: 'upgrade_modal_clicked',
      timestamp: { gte: startDate, lte: endDate },
    },
  });
  
  const upgradeModalConversion = gateImpressions > 0 
    ? (upgradeClicks / gateImpressions) * 100 
    : 0;
  
  const blockedAttempts = await prisma.analyticsEvent.findMany({
    where: {
      eventName: 'feature_blocked',
      timestamp: { gte: startDate, lte: endDate },
    },
  });
  
  const blockedFeatureAttempts: Record<string, number> = {};
  blockedAttempts.forEach(e => {
    const props = e.properties as any;
    const feature = props?.feature || 'unknown';
    blockedFeatureAttempts[feature] = (blockedFeatureAttempts[feature] || 0) + 1;
  });
  
  // Experiment winner (from SP7-03)
  const experimentMetrics = await prisma.analyticsEvent.groupBy({
    by: ['properties'],
    where: {
      eventName: 'experiment_conversion',
      timestamp: { gte: startDate, lte: endDate },
    },
    _count: true,
  });
  
  let experimentVariantWinner: string | null = null;
  if (experimentMetrics.length > 0) {
    const sorted = experimentMetrics.sort((a, b) => b._count - a._count);
    const topVariant = sorted[0].properties as any;
    experimentVariantWinner = topVariant?.variant || null;
  }
  
  return {
    freeToPremiumConversion,
    premiumToProConversion,
    experimentVariantWinner,
    churnRate,
    retentionOfferAcceptance,
    cancellationReasons,
    criticalBugs,
    supportTickets,
    avgResponseTime,
    dailyRevenue,
    paymentFailures,
    averageOrderValue,
    featureGateImpressions: gateImpressions,
    upgradeModalConversion,
    blockedFeatureAttempts,
    timestamp: new Date(),
  };
}
