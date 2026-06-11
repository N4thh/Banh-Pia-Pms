// apps/backend/src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Import thằng này
import { BullModule } from '@nestjs/bullmq';
import { NotificationListener } from './notification.listener';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: 'order-expiry-queue' }),
    BullModule.registerQueue({ name: 'notification_queue' }),
  ],
  providers: [NotificationListener, NotificationProcessor],
  exports: [BullModule],
})
export class NotificationModule {}
