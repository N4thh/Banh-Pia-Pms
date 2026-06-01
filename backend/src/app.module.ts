import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CakesModule } from './cakes/cakes.module';
import { PrismaModule } from './prisma/prisma.module';
import { AvailabilityModule } from './availability/availability.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [CakesModule, PrismaModule, AvailabilityModule, RedisModule, AuthModule, CustomerModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
