'use client';

import { useState } from 'react';
import { API_SCOPES, PLAN_PACKAGES, getScopeDescription, type ApiScope } from '@/lib/api-scopes';

interface ScopeExplorerProps {
  plan: string;
}

export default function ScopeExplorer({ plan }: ScopeExplorerProps) {
  const [expandedScope, setExpandedScope] = useState<string | null>(null);
  
  const planConfig = PLAN_PACKAGES[plan as keyof typeof PLAN_PACKAGES] || PLAN_PACKAGES.free;
  const allScopes = Object.keys(API_SCOPES) as ApiScope[];
  const yourScopes = planConfig.scopes;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Your API Access
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Your {plan} plan includes {yourScopes.length} of {allScopes.length} available scopes
      </p>
      
      {/* Rate Limit Badge */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
              Rate Limit
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {planConfig.rateLimit.toLocaleString()} requests/hour
            </div>
          </div>
          <svg className="w-12 h-12 text-emerald-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      
      {/* Scopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allScopes.map((scope) => {
          const hasScope = yourScopes.includes(scope);
          const isExpanded = expandedScope === scope;
          
          return (
            <div
              key={scope}
              className={`p-4 rounded-lg border-2 transition-all ${
                hasScope
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {hasScope ? (
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <code className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                      {scope}
                    </code>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {getScopeDescription(scope as any)}
                  </p>
                </div>
              </div>
              
              {!hasScope && (
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                  Upgrade to unlock this scope
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Upgrade CTA */}
      {plan === 'free' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold mb-1">Unlock More Features</div>
              <div className="text-sm opacity-90">
                Upgrade to Premium for {PLAN_PACKAGES.premium.scopes.length} scopes and 10x rate limit
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      )}
      
      {plan === 'premium' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold mb-1">Go Pro</div>
              <div className="text-sm opacity-90">
                Access historical data and custom screeners with Pro plan
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
