import {
  Order as PrismaOrder,
  OrderLine as PrismaOrderLine,
  Prisma,
} from '@prisma/client';
import { OrderLine } from '../../../domain/entities/order-line.entity';
import { Order } from '../../../domain/entities/order.entity';
import { MenuEnumMapper } from '@/modules/menu/infrastructure/persistence/mappers/menu-enum.mapper';
import { OrderEnumMapper } from './order-enum.mapper';

type PrismaOrderWithLines = PrismaOrder & {
  lines: PrismaOrderLine[];
};

export class OrderMapper {
  static toDomain(record: PrismaOrderWithLines): Order {
    return Order.reconstitute({
      id: record.id,
      restaurantId: record.restaurantId,
      tableId: record.tableId,
      status: OrderEnumMapper.toDomain(record.status),
      displayNumber: record.displayNumber,
      notes: record.notes,
      currencyCode: record.currencyCode,
      subtotalMinor: record.subtotalMinor,
      totalMinor: record.totalMinor,
      lines: record.lines
        .sort((a, b) => a.lineNumber - b.lineNumber)
        .map((line) => OrderMapper.toLineDomain(line)),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      version: record.version,
    });
  }

  static toLineDomain(record: PrismaOrderLine): OrderLine {
    return OrderLine.reconstitute({
      id: record.id,
      lineNumber: record.lineNumber,
      quantity: record.quantity,
      unitPriceMinor: record.unitPriceMinor,
      lineTotalMinor: record.lineTotalMinor,
      currencyCode: record.currencyCode,
      menuItemId: record.menuItemId,
      sku: record.sku,
      name: record.name,
      slug: record.slug,
      itemType: MenuEnumMapper.toDomainItemType(record.itemType),
      taxCategoryId: record.taxCategoryId,
      kitchenStationId: record.kitchenStationId,
      snapshotCapturedAt: record.snapshotCapturedAt,
      createdAt: record.createdAt,
    });
  }

  static toCreateInput(order: Order, displayNumber: number): Prisma.OrderCreateInput {
    const props = order.toProps();

    return {
      id: props.id,
      restaurant: { connect: { id: props.restaurantId } },
      table: { connect: { id: props.tableId } },
      status: OrderEnumMapper.toPersistence(props.status),
      displayNumber,
      notes: props.notes,
      currencyCode: props.currencyCode,
      subtotalMinor: props.subtotalMinor,
      totalMinor: props.totalMinor,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
      version: props.version,
      lines: {
        create: props.lines.map((line) => OrderMapper.toLineCreateInput(props.restaurantId, line)),
      },
    };
  }

  static toUpdateManyMutationInput(order: Order): Prisma.OrderUpdateManyMutationInput {
    const props = order.toProps();

    return {
      status: OrderEnumMapper.toPersistence(props.status),
      subtotalMinor: props.subtotalMinor,
      totalMinor: props.totalMinor,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
      version: props.version,
    };
  }

  private static toLineCreateInput(
    restaurantId: string,
    line: OrderLine,
  ): Prisma.OrderLineCreateWithoutOrderInput {
    const props = line.toProps();

    return {
      id: props.id,
      restaurantId,
      lineNumber: props.lineNumber,
      quantity: props.quantity,
      unitPriceMinor: props.unitPriceMinor,
      lineTotalMinor: props.lineTotalMinor,
      currencyCode: props.currencyCode,
      menuItemId: props.menuItemId,
      sku: props.sku,
      name: props.name,
      slug: props.slug,
      itemType: MenuEnumMapper.toPersistenceItemType(props.itemType),
      taxCategoryId: props.taxCategoryId,
      kitchenStationId: props.kitchenStationId,
      snapshotCapturedAt: props.snapshotCapturedAt,
      createdAt: props.createdAt,
    };
  }
}
