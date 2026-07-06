export const WS_ORDER_EVENTS = {
  CREATED: 'order.created',
  UPDATED: 'order.updated',
  READY: 'order.ready',
  SERVED: 'order.served',
} as const;

export const WS_SERVICE_CALL_EVENTS = {
  CREATED: 'service_call.created',
  UPDATED: 'service_call.updated',
} as const;

export const WS_CLIENT_EVENTS = {
  JOIN: 'join',
  CONNECTED: 'connected',
} as const;

export const WS_ROOM_PREFIX = {
  RESTAURANT: 'restaurant',
  TABLE: 'table',
} as const;
