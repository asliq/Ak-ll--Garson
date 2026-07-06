import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { ServiceCallModule } from '../service-call/service-call.module';
import { RealtimeGateway } from './gateway/realtime.gateway';
import { OrderRealtimeHandler } from './handlers/order-realtime.handler';
import { ServiceCallRealtimeHandler } from './handlers/service-call-realtime.handler';
import { RealtimeBroadcastService } from './services/realtime-broadcast.service';
import { RealtimeRoomService } from './services/realtime-room.service';

@Module({
  imports: [OrderModule, ServiceCallModule],
  providers: [
    RealtimeGateway,
    RealtimeRoomService,
    RealtimeBroadcastService,
    OrderRealtimeHandler,
    ServiceCallRealtimeHandler,
  ],
})
export class RealtimeModule {}
