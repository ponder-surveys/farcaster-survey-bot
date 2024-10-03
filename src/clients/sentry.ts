import { SENTRY_DSN, SENTRY_ENVIRONMENT } from '../utils/constants'
import * as Sentry from '@sentry/node'

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    enabled: process.env.NODE_ENV === 'production',
  })
}

export { Sentry }
