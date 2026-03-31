// API Scope Configuration
// Defines permission scopes and endpoint mappings for API monetization

export type ApiScope = 
  | 'read:stocks'
  | 'read:screener'
  | 'read:ownership'
  | 'read:financials'
  | 'read:historical'
  | 'write:watchlist'
  | 'write:alerts'
  | 'write:screeners';

// =============================================================================
// PLAN-BASED SCOPE PACKAGES
// =============================================================================

export interface PlanPackage {
  plan: 'free' | 'premium' | 'pro';
  rateLimit: number; // requests per hour
  scopes: ApiScope[];
  features: string[];
}

export const PLAN_PACKAGES: Record<string, PlanPackage> = {
  free: {
    plan: 'free',
    rateLimit: 100,
    scopes: [
      'read:stocks',
      'read:screener',
    ],
    features: [
      'Stock search and details',
      'Basic screener queries',
      '100 requests/hour',
    ],
  },
  premium: {
    plan: 'premium',
    rateLimit: 1000,
    scopes: [
      'read:stocks',
      'read:screener',
      'read:ownership',
      'read:financials',
      'write:watchlist',
      'write:alerts',
    ],
    features: [
      'All Free features',
      'Ownership data access',
      'Financial statements',
      'Watchlist management',
      'Price alerts',
      '1,000 requests/hour',
    ],
  },
  pro: {
    plan: 'pro',
    rateLimit: 10000,
    scopes: [
      'read:stocks',
      'read:screener',
      'read:ownership',
      'read:financials',
      'read:historical',
      'write:watchlist',
      'write:alerts',
      'write:screeners',
    ],
    features: [
      'All Premium features',
      'Historical price data',
      'Custom screener saving',
      '10,000 requests/hour',
      'Priority support',
    ],
  },
};

// =============================================================================
// ENDPOINT → SCOPE MAPPING
// =============================================================================

export interface EndpointScopeRule {
  pattern: RegExp;
  scope: ApiScope;
  methods?: string[]; // If undefined, applies to all methods
}

export const ENDPOINT_SCOPE_RULES: EndpointScopeRule[] = [
  // Stocks API
  { 
    pattern: /^\/api\/v1\/stocks$/,
    scope: 'read:stocks',
    methods: ['GET'],
  },
  { 
    pattern: /^\/api\/v1\/stocks\/search$/,
    scope: 'read:stocks',
    methods: ['GET'],
  },
  { 
    pattern: /^\/api\/v1\/stocks\/[^/]+$/,
    scope: 'read:stocks',
    methods: ['GET'],
  },
  
  // Screener API
  { 
    pattern: /^\/api\/v1\/screener$/,
    scope: 'read:screener',
    methods: ['GET', 'POST'],
  },
  { 
    pattern: /^\/api\/v1\/screener\/filters$/,
    scope: 'read:screener',
    methods: ['GET'],
  },
  
  // Ownership API (Premium+)
  { 
    pattern: /^\/api\/v1\/ownership$/,
    scope: 'read:ownership',
    methods: ['GET'],
  },
  { 
    pattern: /^\/api\/v1\/ownership\/[^/]+$/,
    scope: 'read:ownership',
    methods: ['GET'],
  },
  
  // Financials API (Premium+)
  { 
    pattern: /^\/api\/v1\/financials\/[^/]+$/,
    scope: 'read:financials',
    methods: ['GET'],
  },
  
  // Historical Data API (Pro only)
  { 
    pattern: /^\/api\/v1\/historical\/[^/]+$/,
    scope: 'read:historical',
    methods: ['GET'],
  },
  
  // Watchlist API (Premium+)
  { 
    pattern: /^\/api\/v1\/watchlists$/,
    scope: 'write:watchlist',
    methods: ['POST'],
  },
  { 
    pattern: /^\/api\/v1\/watchlists\/[^/]+$/,
    scope: 'write:watchlist',
    methods: ['PUT', 'DELETE'],
  },
  { 
    pattern: /^\/api\/v1\/watchlists$/,
    scope: 'read:stocks', // Reading watchlists requires read:stocks
    methods: ['GET'],
  },
  
  // Alerts API (Premium+)
  { 
    pattern: /^\/api\/v1\/alerts$/,
    scope: 'write:alerts',
    methods: ['POST'],
  },
  { 
    pattern: /^\/api\/v1\/alerts\/[^/]+$/,
    scope: 'write:alerts',
    methods: ['PUT', 'DELETE'],
  },
  
  // Saved Screeners API (Pro only)
  { 
    pattern: /^\/api\/v1\/screeners$/,
    scope: 'write:screeners',
    methods: ['POST'],
  },
  { 
    pattern: /^\/api\/v1\/screeners\/[^/]+$/,
    scope: 'write:screeners',
    methods: ['PUT', 'DELETE'],
  },
];

