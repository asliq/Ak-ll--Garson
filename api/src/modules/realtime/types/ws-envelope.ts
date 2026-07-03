export interface WsEnvelope<T = Record<string, unknown>> {
  type: string;
  payload: T;
  timestamp: number;
  restaurantId: string;
}

export interface WsJoinPayload {
  role: 'staff' | 'customer';
  restaurantId?: string;
  tableToken?: string;
  tableId?: string;
}
