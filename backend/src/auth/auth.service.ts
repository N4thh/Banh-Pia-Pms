import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
    constructor(private readonly redisService: RedisService){};

    async logout(user: any) { 
        const {jti, exp} = user;

        const now = Math.floor(Date.now() / 1000); 
        const remainingTime = exp - now; 
        if(remainingTime > 0) { 
            await this.redisService.blacklistToken(jti, remainingTime); 
        }

        return {message: "Đăng xuất thành công"};
    }
}
