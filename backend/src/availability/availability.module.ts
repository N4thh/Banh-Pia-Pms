import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtBlacklistGruard } from 'src/auth/guards/jwt-blacklist.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  providers: [AvailabilityService, JwtBlacklistGruard, AdminGuard],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
