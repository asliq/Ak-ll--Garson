import { CreateOrderCommand, CreateOrderLineCommand } from '../../application/commands/create-order.command';
import { ChangeOrderStatusCommand } from '../../application/commands/change-order-status.command';
import { GetOrderQuery } from '../../application/queries/get-order.query';
import { ListOrdersQuery } from '../../application/queries/list-orders.query';
import { OrderResult } from '../../application/results/order.result';
import { ChangeOrderStatusRequestDto } from '../dto/requests/change-order-status.request.dto';
import { CreatePublicOrderRequestDto } from '../dto/requests/create-public-order.request.dto';
import { ListOrdersQueryDto } from '../dto/requests/list-orders.query.dto';
import { OrderResponseDto, PublicOrderResponseDto } from '../dto/responses/order.response.dto';

export class OrderPresentationMapper {
  static toCreateCommand(dto: CreatePublicOrderRequestDto): CreateOrderCommand {
    return new CreateOrderCommand(
      dto.tableToken,
      dto.lines.map((line) => new CreateOrderLineCommand(line.menuItemId, line.quantity)),
      dto.notes,
    );
  }

  static toListQuery(dto: ListOrdersQueryDto): ListOrdersQuery {
    return new ListOrdersQuery(dto.tableId, dto.status);
  }

  static toGetQuery(orderId: string): GetOrderQuery {
    return new GetOrderQuery(orderId);
  }

  static toChangeStatusCommand(
    orderId: string,
    dto: ChangeOrderStatusRequestDto,
  ): ChangeOrderStatusCommand {
    return new ChangeOrderStatusCommand(orderId, dto.status);
  }

  static toResponse(result: OrderResult): OrderResponseDto {
    return {
      id: result.id,
      tableId: result.tableId,
      status: result.status,
      displayNumber: result.displayNumber,
      notes: result.notes,
      currencyCode: result.currencyCode,
      subtotalMinor: result.subtotalMinor,
      totalMinor: result.totalMinor,
      lines: result.lines.map((line) => ({
        id: line.id,
        lineNumber: line.lineNumber,
        quantity: line.quantity,
        unitPriceMinor: line.unitPriceMinor,
        lineTotalMinor: line.lineTotalMinor,
        currencyCode: line.currencyCode,
        menuItemId: line.menuItemId,
        name: line.name,
        sku: line.sku,
        itemType: line.itemType,
      })),
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      version: result.version,
    };
  }

  static toPublicResponse(result: OrderResult): PublicOrderResponseDto {
    return {
      id: result.id,
      displayNumber: result.displayNumber ?? 0,
      status: result.status,
      currencyCode: result.currencyCode,
      totalMinor: result.totalMinor,
      notes: result.notes,
      lines: result.lines.map((line) => ({
        id: line.id,
        lineNumber: line.lineNumber,
        quantity: line.quantity,
        unitPriceMinor: line.unitPriceMinor,
        lineTotalMinor: line.lineTotalMinor,
        currencyCode: line.currencyCode,
        menuItemId: line.menuItemId,
        name: line.name,
        sku: line.sku,
        itemType: line.itemType,
      })),
      createdAt: result.createdAt,
    };
  }

  static toResponseList(results: OrderResult[]): OrderResponseDto[] {
    return results.map((result) => OrderPresentationMapper.toResponse(result));
  }
}
