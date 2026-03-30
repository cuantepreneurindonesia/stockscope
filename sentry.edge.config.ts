import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
