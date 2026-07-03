import { Module } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { ORDER_REPOSITORY, TABLE_LOOKUP } from './application/ports/tokens';
import { ChangeOrderStatusUseCase } from './application/use-cases/change-order-status.use-case';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';
import { ListOrdersUseCase } from './application/use-cases/list-orders.use-case';
import { PrismaOrderRepository } from './infrastructure/persistence/repositories/prisma-order.repository';
import { PrismaTableLookupRepository } from './infrastructure/persistence/repositories/prisma-table-lookup.repository';
import { OrderController } from './presentation/controllers/order.controller';
import { PublicOrderController } from './presentation/controllers/public-order.controller';

@Module({
  imports: [MenuModule],
  controllers: [OrderController, PublicOrderController],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    {
      provide: TABLE_LOOKUP,
      useClass: PrismaTableLookupRepository,
    },
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderUseCase,
    ChangeOrderStatusUseCase,
  ],
  exports: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderUseCase,
    ChangeOrderStatusUseCase,
    TABLE_LOOKUP,
  ],
})
export class OrderModule {}
