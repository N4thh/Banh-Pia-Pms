import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class JwtBlacklistGruard extends AuthGuard('jwt') {
    constructor(private readonly redisService: RedisService) { 
        super(); 
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isActive = (await super.canActivate(context))as boolean
        if(!isActive) return false; 

        const request = context.switchToHttp().getRequest();
        const user = request.user; 

        const isBlacklist = await this.redisService.isTokenBlacklisted(user.jti); 
        if(isBlacklist) { 
            throw new UnauthorizedException("Token is no longer valid"); 
        }
        return true;
    }
}