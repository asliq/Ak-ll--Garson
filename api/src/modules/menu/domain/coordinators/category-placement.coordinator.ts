import { DomainEvent } from '@/core/events/domain-event.interface';
import { CategoryPlacement } from '../entities/category-placement.entity';
import { CategoryPlacementRemovedEvent } from '../events/category-placement-removed.event';
import { CategoryPlacementReorderedEvent } from '../events/category-placement-reordered.event';
import { PrimaryCategoryChangedEvent } from '../events/primary-category-changed.event';
import { CategoryPlacementInvariants } from '../invariants/category-placement.invariants';
import { DisplayOrder } from '../value-objects/display-order.vo';

export class CategoryPlacementCoordinator {
  static prepareRemoval(placement: CategoryPlacement): CategoryPlacementRemovedEvent {
    CategoryPlacementInvariants.assertCanRemove(placement);

    return new CategoryPlacementRemovedEvent({
      placementId: placement.id,
      restaurantId: placement.restaurantId,
      categoryId: placement.categoryId,
      menuItemId: placement.menuItemId,
      wasPrimary: placement.isPrimary,
    });
  }

  static promoteToPrimary(
    target: CategoryPlacement,
    itemPlacements: CategoryPlacement[],
    actorId?: string | null,
  ): DomainEvent[] {
    CategoryPlacementInvariants.assertSinglePrimary(
      target.menuItemId,
      itemPlacements,
      target.id,
    );

    const events: DomainEvent[] = [];
    const currentPrimary = itemPlacements.find(
      (p) => p.menuItemId === target.menuItemId && p.isPrimary && p.id !== target.id,
    );

    if (currentPrimary) {
      currentPrimary.unmarkPrimary(actorId);
    }

    target.markAsPrimary(actorId);

    events.push(
      new PrimaryCategoryChangedEvent({
        menuItemId: target.menuItemId,
        restaurantId: target.restaurantId,
        newPrimaryCategoryId: target.categoryId,
        previousPrimaryCategoryId: currentPrimary?.categoryId ?? null,
        placementId: target.id,
      }),
    );

    return events;
  }

  static reorder(
    placement: CategoryPlacement,
    newOrder: number,
    actorId?: string | null,
  ): CategoryPlacementReorderedEvent {
    const previous = placement.displayOrder.value;
    placement.changeDisplayOrder(DisplayOrder.create(newOrder), actorId);

    return new CategoryPlacementReorderedEvent({
      placementId: placement.id,
      restaurantId: placement.restaurantId,
      categoryId: placement.categoryId,
      menuItemId: placement.menuItemId,
      previousDisplayOrder: previous,
      newDisplayOrder: newOrder,
    });
  }
}
