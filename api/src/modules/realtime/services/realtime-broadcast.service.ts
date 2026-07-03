import { Injectable, Logger } from '@nestjs/common';
import { RealtimeRoomService } from './realtime-room.service';
import { WsEnvelope } from '../types/ws-envelope';

@Injectable()
export class RealtimeBroadcastService {
  private readonly logger = new Logger(RealtimeBroadcastService.name);

  constructor(private readonly roomService: RealtimeRoomService) {}

  publishOrderEvent(
    restaurantId: string,
    tableId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): void {
    const envelope: WsEnvelope = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      restaurantId,
    };

    const message = JSON.stringify(envelope);
    const restaurantRoom = this.roomService.restaurantRoom(restaurantId);
    const tableRoom = this.roomService.tableRoom(tableId);

    this.roomService.broadcastToRoom(restaurantRoom, message, restaurantId);
    this.roomService.broadcastToRoom(tableRoom, message, restaurantId);

    this.logger.debug(`WS ${eventType} → restaurant=${restaurantId} table=${tableId}`);
  }
}
