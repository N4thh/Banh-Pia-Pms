import { Module } from '@nestjs/common';
import { CakeController } from './cake.controller';
import { CakesService } from './cake.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtBlacklistGruard } from 'src/auth/guards/jwt-blacklist.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CakeController],
  providers: [CakesService, JwtBlacklistGruard, AdminGuard],
})
export class CakesModule {}
