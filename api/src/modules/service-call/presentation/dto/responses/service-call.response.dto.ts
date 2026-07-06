import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCallStatus } from '../../../domain/enums/service-call-status.enum';
import { ServiceCallType } from '../../../domain/enums/service-call-type.enum';

export class ServiceCallResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tableId!: string;

  @ApiProperty({ example: 'Masa 1' })
  tableName!: string;

  @ApiProperty({ enum: ServiceCallType })
  type!: ServiceCallType;

  @ApiPropertyOptional({ example: 'water', nullable: true })
  reason!: string | null;

  @ApiProperty({ enum: ServiceCallStatus })
  status!: ServiceCallStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
