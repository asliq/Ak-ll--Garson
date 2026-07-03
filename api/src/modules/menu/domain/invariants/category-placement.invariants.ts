import { DomainException } from '@/shared/exceptions/domain.exception';
import { MenuCategoryStatus } from '../enums/menu-category-status.enum';
import { CategoryPlacement } from '../entities/category-placement.entity';

export class CategoryPlacementInvariants {
  /**
   * BR-CP-01: Aynı (categoryId, menuItemId) çifti tekrarlanamaz.
   */
  static assertNotDuplicate(
    categoryId: string,
    menuItemId: string,
    existing: CategoryPlacement[],
  ): void {
    const duplicate = existing.find(
      (placement) =>
        placement.categoryId === categoryId && placement.menuItemId === menuItemId,
    );

    if (duplicate) {
      throw new DomainException(
        'Menu item is already placed in this category',
        'CATEGORY_PLACEMENT_DUPLICATE',
        409,
        { categoryId, menuItemId, existingPlacementId: duplicate.id },
      );
    }
  }

  /**
   * BR-CP-02: Bir menuItem için yalnızca bir isPrimary=true placement olabilir.
   */
  static assertSinglePrimary(
    menuItemId: string,
    placements: CategoryPlacement[],
    candidatePlacementId?: string,
  ): void {
    const primaryPlacements = placements.filter(
      (placement) =>
        placement.menuItemId === menuItemId &&
        placement.isPrimary &&
        placement.id !== candidatePlacementId,
    );

    if (primaryPlacements.length > 0) {
      throw new DomainException(
        'Menu item already has a primary category placement',
        'CATEGORY_PLACEMENT_MULTIPLE_PRIMARY',
        409,
        {
          menuItemId,
          existingPrimaryId: primaryPlacements[0].id,
        },
      );
    }
  }

  /**
   * BR-CP-03: Primary placement silinemez; önce başka bir placement primary yapılmalı.
   */
  static assertCanRemove(placement: CategoryPlacement): void {
    if (placement.isPrimary) {
      throw new DomainException(
        'Primary category placement cannot be removed directly; reassign primary first',
        'CATEGORY_PLACEMENT_PRIMARY_REMOVE_FORBIDDEN',
        400,
        { placementId: placement.id, menuItemId: placement.menuItemId },
      );
    }
  }

  /**
   * BR-CP-04: Archived kategoriye yeni placement eklenemez.
   * BR-CP-05: Hidden kategoriye placement eklenebilir (staff yönetimi).
   */
  static assertCategoryAcceptsNewPlacement(categoryStatus: MenuCategoryStatus): void {
    if (categoryStatus === MenuCategoryStatus.ARCHIVED) {
      throw new DomainException(
        'Cannot add placement to an archived category',
        'CATEGORY_PLACEMENT_CATEGORY_ARCHIVED',
        400,
        { categoryStatus },
      );
    }
  }

  /**
   * BR-CP-06: Category ve MenuItem aynı restaurant'a ait olmalı.
   * Use case katmanı aggregate'leri yükledikten sonra çağırır.
   */
  static assertSameRestaurant(
    restaurantId: string,
    categoryRestaurantId: string,
    menuItemRestaurantId: string,
  ): void {
    if (
      restaurantId !== categoryRestaurantId ||
      restaurantId !== menuItemRestaurantId
    ) {
      throw new DomainException(
        'Category and menu item must belong to the same restaurant',
        'CATEGORY_PLACEMENT_TENANT_MISMATCH',
        400,
        { restaurantId, categoryRestaurantId, menuItemRestaurantId },
      );
    }
  }

  /**
   * BR-CP-07: Placement limiti — performans koruması (configurable).
   */
  static assertWithinPlacementLimit(
    menuItemId: string,
    existing: CategoryPlacement[],
    maxPlacements = 10,
  ): void {
    const count = existing.filter((p) => p.menuItemId === menuItemId).length;

    if (count >= maxPlacements) {
      throw new DomainException(
        `Menu item cannot exceed ${maxPlacements} category placements`,
        'CATEGORY_PLACEMENT_LIMIT_EXCEEDED',
        400,
        { menuItemId, count, maxPlacements },
      );
    }
  }
}

/**
 * Category ARCHIVED olduğunda placement davranışı (application/query katmanı):
 *
 * - Mevcut placement kayıtları SILINMEZ (MenuItem etkilenmez).
 * - Menü listeleme sorguları archived kategorileri ve içindeki placement'ları filtreler.
 * - Yeni placement eklenemez (assertCategoryAcceptsNewPlacement).
 * - Primary category archived ise: use case başka bir primary atamayı zorunlu kılar
 *   veya ürün o kategoride görünmez (QR menü publish kuralları).
 * - Restore category use case'i placement'ları otomatik re-activate etmez; kayıtlar durur.
 */
