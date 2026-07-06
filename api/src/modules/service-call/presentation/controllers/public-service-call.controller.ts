import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceCallService } from '../../application/service-call.service';
import { CreatePublicServiceCallRequestDto } from '../dto/requests/create-public-service-call.request.dto';
import { ServiceCallResponseDto } from '../dto/responses/service-call.response.dto';
import { ServiceCallPresentationMapper } from '../mappers/service-call.presentation.mapper';

@ApiTags('Public Service Calls')
@Controller('public/service-calls')
export class PublicServiceCallController {
  constructor(private readonly serviceCallService: ServiceCallService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a service call from QR table token' })
  @ApiCreatedResponse({ type: ServiceCallResponseDto })
  async create(@Body() body: CreatePublicServiceCallRequestDto): Promise<ServiceCallResponseDto> {
    const result = await this.serviceCallService.createPublic({
      tableToken: body.tableToken,
      type: body.type,
      reason: body.reason,
    });

    return ServiceCallPresentationMapper.toResponse(result);
  }
}
