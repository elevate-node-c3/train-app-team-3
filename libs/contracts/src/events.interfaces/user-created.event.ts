export const USER_CREATED_EVENT_KEY = "user-created" as const;

export interface UserCreatedEvent {
  eventId: string;
  type: typeof USER_CREATED_EVENT_KEY;
  version: 1;
  occurredAt: string;
  correlationId: string;
  producer: "identity";
  payload: {
    userId: string;
    email: string;
    createdAt: string;
  };
}
