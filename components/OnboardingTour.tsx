'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useTranslations } from 'next-intl';
import { TOUR_STEP_DEFS } from '@/lib/tourSteps';

export type { TourStepDef } from '@/lib/tourSteps';

export interface OnboardingTourProps {
  visible: boolean;
  onSkip: () => void;
  onComplete: () => void;
}

const DEBOUNCE_MS = 100;

function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
}

export function OnboardingTour({
  visible,
  onSkip,
  onComplete,
}: OnboardingTourProps): React.ReactElement | null {
  const t = useTranslations('tour');
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    arrowPosition: 'top' | 'bottom';
    arrowLeft: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEP_DEFS[currentStep];
  const isLastStep = currentStep === TOUR_STEP_DEFS.length - 1;

  const getTargetElement = useCallback((): Element | null => {
    if (!step) return null;
    return document.querySelector(step.selector);
  }, [step]);

  const calculateSpotlight = useCallback((): void => {
    const el = getTargetElement();
    if (!el) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OnboardingTour] Element not found for selector: ${step?.selector}`);
      }
      setSpotlightRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const padding = typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 8;
    setSpotlightRect(
      new DOMRect(
        rect.left - padding,
        rect.top - padding,
        rect.width + padding * 2,
        rect.height + padding * 2
      )
    );
  }, [getTargetElement, step?.selector]);

  const debouncedCalculate = useDebouncedCallback(calculateSpotlight, DEBOUNCE_MS);

  const calculateTooltipPosition = useCallback((): void => {
    const el = getTargetElement();
    const tooltip = tooltipRef.current;
    if (!el || !tooltip || !spotlightRect) return;

    const rect = spotlightRect;
    const tooltipRect = tooltip.getBoundingClientRect();
    const screenPadding = 16;
    const maxWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 360;

    const spotlightCenterX = rect.left + rect.width / 2;
    const tooltipHalfWidth = Math.min(maxWidth / 2, tooltipRect.width / 2);

    let left = spotlightCenterX - tooltipHalfWidth;
    left = Math.max(screenPadding, Math.min(window.innerWidth - maxWidth - screenPadding, left));

    const gap = 12;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top: number;
    let arrowPosition: 'top' | 'bottom';

    if (spaceBelow >= tooltipRect.height + gap || spaceBelow >= spaceAbove) {
      top = rect.bottom + gap;
      arrowPosition = 'top';
    } else {
      top = rect.top - tooltipRect.height - gap;
      arrowPosition = 'bottom';
    }

    top = Math.max(screenPadding, Math.min(window.innerHeight - tooltipRect.height - screenPadding, top));

    const arrowLeft = spotlightCenterX - left;
    setTooltipPosition({ top, left, arrowPosition, arrowLeft });
  }, [getTargetElement, spotlightRect]);

  useEffect(() => {
    if (!visible || !step) return;
    const id = requestAnimationFrame(() => calculateSpotlight());
    return () => cancelAnimationFrame(id);
  }, [visible, step, currentStep, calculateSpotlight]);

  useEffect(() => {
    if (!visible) return;
    const handle = (): void => debouncedCalculate();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [visible, debouncedCalculate]);

  useEffect(() => {
    if (!visible || !spotlightRect) return;
    requestAnimationFrame(calculateTooltipPosition);
  }, [visible, spotlightRect, calculateTooltipPosition]);

  const goNext = useCallback((): void => {
    if (isLastStep) {
      onComplete();
      return;
    }
    let next = currentStep + 1;
    while (next < TOUR_STEP_DEFS.length) {
      const nextEl = document.querySelector(TOUR_STEP_DEFS[next].selector);
      if (nextEl) break;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[OnboardingTour] Skipping step ${next}: element not found`);
      }
      next++;
    }
    if (next >= TOUR_STEP_DEFS.length) {
      onSkip();
      return;
    }
    setCurrentStep(next);
  }, [currentStep, isLastStep, onComplete, onSkip]);

  const goBack = useCallback((): void => {
    if (currentStep <= 0) return;
    let prev = currentStep - 1;
    while (prev >= 0) {
      const prevEl = document.querySelector(TOUR_STEP_DEFS[prev].selector);
      if (prevEl) break;
      prev--;
    }
    if (prev >= 0) setCurrentStep(prev);
  }, [currentStep]);

  const handleSkip = useCallback((): void => {
    onSkip();
  }, [onSkip]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!visible) return;
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleSkip]);

  useEffect(() => {
    if (!visible || !step) return;
    const el = getTargetElement();
    if (!el && currentStep < TOUR_STEP_DEFS.length) {
      queueMicrotask(() => goNext());
    }
  }, [visible, step, currentStep, getTargetElement, goNext]);

  if (!visible) return null;

  const targetEl = getTargetElement();
  if (!targetEl && currentStep < TOUR_STEP_DEFS.length) {
    return null;
  }

  return (
    <div
      className="onboarding-tour"
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaProgress', {
        current: currentStep + 1,
        total: TOUR_STEP_DEFS.length,
      })}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
        }}
      />

      {/* Spotlight */}
      {spotlightRect && (
        <div
          style={{
            position: 'fixed',
            left: spotlightRect.left,
            top: spotlightRect.top,
            width: spotlightRect.width,
            height: spotlightRect.height,
            border: '3px solid #64b5f6',
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)',
            zIndex: 1001,
            transition: 'all 300ms ease-out',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: tooltipPosition?.top ?? (typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 0),
          left: tooltipPosition?.left ?? (typeof window !== 'undefined' ? window.innerWidth / 2 - 180 : 0),
          background: '#1f2937',
          border: '1px solid #4b5563',
          borderRadius: 12,
          padding: typeof window !== 'undefined' && window.innerWidth < 640 ? 16 : 24,
          maxWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 360,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          zIndex: 1002,
        }}
      >
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: 12,
            cursor: 'pointer',
            padding: 4,
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid #64b5f6';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          aria-label={t('skipAria')}
        >
          {t('skip')}
        </button>

        {tooltipPosition && (
          <div
            style={{
              position: 'absolute',
              left: tooltipPosition.arrowLeft,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              ...(tooltipPosition.arrowPosition === 'top'
                ? {
                    bottom: '100%',
                    borderBottom: '8px solid #1f2937',
                  }
                : {
                    top: '100%',
                    borderTop: '8px solid #1f2937',
                  }),
            }}
          />
        )}

        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            paddingRight: 70,
          }}
        >
          {step ? (t as (key: string) => string)(`steps.${step.id}.title`) : ''}
        </h3>
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: '#d1d5db',
            marginTop: 8,
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          {step ? (t as (key: string) => string)(`steps.${step.id}.description`) : ''}
        </p>

        {/* Step indicators */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {TOUR_STEP_DEFS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === currentStep ? '#64b5f6' : '#6b7280',
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {currentStep > 0 && (
            <button
              onClick={goBack}
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                background: 'transparent',
                border: '1px solid #4b5563',
                color: '#d1d5db',
                fontSize: 14,
                cursor: 'pointer',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid #64b5f6';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              {t('back')}
            </button>
          )}
          <button
            onClick={goNext}
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              background: '#64b5f6',
              border: 'none',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #64b5f6';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            {isLastStep ? t('done') : t('next')}
          </button>
        </div>
      </div>
    </div>
  );
}
