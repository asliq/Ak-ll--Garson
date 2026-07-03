import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server } from 'ws';
import { WebSocket } from 'ws';
import { TABLE_LOOKUP } from '@/modules/order/application/ports/tokens';
import { TableLookupPort } from '@/modules/order/application/ports/table-lookup.port';
import { WS_CLIENT_EVENTS } from '../constants/ws-events';
import { RealtimeRoomService } from '../services/realtime-room.service';
import { WsJoinPayload } from '../types/ws-envelope';

@WebSocketGateway({ path: '/ws', cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly roomService: RealtimeRoomService,
    @Inject(TABLE_LOOKUP)
    private readonly tableLookup: TableLookupPort,
  ) {}

  handleConnection(client: WebSocket): void {
    this.send(client, {
      type: WS_CLIENT_EVENTS.CONNECTED,
      payload: {},
      timestamp: Date.now(),
      restaurantId: '',
    });
  }

  handleDisconnect(client: WebSocket): void {
    this.roomService.leave(client);
  }

  @SubscribeMessage(WS_CLIENT_EVENTS.JOIN)
  async handleJoin(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: WsJoinPayload,
  ): Promise<void> {
    if (!data?.role) {
      this.sendError(client, 'JOIN_ROLE_REQUIRED');
      return;
    }

    if (data.role === 'staff') {
      await this.joinStaff(client, data);
      return;
    }

    if (data.role === 'customer') {
      await this.joinCustomer(client, data);
      return;
    }

    this.sendError(client, 'JOIN_INVALID_ROLE');
  }

  private async joinStaff(client: WebSocket, data: WsJoinPayload): Promise<void> {
    const restaurantId = data.restaurantId?.trim();
    if (!restaurantId) {
      this.sendError(client, 'JOIN_RESTAURANT_REQUIRED');
      return;
    }

    this.roomService.leave(client);
    this.roomService.register(client, {
      client,
      restaurantId,
      role: 'staff',
    });

    this.logger.debug(`Staff joined restaurant:${restaurantId}`);
  }

  private async joinCustomer(client: WebSocket, data: WsJoinPayload): Promise<void> {
    let restaurantId = data.restaurantId?.trim();
    let tableId = data.tableId?.trim();

    if (data.tableToken?.trim()) {
      const table = await this.tableLookup.findActiveByToken(data.tableToken.trim());
      if (!table) {
        this.sendError(client, 'JOIN_TABLE_NOT_FOUND');
        return;
      }
      restaurantId = table.restaurantId;
      tableId = table.tableId;
    }

    if (!restaurantId || !tableId) {
      this.sendError(client, 'JOIN_TABLE_REQUIRED');
      return;
    }

    this.roomService.leave(client);
    this.roomService.register(client, {
      client,
      restaurantId,
      tableId,
      role: 'customer',
    });

    this.logger.debug(`Customer joined table:${tableId} restaurant:${restaurantId}`);
  }

  private send(
    client: WebSocket,
    envelope: { type: string; payload: Record<string, unknown>; timestamp: number; restaurantId: string },
  ): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(envelope));
    }
  }

  private sendError(client: WebSocket, code: string): void {
    this.send(client, {
      type: 'error',
      payload: { code },
      timestamp: Date.now(),
      restaurantId: '',
    });
  }
}
