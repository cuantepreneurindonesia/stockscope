'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
// Premium gating (uncomment when restoring tier limits):
// import { FREE_LIMIT } from '@/lib/auth/constants';
// import { isPremiumTab } from '@/lib/services/planService';
import type { Plan } from '@/lib/auth/types';

export interface UsePlanReturn {
  plan: Plan;
  isPremium: boolean;
  canAccessTab: (tabId: string) => boolean;
  dataLimit: number;
  isLoading: boolean;
}

/**
 * Derives plan and access control from auth session.
 */
export function usePlan(): UsePlanReturn {
  const { user, status } = useAuth();

  const plan: Plan = useMemo(() => user?.plan ?? 'free', [user?.plan]);

  // --- Premium gating off: everyone treated as premium. Restore block below and remove the `true` / `Infinity` shims. ---
  // const isPremium = useMemo(() => plan === 'premium', [plan]);
  // const dataLimit = useMemo(
  //   () => (isPremium ? Number.POSITIVE_INFINITY : FREE_LIMIT),
  //   [isPremium]
  // );
  // const canAccessTab = useCallback(
  //   (tabId: string): boolean => {
  //     if (isPremium) return true;
  //     return !isPremiumTab(tabId);
  //   },
  //   [isPremium]
  // );
  const isPremium = true;
  const dataLimit = Number.POSITIVE_INFINITY;
  const canAccessTab = useCallback((tabId: string): boolean => {
    void tabId;
    return true;
  }, []);

  return {
    plan,
    isPremium,
    canAccessTab,
    dataLimit,
    isLoading: status === 'loading',
  };
}
