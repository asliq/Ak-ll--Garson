import { Injectable } from '@nestjs/common';
import {
  MenuCategoryStatus,
  MenuItemStatus,
  MenuPriceStatus,
} from '@prisma/client';
import { PrismaService } from '@/core/database/prisma.service';
import {
  PublicMenuCategoryReadModel,
  PublicMenuItemReadModel,
  PublicMenuReadModel,
  PublicMenuRepositoryPort,
} from '../../../application/ports/public-menu.repository.port';

type MenuPriceRecord = {
  amountMinor: bigint;
  currencyCode: string;
  status: MenuPriceStatus;
  branchId: string | null;
  salesChannelId: string | null;
  priority: number;
  createdAt: Date;
};

@Injectable()
export class PrismaPublicMenuRepository implements PublicMenuRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByTableToken(tableToken: string): Promise<PublicMenuReadModel | null> {
    const table = await this.prisma.table.findFirst({
      where: {
        tableToken,
        deletedAt: null,
        isActive: true,
        restaurant: {
          isActive: true,
        },
      },
      include: {
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!table) {
      return null;
    }

    const categories = await this.prisma.menuCategory.findMany({
      where: {
        restaurantId: table.restaurantId,
        status: MenuCategoryStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        placements: {
          where: {
            menuItem: {
              status: MenuItemStatus.ACTIVE,
              deletedAt: null,
            },
          },
          orderBy: { displayOrder: 'asc' },
          include: {
            menuItem: {
              include: {
                prices: {
                  where: {
                    deletedAt: null,
                    status: MenuPriceStatus.ACTIVE,
                  },
                  orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
                },
              },
            },
          },
        },
      },
    });

    const mappedCategories = categories
      .map((category) => this.toCategoryReadModel(category))
      .filter((category) => category.items.length > 0);

    return {
      restaurantName: table.restaurant.name,
      tableId: table.id,
      tableName: table.name,
      categories: mappedCategories,
    };
  }

  private toCategoryReadModel(category: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    placements: Array<{
      menuItem: {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        prices: MenuPriceRecord[];
      };
    }>;
  }): PublicMenuCategoryReadModel {
    const items = category.placements
      .map((placement) => this.toItemReadModel(placement.menuItem))
      .filter((item): item is PublicMenuItemReadModel => item !== null);

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      items,
    };
  }

  private toItemReadModel(item: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    prices: MenuPriceRecord[];
  }): PublicMenuItemReadModel | null {
    const basePrice = this.resolveBasePrice(item.prices);
    if (!basePrice) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: {
        amountMinor: basePrice.amountMinor.toString(),
        currencyCode: basePrice.currencyCode,
      },
    };
  }

  private resolveBasePrice(prices: MenuPriceRecord[]): MenuPriceRecord | null {
    return (
      prices.find(
        (price) =>
          price.branchId === null &&
          price.salesChannelId === null &&
          price.status === MenuPriceStatus.ACTIVE,
      ) ?? null
    );
  }
}
