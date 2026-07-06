import { ApiResponseDto } from '@/shared/dto/api-response.dto';
import { MenuItemType } from '@/modules/menu/domain/enums/menu-item-type.enum';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { OrderResponseDto, PublicOrderResponseDto } from '../dto/responses/order.response.dto';

export class OrderApiExamples {
  static readonly successEnvelope = {
    success: true,
    statusCode: 200,
    message: 'Success',
    timestamp: '2026-07-03T10:00:00.000Z',
    path: '/api/v1/orders',
  };

  static readonly line = {
    id: '770e8400-e29b-41d4-a716-446655440002',
    lineNumber: 1,
    quantity: 2,
    unitPriceMinor: '25000',
    lineTotalMinor: '50000',
    currencyCode: 'TRY',
    menuItemId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Izgara Köfte',
    sku: 'IZGARA-KOFTE-01',
    itemType: MenuItemType.SIMPLE,
  };

  static readonly order: OrderResponseDto = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    tableId: '660e8400-e29b-41d4-a716-446655440001',
    status: OrderStatus.OPEN,
    displayNumber: 1042,
    notes: null,
    currencyCode: 'TRY',
    subtotalMinor: '50000',
    totalMinor: '50000',
    lines: [OrderApiExamples.line],
    createdAt: new Date('2026-07-03T10:00:00.000Z'),
    updatedAt: new Date('2026-07-03T10:00:00.000Z'),
    version: 1,
  };

  static readonly publicOrder: PublicOrderResponseDto = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    status: OrderStatus.OPEN,
    displayNumber: 1042,
    notes: null,
    currencyCode: 'TRY',
    totalMinor: '50000',
    lines: [OrderApiExamples.line],
    createdAt: new Date('2026-07-03T10:00:00.000Z'),
  };

  static readonly createdResponse: ApiResponseDto<PublicOrderResponseDto> = {
    ...OrderApiExamples.successEnvelope,
    statusCode: 201,
    path: '/api/v1/public/orders',
    data: OrderApiExamples.publicOrder,
  };

  static readonly listResponse: ApiResponseDto<OrderResponseDto[]> = {
    ...OrderApiExamples.successEnvelope,
    data: [OrderApiExamples.order],
  };

  static readonly errorEnvelope = {
    success: false,
    timestamp: '2026-07-03T10:00:00.000Z',
    path: '/api/v1/orders',
  };
}
