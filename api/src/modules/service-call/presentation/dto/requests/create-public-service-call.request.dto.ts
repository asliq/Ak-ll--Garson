import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ServiceCallType } from '../../../domain/enums/service-call-type.enum';

export class CreatePublicServiceCallRequestDto {
  @ApiProperty({ example: 'qr-masa-1', maxLength: 64 })
  @IsString()
  @MaxLength(64)
  tableToken!: string;

  @ApiProperty({ enum: ServiceCallType, example: ServiceCallType.BILL })
  @IsEnum(ServiceCallType)
  type!: ServiceCallType;

  @ApiPropertyOptional({
    example: 'water',
    description: 'Required for waiter calls: water, bread, sauce, assistance, other',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reason?: string;
}
