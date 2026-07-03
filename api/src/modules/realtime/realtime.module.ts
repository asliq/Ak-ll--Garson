import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { RealtimeGateway } from './gateway/realtime.gateway';
import { OrderRealtimeHandler } from './handlers/order-realtime.handler';
import { RealtimeBroadcastService } from './services/realtime-broadcast.service';
import { RealtimeRoomService } from './services/realtime-room.service';

@Module({
  imports: [OrderModule],
  providers: [
    RealtimeGateway,
    RealtimeRoomService,
    RealtimeBroadcastService,
    OrderRealtimeHandler,
  ],
})
export class RealtimeModule {}