// =============================================================================
// SCOPE VALIDATION
// =============================================================================

/**
 * Get required scope for an endpoint
 * Returns null if endpoint doesn't require a specific scope
 */
export function getRequiredScope(
  endpoint: string,
  method: string
): ApiScope | null {
  for (const rule of ENDPOINT_SCOPE_RULES) {
    if (rule.pattern.test(endpoint)) {
      // Check if method matches (if specified)
      if (rule.methods && !rule.methods.includes(method)) {
        continue;
      }
      return rule.scope;
    }
  }
  
  return null; // No scope required (public endpoint)
}

/**
 * Check if API key has required scope
 */
export function hasScope(keyScopes: ApiScope[], requiredScope: ApiScope): boolean {
  return keyScopes.includes(requiredScope);
}

/**
 * Get all scopes for a plan
 */
export function getPlanScopes(plan: string): ApiScope[] {
  const planPackage = PLAN_PACKAGES[plan];
  return planPackage ? planPackage.scopes : PLAN_PACKAGES.free.scopes;
}

/**
 * Get rate limit for a plan
 */
export function getPlanRateLimit(plan: string): number {
  const planPackage = PLAN_PACKAGES[plan];
  return planPackage ? planPackage.rateLimit : PLAN_PACKAGES.free.rateLimit;
}

/**
 * Check if a plan has access to a scope
 */
export function planHasScope(plan: string, scope: ApiScope): boolean {
  const scopes = getPlanScopes(plan);
  return scopes.includes(scope);
}

/**
 * Get scope description for error messages
 */
export function getScopeDescription(scope: ApiScope): string {
  const descriptions: Record<ApiScope, string> = {
    'read:stocks': 'Stock data access',
    'read:screener': 'Stock screener queries',
    'read:ownership': 'Ownership data access (Premium+)',
    'read:financials': 'Financial statements access (Premium+)',
    'read:historical': 'Historical price data (Pro only)',
    'write:watchlist': 'Watchlist management (Premium+)',
    'write:alerts': 'Price alert management (Premium+)',
    'write:screeners': 'Custom screener saving (Pro only)',
  };
  
  return descriptions[scope] || scope;
}

/**
 * Get minimum plan required for a scope
 */
export function getMinimumPlanForScope(scope: ApiScope): string {
  if (PLAN_PACKAGES.free.scopes.includes(scope)) return 'free';
  if (PLAN_PACKAGES.premium.scopes.includes(scope)) return 'premium';
  if (PLAN_PACKAGES.pro.scopes.includes(scope)) return 'pro';
  return 'pro'; // Default to highest tier
}

// =============================================================================
// SCOPE UPGRADE SUGGESTIONS
// =============================================================================

export interface UpgradeSuggestion {
  currentPlan: string;
  suggestedPlan: string;
  missingScopes: ApiScope[];
  benefits: string[];
  priceDifference?: string;
}

/**
 * Get upgrade suggestion for missing scope
 */
export function getUpgradeSuggestion(
  currentPlan: string,
  requiredScope: ApiScope
): UpgradeSuggestion | null {
  const currentScopes = getPlanScopes(currentPlan);
  
  if (currentScopes.includes(requiredScope)) {
    return null; // Already has access
  }
  
  const suggestedPlan = getMinimumPlanForScope(requiredScope);
  const suggestedScopes = getPlanScopes(suggestedPlan);
  const missingScopes = suggestedScopes.filter(s => !currentScopes.includes(s));
  
  const benefits = PLAN_PACKAGES[suggestedPlan]?.features || [];
  
  return {
    currentPlan,
    suggestedPlan,
    missingScopes,
    benefits,
  };
}
