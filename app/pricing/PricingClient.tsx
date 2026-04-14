'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Check, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { usePricingExperiment, useCTAExperiment, useLayoutExperiment } from '@/hooks/use-experiments';
import { trackExperimentEvent } from '@/hooks/use-experiments';
import { formatPrice } from '@/lib/experiments';

export default function PricingClient() {
  const { data: session, status: sessionStatus } = useSession();
  const { variant: pricingVariant, pricing, experimentId: pricingExpId } = usePricingExperiment();
  const { variant: ctaVariant, cta, experimentId: ctaExpId } = useCTAExperiment();
  const { variant: layoutVariant, layout } = useLayoutExperiment();
  const [authPrompt, setAuthPrompt] = React.useState(false);
  
  const currentPlan = (session?.user?.plan as string) || 'free';
  
  // Track page view
  useEffect(() => {
    trackExperimentEvent(pricingExpId, pricingVariant, 'viewed', { page: 'pricing' });
    trackExperimentEvent(ctaExpId, ctaVariant, 'viewed', { page: 'pricing' });
  }, [pricingExpId, pricingVariant, ctaExpId, ctaVariant]);
  
  const handleCheckout = async (planId: 'premium' | 'pro', billingCycle: 'monthly' | 'annual') => {
    // Require authentication before starting checkout
    if (!session?.user?.id) {
      setAuthPrompt(true);
      return;
    }

    // Track CTA click
    trackExperimentEvent(ctaExpId, ctaVariant, 'clicked', { 
      plan: planId,
      billingCycle,
    });
    
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: planId, billingCycle, userId: session.user.id }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Checkout error:', data.error);
        return;
      }
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        // Fallback: session ID only (e.g. local mock) — log and surface an error
        console.warn('[PricingClient] Checkout session returned no URL. Session ID:', data.sessionId);
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  // Render sign-in prompt overlay if unauthenticated user tries to checkout
  const SignInPrompt = authPrompt ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-2">Sign in to continue</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Create a free account or sign in to upgrade your plan.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              const { signIn } = require('next-auth/react');
              signIn('google', { callbackUrl: '/pricing' });
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign in with Google
          </button>
          <button
            onClick={() => setAuthPrompt(false)}
            className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
  
  // Render based on layout variant
  if (layout === 'comparison') {
    return <>
      {SignInPrompt}
      <ComparisonLayout 
        pricing={pricing} 
        cta={cta} 
        currentPlan={currentPlan}
        onCheckout={handleCheckout}
      />
    </>;
  }
  
  if (layout === 'table') {
    return <>
      {SignInPrompt}
      <TableLayout 
        pricing={pricing} 
        cta={cta} 
        currentPlan={currentPlan}
        onCheckout={handleCheckout}
      />
    </>;
  }
  
  // Default: Cards layout (control)
  return <>
    {SignInPrompt}
    <CardsLayout 
      pricing={pricing} 
      cta={cta} 
      currentPlan={currentPlan}
      onCheckout={handleCheckout}
    />
  </>;
}

// =============================================================================
// LAYOUT VARIANTS
// =============================================================================

interface LayoutProps {
  pricing: any;
  cta: any;
  currentPlan: string;
  onCheckout: (plan: 'premium' | 'pro', cycle: 'monthly' | 'annual') => void;
}

