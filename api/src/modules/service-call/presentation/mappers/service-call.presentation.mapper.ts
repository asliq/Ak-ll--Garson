import { ServiceCallResult } from '../../application/results/service-call.result';
import { ServiceCallResponseDto } from '../dto/responses/service-call.response.dto';

export class ServiceCallPresentationMapper {
  static toResponse(result: ServiceCallResult): ServiceCallResponseDto {
    return {
      id: result.id,
      tableId: result.tableId,
      tableName: result.tableName,
      type: result.type,
      reason: result.reason,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  static toResponseList(results: ServiceCallResult[]): ServiceCallResponseDto[] {
    return results.map((result) => ServiceCallPresentationMapper.toResponse(result));
  }
}
