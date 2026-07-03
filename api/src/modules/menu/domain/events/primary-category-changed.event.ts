import { DomainEventBase } from '@/core/events/domain-event.interface';

export interface PrimaryCategoryChangedPayload {
  menuItemId: string;
  restaurantId: string;
  newPrimaryCategoryId: string;
  previousPrimaryCategoryId: string | null;
  placementId: string;
}

export class PrimaryCategoryChangedEvent extends DomainEventBase {
  constructor(payload: PrimaryCategoryChangedPayload) {
    super(payload as unknown as Record<string, unknown>);
  }

  get eventName(): string {
    return 'menu.category-placement.primary-changed';
  }
}
