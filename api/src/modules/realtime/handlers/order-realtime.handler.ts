import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedPayload } from '@/modules/order/domain/events/order-created.event';
import { OrderStatusChangedPayload } from '@/modules/order/domain/events/order-status-changed.event';
import { OrderStatus } from '@/modules/order/domain/enums/order-status.enum';
import { WS_ORDER_EVENTS } from '../constants/ws-events';
import { RealtimeBroadcastService } from '../services/realtime-broadcast.service';

@Injectable()
export class OrderRealtimeHandler {
  constructor(private readonly broadcast: RealtimeBroadcastService) {}

  @OnEvent('order.created')
  handleOrderCreated(event: { payload: OrderCreatedPayload }): void {
    const payload = event.payload;

    this.broadcast.publishOrderEvent(
      payload.restaurantId,
      payload.tableId,
      WS_ORDER_EVENTS.CREATED,
      {
        orderId: payload.orderId,
        tableId: payload.tableId,
        status: payload.status,
        lineCount: payload.lineCount,
        totalMinor: payload.totalMinor,
        currencyCode: payload.currencyCode,
      },
    );
  }

  @OnEvent('order.status-changed')
  handleOrderStatusChanged(event: { payload: OrderStatusChangedPayload }): void {
    const payload = event.payload;
    const basePayload = {
      orderId: payload.orderId,
      tableId: payload.tableId,
      status: payload.newStatus,
      previousStatus: payload.previousStatus,
    };

    this.broadcast.publishOrderEvent(
      payload.restaurantId,
      payload.tableId,
      WS_ORDER_EVENTS.UPDATED,
      basePayload,
    );

    if (payload.newStatus === OrderStatus.PARTIALLY_SERVED) {
      this.broadcast.publishOrderEvent(
        payload.restaurantId,
        payload.tableId,
        WS_ORDER_EVENTS.READY,
        basePayload,
      );
    }

    if (payload.newStatus === OrderStatus.SERVED) {
      this.broadcast.publishOrderEvent(
        payload.restaurantId,
        payload.tableId,
        WS_ORDER_EVENTS.SERVED,
        basePayload,
      );
    }
  }
}
