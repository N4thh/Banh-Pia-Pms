import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AvailabilityModule } from 'src/availability/availability.module';
import { OrderExpiryProcessor } from './order-expiry.processor';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'order-expiry-queue',
    }),
    AvailabilityModule,
    PrismaModule,
  ],
  providers: [OrderExpiryProcessor],
  exports: [BullModule],
})
export class OrderOrderExpiryModule {}
