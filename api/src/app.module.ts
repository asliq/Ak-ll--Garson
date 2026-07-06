import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './modules/health/health.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { PublicModule } from './modules/public/public.module';
import { ServiceCallModule } from './modules/service-call/service-call.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [CoreModule, SharedModule, HealthModule, MenuModule, PublicModule, OrderModule, ServiceCallModule, RealtimeModule],
})
export class AppModule {}
