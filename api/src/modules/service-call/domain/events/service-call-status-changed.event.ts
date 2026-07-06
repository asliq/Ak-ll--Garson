import { DomainEventBase } from '@/core/events/domain-event.interface';
import { ServiceCallStatus } from '../enums/service-call-status.enum';
import { ServiceCallType } from '../enums/service-call-type.enum';

export interface ServiceCallStatusChangedPayload {
  serviceCallId: string;
  restaurantId: string;
  tableId: string;
  tableName: string;
  type: ServiceCallType;
  reason: string | null;
  previousStatus: ServiceCallStatus;
  newStatus: ServiceCallStatus;
}

export class ServiceCallStatusChangedEvent extends DomainEventBase {
  constructor(payload: ServiceCallStatusChangedPayload) {
    super(payload as unknown as Record<string, unknown>);
  }

  get eventName(): string {
    return 'service_call.status-changed';
  }
}
