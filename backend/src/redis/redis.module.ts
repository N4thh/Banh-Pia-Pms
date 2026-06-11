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
        const redis = new Redis({
          host: process.env.REDISHOST || process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDISPORT || process.env.REDIS_PORT) || 6379,
          password: process.env.REDISPASSWORD || undefined,
          retryStrategy: (times) => Math.min(times * 50, 2000),
          maxRetriesPerRequest: null,
        });

        redis.on('error', (err) => {console.error('Redis connection error', err.message)}); 
        redis.on('connect', () => {console.log('Redis Client connect successfully')}); 

        return redis;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
