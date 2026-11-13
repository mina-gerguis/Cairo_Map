/**
 * Security Event Logger for Qareeb Map (Cairo Map)
 * Centralized audit trail for security-critical actions and suspicious behaviors.
 */

export type SecurityLogLevel = 'info' | 'warn' | 'error' | 'critical';

export type SecurityEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_BRUTE_FORCE_LOCKOUT'
  | 'AUTH_UNAUTHORIZED_ADMIN_ACCESS'
  | 'PASSWORD_RESET_REQUEST'
  | 'SENSITIVE_COLUMN_UPDATE_ATTEMPT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_INPUT_DETECTED'
  | 'ADMIN_ACTION_EXECUTED';

export interface SecurityEventPayload {
  event: SecurityEventType;
  level: SecurityLogLevel;
  message: string;
  ip?: string;
  userId?: string;
  path?: string;
  details?: Record<string, any>;
}

export function logSecurityEvent(payload: SecurityEventPayload): void {
  const timestamp = new Date().toISOString();
  const logRecord = {
    timestamp,
    ...payload,
  };

  // Structured logging format for observability (Vercel / Datadog / CloudWatch)
  const formatted = `[SECURITY_AUDIT] [${timestamp}] [${payload.level.toUpperCase()}] [${payload.event}]: ${payload.message}`;

  switch (payload.level) {
    case 'critical':
    case 'error':
      console.error(formatted, payload.details ? JSON.stringify(payload.details) : '');
      break;
    case 'warn':
      console.warn(formatted, payload.details ? JSON.stringify(payload.details) : '');
      break;
    default:
      console.info(formatted, payload.details ? JSON.stringify(payload.details) : '');
      break;
  }
}
