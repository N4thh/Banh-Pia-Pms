import { BadRequestException, CanActivate, ConflictException, ExecutionContext, Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); 
    const idempotencyKey = request.headers['x-idempotency-key'];    
    if(!idempotencyKey)
        throw new BadRequestException("Thiếu mã định danh giao dịch (Idempotency Key)!");
    
    const redisKey = `idempotency: ${idempotencyKey}`; 
    const status = await this.redisService.get(redisKey); 

    if(status === 'PENDING') { 
        throw new ConflictException("Đơn hàng của bạn đang được xử lý. Vui lòng đợi chúng tôi trong giây lát"); 
    }

    if(status && status.startsWith('SUCCESS')) { 
        const orderData = status.split(':')[1]; 
        throw new ConflictException(`Đơn hàng của bạn đã được đặt thành công! Mã đơn: ${orderData}`);
    }

    await this.redisService.set(redisKey, 'PENDING', 600); 

    request.idempotencyKey = redisKey; 
    return true;
  }
}
