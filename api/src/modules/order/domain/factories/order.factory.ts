import { randomUUID } from 'crypto';
import { MenuItemSnapshot } from '@/modules/menu/domain/value-objects/menu-item-snapshot.vo';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderOpenedEvent } from '../events/order-opened.event';
import { OrderInvariants } from '../invariants/order.invariants';
import { OrderLine } from '../entities/order-line.entity';
import { Order } from '../entities/order.entity';

export interface CreateOrderLineInput {
  snapshot: MenuItemSnapshot;
  quantity: number;
}

export interface CreateOrderInput {
  restaurantId: string;
  tableId: string;
  lines: CreateOrderLineInput[];
  notes?: string | null;
}

export class OrderFactory {
  static createFromQr(input: CreateOrderInput): Order {
    if (input.lines.length === 0) {
      OrderInvariants.assertHasLines([]);
    }

    const now = new Date();
    const orderId = randomUUID();
    const currencyCode = input.lines[0]!.snapshot.unitPrice.currencyCode;

    const lines = input.lines.map((lineInput, index) => {
      OrderInvariants.assertValidQuantity(lineInput.quantity);

      const snapshot = lineInput.snapshot;
      const unitPriceMinor = snapshot.unitPrice.amountMinor;
      const lineTotalMinor = unitPriceMinor * BigInt(lineInput.quantity);

      return OrderLine.reconstitute({
        id: randomUUID(),
        lineNumber: index + 1,
        quantity: lineInput.quantity,
        unitPriceMinor,
        lineTotalMinor,
        currencyCode: snapshot.unitPrice.currencyCode,
        menuItemId: snapshot.menuItemId,
        sku: snapshot.sku,
        name: snapshot.name,
        slug: snapshot.slug,
        itemType: snapshot.itemType,
        taxCategoryId: snapshot.taxCategoryId,
        kitchenStationId: snapshot.kitchenStationId,
        snapshotCapturedAt: snapshot.capturedAt,
        createdAt: now,
      });
    });

    const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0n);
    const totalMinor = subtotalMinor;

    const notes = input.notes?.trim() ? input.notes.trim() : null;

    const order = Order.reconstitute({
      id: orderId,
      restaurantId: input.restaurantId,
      tableId: input.tableId,
      status: OrderStatus.OPEN,
      displayNumber: null,
      notes,
      currencyCode,
      subtotalMinor,
      totalMinor,
      lines,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    });

    order.record(
      new OrderCreatedEvent({
        orderId: order.id,
        restaurantId: order.restaurantId,
        tableId: order.tableId,
        status: order.status,
        lineCount: order.lines.length,
        totalMinor: order.totalMinor.toString(),
        currencyCode: order.currencyCode,
      }),
    );

    order.record(
      new OrderOpenedEvent({
        orderId: order.id,
        restaurantId: order.restaurantId,
        tableId: order.tableId,
        lineCount: order.lines.length,
        totalMinor: order.totalMinor.toString(),
        currencyCode: order.currencyCode,
      }),
    );

    return order;
  }
}
