import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class OrderThrottlerGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const redisKey = `rate-limit:order${ip}`;

    const currentRequest = await this.redisService.get(redisKey);
    const requestCount = currentRequest ? parseInt(currentRequest, 10) : 0;

    const MAX_REQUEST = 3;
    if (requestCount > MAX_REQUEST) {
      throw new HttpException(
        'Cô Chú thao tác nhanh quá ạ, đợi tụi con 1 phút rồi đặt tiếp nha cô chú',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (requestCount === 0) {
      await this.redisService.set(redisKey, '1', 60);
    } else {
        await this.redisService.incr(redisKey); 
    }
    
    return true;
  }
}
