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

    const MAX_REQUEST = 1;
    if (requestCount > MAX_REQUEST) {
      throw new HttpException(
        'Bạn thao tác quá nhanh. Vui lòng đợi chúng tôi 1 phút rồi tiếp tục đặt nhé',
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
