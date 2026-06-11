import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redisConfig: any = {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          retryStrategy: (times) => Math.min(times * 50, 2000),
          maxRetriesPerRequest: null,
        };

        if (process.env.REDIS_PASSWORD) {
          redisConfig.password = process.env.REDIS_PASSWORD;
        }

        redisConfig.on('error', (err) => {
          console.error('Redis connection error', err.message);
        });
        redisConfig.on('connect', () => {
          console.log('Redis Client connect successfully');
        });

        return redisConfig;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
