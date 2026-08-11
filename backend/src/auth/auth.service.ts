import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { AdminDto } from './dto/admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginAdmin(dto: AdminDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });
    if (!admin) throw new UnauthorizedException('Sai tài khoảng hoặc mật khẩu');

    const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isMatch)
      throw new UnauthorizedException('Sai tài khoảng hoặc mật khẩu');

    const accessTokenJti = uuidv4();
    const refreshTokenJti = uuidv4();

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: admin.id, jti: accessTokenJti, role: 'ADMIN' },
        { expiresIn: '15m', secret: process.env.JWT_AT_SECRET },
      ),
      this.jwtService.signAsync(
        { sub: admin.id, jti: refreshTokenJti, role: 'ADMIN' },
        { expiresIn: '7d', secret: process.env.JWT_RT_SECRET },
      ),
    ]);

    return {accessToken: at, refreshToken: rt}; 
  }

  async logout(user: any) {
    const { jti, exp } = user;

    const now = Math.floor(Date.now() / 1000);
    const remainingTime = exp - now;
    if (remainingTime > 0) {
      await this.redisService.blacklistToken(jti, remainingTime);
    }

    return { message: 'Đăng xuất thành công' };
  }

  async refreshToken(rt: string) { 
    const payload = await this.jwtService.verifyAsync(rt, {
      secret: process.env.JWT_RT_SECRET,
    }); 
    
    //check token is in black list or not
    if(await this.redisService.isTokenBlacklisted(payload.jti)) {
      throw new UnauthorizedException("RT đã bị vô hiệu hóa");
    }

    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    if(remaining > 0) { 
      await this.redisService.blacklistToken(payload.jti, remaining);
    }

    const newAtJti = uuidv4();
    const newRtJti = uuidv4();
    const [newAt, newRt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: payload.sub, jti: newAtJti, role: payload.role },
        { expiresIn: '15m', secret: process.env.JWT_AT_SECRET}
      ),

      this.jwtService.signAsync(
        { sub: payload.sub, jti: newRtJti, role: payload.role},
        { expiresIn: '7d', secret: process.env.JWT_RT_SECRET}
      ),
    ]);

    return { accessToken: newAt, refreshToken: newRt};
  }
}
