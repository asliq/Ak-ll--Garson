import { DomainEventBase } from '@/core/events/domain-event.interface';

export interface CategoryPlacementRemovedPayload {
  placementId: string;
  restaurantId: string;
  categoryId: string;
  menuItemId: string;
  wasPrimary: boolean;
}

export class CategoryPlacementRemovedEvent extends DomainEventBase {
  constructor(payload: CategoryPlacementRemovedPayload) {
    super(payload as unknown as Record<string, unknown>);
  }

  get eventName(): string {
    return 'menu.category-placement.removed';
  }
}
