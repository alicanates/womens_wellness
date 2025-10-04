/**
 * Standardized Error Codes
 */
export enum ErrorCode {
  // Auth errors (1xxx)
  AUTH_INVALID_CREDENTIALS = 1001,
  AUTH_TOKEN_EXPIRED = 1002,
  AUTH_UNAUTHORIZED = 1003,

  // Validation errors (2xxx)
  VALIDATION_FAILED = 2001,
  INVALID_INPUT = 2002,

  // Business logic errors (3xxx)
  QUOTA_EXCEEDED = 3001,
  SUBSCRIPTION_EXPIRED = 3002,

  // System errors (5xxx)
  INTERNAL_ERROR = 5000,
  DATABASE_ERROR = 5001,
  AI_PROVIDER_ERROR = 5002,
}
