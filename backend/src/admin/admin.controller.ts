import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtBlacklistGruard } from 'src/auth/guards/jwt-blacklist.guard';
import { IsAdmin } from 'src/common/decorators/is-admin.decorators';
import { AdminService } from './admin.service';
import { AdminStatsDto } from './dto/admin-stats.dto';
import { GetOrdersBySlotDto } from './dto/admin-orders.dto';
import { AdminStatsOverviewDto } from './dto/admin-stats-overview.dto';

@Controller('admin')
@UseGuards(JwtBlacklistGruard, AdminGuard)
@UsePipes(new ValidationPipe({ transform: true}))
@IsAdmin()
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get("stats")
    async getStats(@Query() dto: AdminStatsDto) { 
        return this.adminService.getStats(dto.range);
    }

    @Get('stats/overview')
    async getStatsOverview(@Query() dto: AdminStatsOverviewDto) {
        return this.adminService.getStatOverview(dto);
    }


    @Get('orders-by-slot')
    @UseGuards(JwtBlacklistGruard, AdminGuard)
    @IsAdmin()
    async getOrdersBySlot(@Query() dto: GetOrdersBySlotDto) {
        return this.adminService.getOrdersBySlot(dto);
    }
}
