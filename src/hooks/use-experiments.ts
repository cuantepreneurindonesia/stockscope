'use client';

import { useSession } from 'next-auth/react';
import { useMemo, useEffect } from 'react';
import { 
  getExperimentVariant, 
  getPricingForVariant,
  getCTAForVariant,
  type ExperimentVariant,
  type PricingConfig,
  type CTAConfig,
  PRICING_EXPERIMENTS,
} from '@/lib/experiments';

/**
 * Hook for accessing experiment variant
 * Automatically tracks assignment on mount
 */
export function useExperiment(experimentKey: keyof typeof PRICING_EXPERIMENTS) {
  const { data: session } = useSession();
  const experiment = PRICING_EXPERIMENTS[experimentKey];
  
  const variant = useMemo(() => {
    if (!experiment.isActive) return 'control';
    
    const userId = session?.user?.id;
    const sessionId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('sessionId') || undefined
      : undefined;
    
    return getExperimentVariant(experiment.id, userId, sessionId);
  }, [experiment.id, experiment.isActive, session?.user?.id]);
  
  // Track assignment on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && experiment.isActive) {
      // Track experiment assignment
      window.dispatchEvent(new CustomEvent('track_experiment', {
        detail: {
          experimentId: experiment.id,
          variant,
          action: 'assigned',
        },
      }));
    }
  }, [experiment.id, experiment.isActive, variant]);
  
  return {
    variant,
    experimentId: experiment.id,
    experimentName: experiment.name,
    isActive: experiment.isActive,
  };
}

/**
 * Hook for pricing experiment
 * Returns pricing config based on variant
 */
export function usePricingExperiment(): {
  variant: ExperimentVariant;
  pricing: PricingConfig;
  experimentId: string;
} {
  const { variant, experimentId } = useExperiment('premiumPricing');
  const pricing = useMemo(() => getPricingForVariant(variant), [variant]);
  
  return { variant, pricing, experimentId };
}

/**
 * Hook for CTA experiment
 * Returns CTA text based on variant
 */
export function useCTAExperiment(): {
  variant: ExperimentVariant;
  cta: CTAConfig;
  experimentId: string;
} {
  const { variant, experimentId } = useExperiment('ctaWording');
  const cta = useMemo(() => getCTAForVariant(variant), [variant]);
  
  return { variant, cta, experimentId };
}

/**
 * Hook for placement experiment
 * Returns placement strategy based on variant
 */
export function usePlacementExperiment(): {
  variant: ExperimentVariant;
  placement: 'modal' | 'banner' | 'inline';
  experimentId: string;
} {
  const { variant, experimentId } = useExperiment('ctaPlacement');
  
  const placement = useMemo(() => {
    if (variant === 'control') return 'modal';
    if (variant === 'variant_a') return 'banner';
    return 'inline';
  }, [variant]);
  
  return { variant, placement, experimentId };
}

/**
 * Hook for pricing layout experiment
 */
export function useLayoutExperiment(): {
  variant: ExperimentVariant;
  layout: 'cards' | 'comparison' | 'table';
  experimentId: string;
} {
  const { variant, experimentId } = useExperiment('pricingLayout');
  
  const layout = useMemo(() => {
    if (variant === 'control') return 'cards';
    if (variant === 'variant_a') return 'comparison';
    return 'table';
  }, [variant]);
  
  return { variant, layout, experimentId };
}

/**
 * Track experiment event (use from client components)
 */
export function trackExperimentEvent(
  experimentId: string,
  variant: ExperimentVariant,
  action: 'viewed' | 'clicked' | 'converted',
  metadata?: Record<string, any>
) {
  if (typeof window === 'undefined') return;
  
  window.dispatchEvent(new CustomEvent('track_experiment', {
    detail: {
      experimentId,
      variant,
      action,
      ...metadata,
    },
  }));
}
