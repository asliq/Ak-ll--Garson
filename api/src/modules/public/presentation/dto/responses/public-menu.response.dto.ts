import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicMenuItemPriceResponseDto {
  @ApiProperty({ example: '25000', description: 'Price in minor units (e.g. kuruş for TRY)' })
  amountMinor!: string;

  @ApiProperty({ example: 'TRY' })
  currencyCode!: string;
}

export class PublicMenuItemResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Izgara Köfte' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Dana kıyma ile hazırlanan ızgara köfte',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/items/kofte.jpg',
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({ type: PublicMenuItemPriceResponseDto })
  price!: PublicMenuItemPriceResponseDto;
}

export class PublicMenuCategoryResponseDto {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ example: 'Ana Yemekler' })
  name!: string;

  @ApiPropertyOptional({ example: 'Restoranın ana yemek kategorisi', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 'utensils', nullable: true })
  icon!: string | null;

  @ApiProperty({ type: [PublicMenuItemResponseDto] })
  items!: PublicMenuItemResponseDto[];
}

export class PublicMenuResponseDto {
  @ApiProperty({ example: 'Lezzet Durağı' })
  restaurantName!: string;

  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440010' })
  tableId!: string;

  @ApiProperty({ example: 'Masa 5' })
  tableName!: string;

  @ApiProperty({ type: [PublicMenuCategoryResponseDto] })
  categories!: PublicMenuCategoryResponseDto[];
}
