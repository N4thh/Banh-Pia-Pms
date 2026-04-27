import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CakesModule } from './cakes/cakes.module';
import { PrismaModule } from './prisma/prisma.module';
import { AvailabilityModule } from './availability/availability.module';

@Module({
  imports: [CakesModule, PrismaModule, AvailabilityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
