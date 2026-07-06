import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { ServiceCallService } from './application/service-call.service';
import { PublicServiceCallController } from './presentation/controllers/public-service-call.controller';
import { ServiceCallController } from './presentation/controllers/service-call.controller';

@Module({
  imports: [OrderModule],
  controllers: [ServiceCallController, PublicServiceCallController],
  providers: [ServiceCallService],
  exports: [ServiceCallService],
})
export class ServiceCallModule {}
