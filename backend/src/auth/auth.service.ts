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
}
