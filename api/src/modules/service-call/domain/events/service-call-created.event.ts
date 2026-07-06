import { DomainEventBase } from '@/core/events/domain-event.interface';
import { ServiceCallStatus } from '../enums/service-call-status.enum';
import { ServiceCallType } from '../enums/service-call-type.enum';

export interface ServiceCallCreatedPayload {
  serviceCallId: string;
  restaurantId: string;
  tableId: string;
  tableName: string;
  type: ServiceCallType;
  reason: string | null;
  status: ServiceCallStatus;
}

export class ServiceCallCreatedEvent extends DomainEventBase {
  constructor(payload: ServiceCallCreatedPayload) {
    super(payload as unknown as Record<string, unknown>);
  }

  get eventName(): string {
    return 'service_call.created';
  }
}
