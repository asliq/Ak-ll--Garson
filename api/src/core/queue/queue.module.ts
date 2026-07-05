import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CONFIG_KEY } from '../config/redis.config';
import { QUEUE_DEFAULT } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = config.get<{ host: string; port: number; password?: string }>(
          REDIS_CONFIG_KEY,
        );
        return {
          connection: {
            host: redis?.host ?? 'localhost',
            port: redis?.port ?? 6379,
            password: redis?.password,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: QUEUE_DEFAULT }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
