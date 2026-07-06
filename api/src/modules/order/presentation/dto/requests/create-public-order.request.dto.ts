import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';

export class CreatePublicOrderLineRequestDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreatePublicOrderRequestDto {
  @ApiProperty({ example: 'qr-abc123', maxLength: 64 })
  @IsString()
  @MaxLength(64)
  tableToken!: string;

  @ApiProperty({ type: [CreatePublicOrderLineRequestDto] })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePublicOrderLineRequestDto)
  lines!: CreatePublicOrderLineRequestDto[];

  @ApiPropertyOptional({ example: 'Az acılı olsun', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
