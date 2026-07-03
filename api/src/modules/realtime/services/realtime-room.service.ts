import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WS_ROOM_PREFIX } from '../constants/ws-events';

export interface RealtimeClientContext {
  client: WebSocket;
  restaurantId: string;
  tableId?: string;
  role: 'staff' | 'customer';
}

@Injectable()
export class RealtimeRoomService {
  private readonly rooms = new Map<string, Set<WebSocket>>();
  private readonly contexts = new Map<WebSocket, RealtimeClientContext>();

  restaurantRoom(restaurantId: string): string {
    return `${WS_ROOM_PREFIX.RESTAURANT}:${restaurantId}`;
  }

  tableRoom(tableId: string): string {
    return `${WS_ROOM_PREFIX.TABLE}:${tableId}`;
  }

  register(client: WebSocket, context: RealtimeClientContext): void {
    this.contexts.set(client, context);

    if (context.role === 'staff') {
      this.join(client, this.restaurantRoom(context.restaurantId));
    }

    if (context.role === 'customer' && context.tableId) {
      this.join(client, this.tableRoom(context.tableId));
    }
  }

  join(client: WebSocket, room: string): void {
    let members = this.rooms.get(room);
    if (!members) {
      members = new Set();
      this.rooms.set(room, members);
    }
    members.add(client);
  }

  leave(client: WebSocket): void {
    this.contexts.delete(client);

    for (const [room, members] of this.rooms.entries()) {
      members.delete(client);
      if (members.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  getContext(client: WebSocket): RealtimeClientContext | undefined {
    return this.contexts.get(client);
  }

  getClientsInRoom(room: string): WebSocket[] {
    return Array.from(this.rooms.get(room) ?? []);
  }

  broadcastToRoom(room: string, message: string, restaurantId: string): void {
    const members = this.rooms.get(room);
    if (!members) return;

    for (const client of members) {
      const context = this.contexts.get(client);
      if (!context || context.restaurantId !== restaurantId) continue;
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  }
}
