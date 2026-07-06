import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import {
  ListOrdersOptions,
  OrderRepositoryPort,
} from '../../../application/ports/order.repository.port';
import { Order } from '../../../domain/entities/order.entity';
import { activeTenantWhere } from '@/modules/menu/infrastructure/persistence/filters/persistence.filters';
import { assertOptimisticLock } from '@/modules/menu/infrastructure/persistence/helpers/optimistic-lock.helper';
import { OrderEnumMapper } from '../mappers/order-enum.mapper';
import { OrderMapper } from '../mappers/order.mapper';

const ORDER_INCLUDE = {
  lines: {
    orderBy: { lineNumber: 'asc' as const },
  },
};

@Injectable()
export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(restaurantId: string, id: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      where: {
        ...activeTenantWhere(restaurantId),
        id,
      },
      include: ORDER_INCLUDE,
    });

    return record ? OrderMapper.toDomain(record) : null;
  }

  async findMany(restaurantId: string, options?: ListOrdersOptions): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: {
        ...activeTenantWhere(restaurantId),
        ...(options?.tableId ? { tableId: options.tableId } : {}),
        ...(options?.status
          ? { status: OrderEnumMapper.toPersistence(options.status) }
          : {}),
      },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => OrderMapper.toDomain(record));
  }

  async save(order: Order): Promise<Order> {
    const existing = await this.prisma.order.findFirst({
      where: {
        restaurantId: order.restaurantId,
        id: order.id,
      },
      select: { id: true },
    });

    if (!existing) {
      const displayNumber = await this.allocateDisplayNumber(order.restaurantId);

      await this.prisma.order.create({
        data: OrderMapper.toCreateInput(order, displayNumber),
      });

      const saved = await this.findById(order.restaurantId, order.id);
      return saved ?? order;
    }

    const result = await this.prisma.order.updateMany({
      where: {
        id: order.id,
        restaurantId: order.restaurantId,
        version: order.version - 1,
      },
      data: OrderMapper.toUpdateManyMutationInput(order),
    });

    assertOptimisticLock(result.count, {
      entityType: 'Order',
      id: order.id,
      expectedVersion: order.version - 1,
    });

    const saved = await this.findById(order.restaurantId, order.id);
    return saved ?? order;
  }

  private async allocateDisplayNumber(restaurantId: string): Promise<number> {
    const aggregate = await this.prisma.order.aggregate({
      where: { restaurantId, deletedAt: null },
      _max: { displayNumber: true },
    });

    const currentMax = aggregate._max.displayNumber;
    return (currentMax ?? 1000) + 1;
  }
}
