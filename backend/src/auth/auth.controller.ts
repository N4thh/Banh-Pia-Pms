import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminDto } from './dto/admin.dto';
import { JwtBlacklistGruard } from './guards/jwt-blacklist.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(@Body() dto: AdminDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('logout')
  @UseGuards(JwtBlacklistGruard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) { 
    const user = req.user as any 
    
    await this.authService.logout(user);

    return {message: 'Đăng xuất thành công'}
  }
  
}
