import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ServiceCallCreatedPayload } from '@/modules/service-call/domain/events/service-call-created.event';
import { ServiceCallStatusChangedPayload } from '@/modules/service-call/domain/events/service-call-status-changed.event';
import { WS_SERVICE_CALL_EVENTS } from '../constants/ws-events';
import { RealtimeBroadcastService } from '../services/realtime-broadcast.service';

@Injectable()
export class ServiceCallRealtimeHandler {
  constructor(private readonly broadcast: RealtimeBroadcastService) {}

  @OnEvent('service_call.created')
  handleCreated(event: { payload: ServiceCallCreatedPayload }): void {
    const payload = event.payload;

    this.broadcast.publishOrderEvent(
      payload.restaurantId,
      payload.tableId,
      WS_SERVICE_CALL_EVENTS.CREATED,
      {
        serviceCallId: payload.serviceCallId,
        tableId: payload.tableId,
        tableName: payload.tableName,
        type: payload.type,
        reason: payload.reason,
        status: payload.status,
      },
    );
  }

  @OnEvent('service_call.status-changed')
  handleStatusChanged(event: { payload: ServiceCallStatusChangedPayload }): void {
    const payload = event.payload;

    this.broadcast.publishOrderEvent(
      payload.restaurantId,
      payload.tableId,
      WS_SERVICE_CALL_EVENTS.UPDATED,
      {
        serviceCallId: payload.serviceCallId,
        tableId: payload.tableId,
        tableName: payload.tableName,
        type: payload.type,
        reason: payload.reason,
        status: payload.newStatus,
        previousStatus: payload.previousStatus,
      },
    );
  }
}
