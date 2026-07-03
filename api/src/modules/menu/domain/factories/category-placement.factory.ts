import { randomUUID } from 'crypto';
import { CategoryPlacement } from '../entities/category-placement.entity';
import { CategoryPlacementCreatedEvent } from '../events/category-placement-created.event';
import { PrimaryCategoryChangedEvent } from '../events/primary-category-changed.event';
import { CategoryPlacementInvariants } from '../invariants/category-placement.invariants';
import { MenuCategoryStatus } from '../enums/menu-category-status.enum';
import { DisplayOrder } from '../value-objects/display-order.vo';

export interface CreateCategoryPlacementInput {
  restaurantId: string;
  categoryId: string;
  menuItemId: string;
  categoryStatus: MenuCategoryStatus;
  categoryRestaurantId: string;
  menuItemRestaurantId: string;
  displayOrder?: number;
  isPrimary?: boolean;
  existingPlacements: CategoryPlacement[];
  createdBy?: string | null;
}

export class CategoryPlacementFactory {
  static create(input: CreateCategoryPlacementInput): CategoryPlacement {
    CategoryPlacementInvariants.assertSameRestaurant(
      input.restaurantId,
      input.categoryRestaurantId,
      input.menuItemRestaurantId,
    );
    CategoryPlacementInvariants.assertCategoryAcceptsNewPlacement(input.categoryStatus);
    CategoryPlacementInvariants.assertNotDuplicate(
      input.categoryId,
      input.menuItemId,
      input.existingPlacements,
    );
    CategoryPlacementInvariants.assertWithinPlacementLimit(
      input.menuItemId,
      input.existingPlacements,
    );

    const isPrimary = input.isPrimary ?? false;

    if (isPrimary) {
      CategoryPlacementInvariants.assertSinglePrimary(
        input.menuItemId,
        input.existingPlacements,
      );
    }

    const now = new Date();
    const placement = CategoryPlacement.reconstitute({
      id: randomUUID(),
      restaurantId: input.restaurantId,
      categoryId: input.categoryId,
      menuItemId: input.menuItemId,
      displayOrder: DisplayOrder.create(input.displayOrder),
      isPrimary,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy ?? null,
      updatedBy: input.createdBy ?? null,
    });

    placement.record(
      new CategoryPlacementCreatedEvent({
        placementId: placement.id,
        restaurantId: placement.restaurantId,
        categoryId: placement.categoryId,
        menuItemId: placement.menuItemId,
        displayOrder: placement.displayOrder.value,
        isPrimary: placement.isPrimary,
      }),
    );

    if (isPrimary) {
      placement.record(
        new PrimaryCategoryChangedEvent({
          menuItemId: placement.menuItemId,
          restaurantId: placement.restaurantId,
          newPrimaryCategoryId: placement.categoryId,
          previousPrimaryCategoryId: null,
          placementId: placement.id,
        }),
      );
    }

    return placement;
  }
}
