import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ServiceCallStatus } from '../../../domain/enums/service-call-status.enum';

export class UpdateServiceCallStatusRequestDto {
  @ApiProperty({ enum: ServiceCallStatus, example: ServiceCallStatus.ACCEPTED })
  @IsEnum(ServiceCallStatus)
  status!: ServiceCallStatus;
}
