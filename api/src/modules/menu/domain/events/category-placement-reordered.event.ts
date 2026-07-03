import { DomainEventBase } from '@/core/events/domain-event.interface';

export interface CategoryPlacementReorderedPayload {
  placementId: string;
  restaurantId: string;
  categoryId: string;
  menuItemId: string;
  previousDisplayOrder: number;
  newDisplayOrder: number;
}

export class CategoryPlacementReorderedEvent extends DomainEventBase {
  constructor(payload: CategoryPlacementReorderedPayload) {
    super(payload as unknown as Record<string, unknown>);
  }

  get eventName(): string {
    return 'menu.category-placement.reordered';
  }
}
