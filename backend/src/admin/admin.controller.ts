import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtBlacklistGruard } from 'src/auth/guards/jwt-blacklist.guard';
import { IsAdmin } from 'src/common/decorators/is-admin.decorators';
import { AdminService } from './admin.service';
import { AdminStatsDto } from './dto/admin-stats.dto';

@Controller('admin')
@UseGuards(JwtBlacklistGruard, AdminGuard)
@IsAdmin()
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get("stats")
    async getStats(@Query() dto: AdminStatsDto) { 
        return this.adminService.getStats(dto.range);
    }
}
