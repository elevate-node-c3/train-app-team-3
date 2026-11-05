export const EVENTS_EXCHANGE = 'app.events';
export const NOTIFICATION_DLX = 'notification.dlx';
export const NOTIFICATION_QUEUE = 'notification.verification-code.queue';
export const NOTIFICATION_DLQ = 'notification.verification-code.dlq';

export const ROUTING_KEYS = {
  VERIFICATION_CODE_ISSUED: 'verification_code_issued',
} as const;

export type RoutingKey = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];

export const NOTIFICATION_QUEUE_ARGUMENTS = {
  'x-dead-letter-exchange': NOTIFICATION_DLX,
  'x-dead-letter-routing-key': ROUTING_KEYS.VERIFICATION_CODE_ISSUED,
};

export const NOTIFICATION_RETRY_DELAYS_MS = [5_000, 15_000, 60_000, 300_000] as const;
export const NOTIFICATION_MAX_RETRIES = NOTIFICATION_RETRY_DELAYS_MS.length;

export const notificationRetryQueue = (delayMs: number) =>
  `notification.verification-code.retry.${delayMs}ms`;

export const MESSAGE_HEADERS = {
  RETRY_COUNT: 'x-retry-count',
  LAST_ERROR: 'x-last-error',
  FAILURE_REASON: 'x-failure-reason',
  FAILED_AT: 'x-failed-at',
} as const;