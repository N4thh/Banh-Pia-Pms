import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityModule } from 'src/availability/availability.module';
import { RedisModule } from 'src/redis/redis.module';
import { CustomerModule } from 'src/customer/customer.module';
import { OrderThrottlerGuard } from 'src/common/guards/order-throttler.guard';
import { IdempotencyGuard } from 'src/common/guards/idempotency.guard';

@Module({
  imports: [PrismaModule, AvailabilityModule, RedisModule, CustomerModule],
  controllers: [BookingController],
  providers: [BookingService, OrderThrottlerGuard, IdempotencyGuard],
})
export class BookingModule {}
