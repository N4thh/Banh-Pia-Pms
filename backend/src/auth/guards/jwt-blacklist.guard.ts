import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class JwtBlacklistGruard extends AuthGuard('jwt') {
    constructor(private readonly redisService: RedisService) { 
        super(); 
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isValid = (await super.canActivate(context)) as boolean; 
        if(!isValid) return false; 

        const request = context.switchToHttp().getRequest(); 
        const user = request.user; //sub,  username, jti, role 
        
        const isBlacklisted = await this.redisService.isTokenBlacklisted(user.jti); 
        if(isBlacklisted) { 
            throw new UnauthorizedException("Token bị vô hiệu hóa");
        }
        return true;
    }
}