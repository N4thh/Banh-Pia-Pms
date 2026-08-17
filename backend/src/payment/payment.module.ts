import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentCronService } from './payment-cron.service';
import { AvailabilityModule } from 'src/availability/availability.module';

@Module({
  controllers: [PaymentController],
  imports: [HttpModule, ScheduleModule.forRoot(), PrismaModule, AvailabilityModule],
  providers: [PaymentService, PaymentCronService],
  exports: [PaymentService, PaymentCronService], 
})
export class PaymentModule {}
