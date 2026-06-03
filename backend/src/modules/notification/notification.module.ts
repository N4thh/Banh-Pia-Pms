// apps/backend/src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Import thằng này
import { BullModule } from '@nestjs/bullmq';
import { NotificationListener } from './notification.listener';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: 'order-expiry-queue' }),
  ],
  providers: [NotificationListener],
})
export class NotificationModule {}
