import { DomainEventBase } from '@/core/events/domain-event.interface';

export interface CategoryPlacementCreatedPayload {
  placementId: string;
  restaurantId: string;
  categoryId: string;
  menuItemId: string;
  displayOrder: number;
  isPrimary: boolean;
}

export class CategoryPlacementCreatedEvent extends DomainEventBase {
  constructor(payload: CategoryPlacementCreatedPayload) {
    super(payload as unknown as Record<string, unknown>);
  }

  get eventName(): string {
    return 'menu.category-placement.created';
  }
}
