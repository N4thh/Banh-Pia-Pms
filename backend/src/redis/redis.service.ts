import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constants';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}
  //key, quantity, ttlSecond
  async setHold(key: string, quantity: number, ttlSecond: number = 600) {
    await this.redisClient.set(key, quantity, 'EX', ttlSecond);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }

  async set(key: string, value: string, ttlSecond: number) : Promise<void> { 
    await this.redisClient.set(key,value, 'EX', ttlSecond);
  }
  async incr(key:string) {
    return await this.redisClient.incr(key);
  }

  async blacklistToken(jti: string, ttlSecond: number) { 
    await this.redisClient.set(`blacklist:${jti}`, '1', 'EX' , ttlSecond);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean>{ 
    const result = await this.redisClient.get(`blacklist:${jti}`); 
    return result === '1';
  }

  onModuleDestroy() {
    console.log('Closing Redis connection...'), 
    this.redisClient.disconnect();
  }
  
  
}
