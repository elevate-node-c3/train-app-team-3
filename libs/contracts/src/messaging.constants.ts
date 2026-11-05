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