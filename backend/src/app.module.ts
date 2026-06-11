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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderOrderExpiryModule } from './modules/order-expiry/order-expiry.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    CakesModule,
    PrismaModule,
    AvailabilityModule,
    RedisModule,
    AuthModule,
    CustomerModule,
    BookingModule,
    EventEmitterModule.forRoot(),
    NotificationModule,
    OrderOrderExpiryModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || process.env.REDISHOST || 'localhost',
        port: Number(process.env.REDIS_PORT ?? process.env.REDISPORT) || 6379,
      },
    }),
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
