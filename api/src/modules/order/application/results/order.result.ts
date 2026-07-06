import { MenuItemType } from '@/modules/menu/domain/enums/menu-item-type.enum';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';

export class OrderLineResult {
  id!: string;
  lineNumber!: number;
  quantity!: number;
  unitPriceMinor!: string;
  lineTotalMinor!: string;
  currencyCode!: string;
  menuItemId!: string;
  name!: string;
  sku!: string;
  itemType!: MenuItemType;
}

export class OrderResult {
  id!: string;
  restaurantId!: string;
  tableId!: string;
  status!: OrderStatus;
  displayNumber!: number | null;
  notes!: string | null;
  currencyCode!: string;
  subtotalMinor!: string;
  totalMinor!: string;
  lines!: OrderLineResult[];
  createdAt!: Date;
  updatedAt!: Date;
  version!: number;

  static fromDomain(order: Order): OrderResult {
    return {
      id: order.id,
      restaurantId: order.restaurantId,
      tableId: order.tableId,
      status: order.status,
      displayNumber: order.displayNumber,
      notes: order.notes,
      currencyCode: order.currencyCode,
      subtotalMinor: order.subtotalMinor.toString(),
      totalMinor: order.totalMinor.toString(),
      lines: order.lines.map((line) => ({
        id: line.id,
        lineNumber: line.lineNumber,
        quantity: line.quantity,
        unitPriceMinor: line.unitPriceMinor.toString(),
        lineTotalMinor: line.lineTotalMinor.toString(),
        currencyCode: line.currencyCode,
        menuItemId: line.menuItemId,
        name: line.name,
        sku: line.sku,
        itemType: line.itemType,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      version: order.version,
    };
  }
}
