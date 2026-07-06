import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ServiceCallStatus } from '../../../domain/enums/service-call-status.enum';

export class ListServiceCallsQueryDto {
  @ApiPropertyOptional({ enum: ServiceCallStatus })
  @IsOptional()
  @IsEnum(ServiceCallStatus)
  status?: ServiceCallStatus;
}
