import { Inject, Injectable } from '@nestjs/common';
import { DomainEventPublisher } from '@/core/events/domain-event.publisher';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { NotFoundException } from '@/shared/exceptions/not-found.exception';
import { MenuItemStatus } from '@/modules/menu/domain/enums/menu-item-status.enum';
import { MenuItemRepositoryPort } from '@/modules/menu/application/ports/menu-item.repository.port';
import { MENU_ITEM_REPOSITORY } from '@/modules/menu/application/ports/tokens';
import { MenuItemSnapshot } from '@/modules/menu/domain/value-objects/menu-item-snapshot.vo';
import { OrderFactory } from '../../domain/factories/order.factory';
import { CreateOrderCommand } from '../commands/create-order.command';
import { publishDomainEvents } from '@/modules/menu/application/helpers/publish-domain-events.helper';
import { OrderResult } from '../results/order.result';
import { OrderRepositoryPort } from '../ports/order.repository.port';
import { TableLookupPort } from '../ports/table-lookup.port';
import { ORDER_REPOSITORY, TABLE_LOOKUP } from '../ports/tokens';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(TABLE_LOOKUP)
    private readonly tableLookup: TableLookupPort,
    @Inject(MENU_ITEM_REPOSITORY)
    private readonly menuItemRepository: MenuItemRepositoryPort,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepositoryPort,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderResult> {
    const tableToken = command.tableToken.trim();
    const table = await this.tableLookup.findActiveByToken(tableToken);
    if (!table) {
      throw new NotFoundException('Table', tableToken);
    }

    if (command.lines.length === 0) {
      throw new DomainException('Order must contain at least one line', 'ORDER_LINES_REQUIRED', 400);
    }

    const lineInputs = [];

    for (const line of command.lines) {
      const menuItem = await this.menuItemRepository.findById(table.restaurantId, line.menuItemId);
      if (!menuItem || menuItem.deletedAt) {
        throw new NotFoundException('MenuItem', line.menuItemId);
      }

      if (menuItem.status !== MenuItemStatus.ACTIVE) {
        throw new DomainException(
          'Menu item is not available for ordering',
          'MENU_ITEM_NOT_ORDERABLE',
          400,
          { menuItemId: line.menuItemId, status: menuItem.status },
        );
      }

      const basePrice = menuItem.getBasePrice();
      if (!basePrice) {
        throw new DomainException(
          'Menu item has no active base price',
          'MENU_ITEM_BASE_PRICE_REQUIRED',
          400,
          { menuItemId: line.menuItemId },
        );
      }

      lineInputs.push({
        snapshot: MenuItemSnapshot.capture(menuItem, basePrice),
        quantity: line.quantity,
      });
    }

    const order = OrderFactory.createFromQr({
      restaurantId: table.restaurantId,
      tableId: table.tableId,
      lines: lineInputs,
      notes: command.notes,
    });

    const saved = await this.orderRepository.save(order);
    publishDomainEvents(this.eventPublisher, saved.pullDomainEvents());

    return OrderResult.fromDomain(saved);
  }
}
