import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuItemType } from '@/modules/menu/domain/enums/menu-item-type.enum';
import { OrderStatus } from '../../../domain/enums/order-status.enum';

export class OrderLineResponseDto {
  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440002' })
  id!: string;

  @ApiProperty({ example: 1 })
  lineNumber!: number;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: '25000' })
  unitPriceMinor!: string;

  @ApiProperty({ example: '50000' })
  lineTotalMinor!: string;

  @ApiProperty({ example: 'TRY' })
  currencyCode!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  menuItemId!: string;

  @ApiProperty({ example: 'Izgara Köfte' })
  name!: string;

  @ApiProperty({ example: 'IZGARA-KOFTE-01' })
  sku!: string;

  @ApiProperty({ enum: MenuItemType, example: MenuItemType.SIMPLE })
  itemType!: MenuItemType;
}

export class OrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  tableId!: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.OPEN })
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 1042, nullable: true })
  displayNumber!: number | null;

  @ApiPropertyOptional({ example: 'Az acılı olsun', nullable: true })
  notes!: string | null;

  @ApiProperty({ example: 'TRY' })
  currencyCode!: string;

  @ApiProperty({ example: '50000' })
  subtotalMinor!: string;

  @ApiProperty({ example: '50000' })
  totalMinor!: string;

  @ApiProperty({ type: [OrderLineResponseDto] })
  lines!: OrderLineResponseDto[];

  @ApiProperty({ example: '2026-07-03T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-07-03T10:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 1 })
  version!: number;
}

export class PublicOrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 1042 })
  displayNumber!: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.OPEN })
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 'Az acılı olsun', nullable: true })
  notes!: string | null;

  @ApiProperty({ example: 'TRY' })
  currencyCode!: string;

  @ApiProperty({ example: '50000' })
  totalMinor!: string;

  @ApiProperty({ type: [OrderLineResponseDto] })
  lines!: OrderLineResponseDto[];

  @ApiProperty({ example: '2026-07-03T10:00:00.000Z' })
  createdAt!: Date;
}
