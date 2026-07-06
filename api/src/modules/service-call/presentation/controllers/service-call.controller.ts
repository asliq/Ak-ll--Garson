import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { requireRestaurantId } from '@/modules/menu/application/helpers/require-restaurant-id.helper';
import { ServiceCallService } from '../../application/service-call.service';
import { ListServiceCallsQueryDto } from '../dto/requests/list-service-calls.query.dto';
import { UpdateServiceCallStatusRequestDto } from '../dto/requests/update-service-call-status.request.dto';
import { ServiceCallResponseDto } from '../dto/responses/service-call.response.dto';
import { ServiceCallPresentationMapper } from '../mappers/service-call.presentation.mapper';

@ApiTags('Service Calls')
@ApiSecurity('restaurant-id')
@Controller('service-calls')
export class ServiceCallController {
  constructor(private readonly serviceCallService: ServiceCallService) {}

  @Get()
  @ApiOperation({ summary: 'List service calls for the current restaurant' })
  @ApiOkResponse({ type: [ServiceCallResponseDto] })
  async list(
    @Query() query: ListServiceCallsQueryDto,
  ): Promise<ServiceCallResponseDto[]> {
    const restaurantId = requireRestaurantId();
    const results = await this.serviceCallService.list(restaurantId, query.status);
    return ServiceCallPresentationMapper.toResponseList(results);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service call status' })
  @ApiOkResponse({ type: ServiceCallResponseDto })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateServiceCallStatusRequestDto,
  ): Promise<ServiceCallResponseDto> {
    const restaurantId = requireRestaurantId();
    const result = await this.serviceCallService.updateStatus(
      restaurantId,
      id,
      body.status,
    );

    return ServiceCallPresentationMapper.toResponse(result);
  }
}
