import { ServiceCallStatus } from '../../domain/enums/service-call-status.enum';
import { ServiceCallType } from '../../domain/enums/service-call-type.enum';

export class ServiceCallResult {
  id!: string;
  restaurantId!: string;
  tableId!: string;
  tableName!: string;
  type!: ServiceCallType;
  reason!: string | null;
  status!: ServiceCallStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