function CardsLayout({ pricing, cta, currentPlan, onCheckout }: LayoutProps) {
  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      icon: Zap,
      color: 'slate',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        'Basic stock screening',
        'Up to 3 watchlists',
        '20 stocks per watchlist',
        'Real-time stock prices',
        'Basic financial data',
        'Mobile responsive',
      ],
      cta: currentPlan === 'free' ? 'Current Plan' : null,
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      icon: Sparkles,
      color: 'blue',
      price: pricing.premiumMonthly,
      annualPrice: pricing.premiumAnnual,
      description: 'For serious investors',
      features: [
        'Everything in Free',
        'AI-powered insights',
        'Ownership data',
        'Up to 20 watchlists',
        '100 stocks per watchlist',
        'Up to 10 price alerts',
        '20 saved screeners',
        'Priority support',
      ],
      cta: cta.primaryText,
      popular: true,
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      icon: TrendingUp,
      color: 'purple',
      price: pricing.proMonthly,
      annualPrice: pricing.proAnnual,
      description: 'For professional traders',
      features: [
        'Everything in Premium',
        'Unlimited watchlists',
        'Unlimited stocks per list',
        'Up to 100 price alerts',
        'Unlimited saved screeners',
        'Full API access',
        'Custom webhooks',
        'Historical data export',
        '24/7 dedicated support',
      ],
      cta: cta.primaryText,
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock powerful features to supercharge your investment research
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            const isPremiumOrPro = plan.id === 'premium' || plan.id === 'pro';
            
            return (
              <div
                key={plan.id}
                className={`
                  relative bg-background rounded-2xl border-2 p-8 shadow-lg
                  ${plan.popular ? 'border-blue-500 shadow-blue-500/20 scale-105' : 'border-border'}
                  ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                
                {/* Plan header */}
                <div className="text-center mb-6">
                  <Icon className={`w-12 h-12 mx-auto mb-4 text-${plan.color}-600`} />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                
                {/* Pricing */}
                <div className="text-center mb-6 pb-6 border-b border-border">
                  <div className="text-4xl font-bold mb-2">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  </div>
                  {plan.price > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">per month</div>
                      {plan.annualPrice && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Save {pricing.annualDiscount}% with annual billing
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="shrink-0 mt-0.5 text-green-600" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                {plan.cta && (
                  <button
                    onClick={() => isPremiumOrPro && onCheckout(plan.id, 'monthly')}
                    disabled={isCurrentPlan}
                    className={`
                      w-full py-3 px-6 rounded-lg font-medium transition-all
                      ${isCurrentPlan 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-default'
                        : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }
                    `}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* FAQ / Trust signals */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            All plans include 7-day money-back guarantee • Cancel anytime • No hidden fees
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Midtrans • Secure payments • Your data is encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

function ComparisonLayout({ pricing, cta, currentPlan, onCheckout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Compare Plans</h1>
          <p className="text-muted-foreground">Side-by-side comparison of Premium vs Pro</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Premium Card */}
          <div className="bg-background border-2 border-blue-500 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-3xl font-bold mb-2">Premium</h2>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatPrice(pricing.premiumMonthly)}
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex gap-2"><Check className="text-blue-600 shrink-0" size={20} />AI-powered insights</li>
              <li className="flex gap-2"><Check className="text-blue-600 shrink-0" size={20} />Ownership data</li>
              <li className="flex gap-2"><Check className="text-blue-600 shrink-0" size={20} />Up to 20 watchlists</li>
              <li className="flex gap-2"><Check className="text-blue-600 shrink-0" size={20} />100 stocks per list</li>
              <li className="flex gap-2"><Check className="text-blue-600 shrink-0" size={20} />10 price alerts</li>
            </ul>
            
            <button
              onClick={() => onCheckout('premium', 'monthly')}
              disabled={currentPlan === 'premium'}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-green-100 disabled:text-green-700 disabled:cursor-default"
            >
              {currentPlan === 'premium' ? 'Current Plan' : cta.primaryText}
            </button>
          </div>
          
          {/* Pro Card */}
          <div className="bg-background border-2 border-purple-500 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h2 className="text-3xl font-bold mb-2">Pro</h2>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {formatPrice(pricing.proMonthly)}
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex gap-2"><Check className="text-purple-600 shrink-0" size={20} />Everything in Premium</li>
              <li className="flex gap-2"><Check className="text-purple-600 shrink-0" size={20} />Unlimited watchlists</li>
              <li className="flex gap-2"><Check className="text-purple-600 shrink-0" size={20} />Unlimited stocks</li>
              <li className="flex gap-2"><Check className="text-purple-600 shrink-0" size={20} />100 price alerts</li>
              <li className="flex gap-2"><Check className="text-purple-600 shrink-0" size={20} />Full API access</li>
            </ul>
            
            <button
              onClick={() => onCheckout('pro', 'monthly')}
              disabled={currentPlan === 'pro'}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:bg-green-100 disabled:text-green-700 disabled:cursor-default"
            >
              {currentPlan === 'pro' ? 'Current Plan' : cta.primaryText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableLayout({ pricing, cta, currentPlan, onCheckout }: LayoutProps) {
  const features = [
    { name: 'Basic screening', free: true, premium: true, pro: true },
    { name: 'Real-time prices', free: true, premium: true, pro: true },
    { name: 'Watchlists', free: '3', premium: '20', pro: 'Unlimited' },
    { name: 'Stocks per list', free: '20', premium: '100', pro: 'Unlimited' },
    { name: 'AI insights', free: false, premium: true, pro: true },
    { name: 'Ownership data', free: false, premium: true, pro: true },
    { name: 'Price alerts', free: '0', premium: '10', pro: '100' },
    { name: 'Saved screeners', free: '3', premium: '20', pro: 'Unlimited' },
    { name: 'API access', free: false, premium: false, pro: true },
    { name: 'Webhooks', free: false, premium: false, pro: true },
    { name: 'Historical export', free: false, premium: false, pro: true },
  ];
  
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Feature Comparison</h1>
          <p className="text-muted-foreground">See exactly what each plan includes</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-background rounded-xl border border-border overflow-hidden">
            <thead>
              <tr className="bg-accent">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="text-center p-4 font-semibold">Free</th>
                <th className="text-center p-4 font-semibold bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex flex-col items-center gap-1">
                    <span>Premium</span>
                    <span className="text-sm font-normal text-blue-600">
                      {formatPrice(pricing.premiumMonthly)}/mo
                    </span>
                  </div>
                </th>
                <th className="text-center p-4 font-semibold bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex flex-col items-center gap-1">
                    <span>Pro</span>
                    <span className="text-sm font-normal text-purple-600">
                      {formatPrice(pricing.proMonthly)}/mo
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-4 text-sm">{feature.name}</td>
                  <td className="p-4 text-center">
                    {typeof feature.free === 'boolean' 
                      ? feature.free ? <Check className="mx-auto text-green-600" size={18} /> : '—'
                      : feature.free
                    }
                  </td>
                  <td className="p-4 text-center bg-blue-50/50 dark:bg-blue-900/10">
                    {typeof feature.premium === 'boolean' 
                      ? feature.premium ? <Check className="mx-auto text-blue-600" size={18} /> : '—'
                      : feature.premium
                    }
                  </td>
                  <td className="p-4 text-center bg-purple-50/50 dark:bg-purple-900/10">
                    {typeof feature.pro === 'boolean' 
                      ? feature.pro ? <Check className="mx-auto text-purple-600" size={18} /> : '—'
                      : feature.pro
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* CTAs below table */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div></div> {/* Empty for Free column */}
          
          <button
            onClick={() => onCheckout('premium', 'monthly')}
            disabled={currentPlan === 'premium'}
            className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-green-100 disabled:text-green-700"
          >
            {currentPlan === 'premium' ? 'Current Plan' : cta.primaryText}
          </button>
          
          <button
            onClick={() => onCheckout('pro', 'monthly')}
            disabled={currentPlan === 'pro'}
            className="py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:bg-green-100 disabled:text-green-700"
          >
            {currentPlan === 'pro' ? 'Current Plan' : cta.primaryText}
          </button>
        </div>
      </div>
    </div>
  );
}
