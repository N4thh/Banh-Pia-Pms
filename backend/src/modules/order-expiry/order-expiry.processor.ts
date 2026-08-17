import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AvailabilityService } from 'src/availability/availability.service';
import {
  BOOKING_EVENTS,
  OrderCancelledAutoEventPayload,
} from 'src/booking/constants/booking-event.constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('order-expiry-queue')
export class OrderExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderExpiryProcessor.name);

  constructor(
    private readonly avaibilityService: AvailabilityService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { cakeId, date, quantity, orderId, receiveDate } = job.data;

    this.logger.log(
      `[Worker] Start processing Job #${job.id} for Order #${orderId}`,
    );

    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        this.logger.warn(
          `[Worker] Không tìm thấy đơn hàng #${orderId}. Bỏ qua Job.`,
        );
        return { status: 'skipped', orderId };
      }

      const finalPaymentMethod = order.paymentMethod;
      if (finalPaymentMethod === 'CASH') {
        this.logger.log(
          `[Worker] Đơn #${orderId} trả TIỀN MẶT. Không áp dụng tự động hủy.`,
        );
        return { status: 'skipped', orderId };
      }

      if (order.status === 'NEW') {
        await this.prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
          });
        });

        try {
          await this.avaibilityService.releaseHoldSlot(cakeId, date, quantity);
        } catch (slotError: any) {
          this.logger.error(
            `[Critical] Đơn #${orderId} đã hủy DB nhưng lỗi nhả slot bánh: ${slotError.message}`,
          );
        }

        const cancelEvent: OrderCancelledAutoEventPayload = {
          orderId,
          paymentMethod: finalPaymentMethod,
          quantity,
          receiveDate,
        };

        this.eventEmitter.emit(
          BOOKING_EVENTS.ORDER_CANCELLED_AUTO,
          cancelEvent,
        );

        this.logger.log(
          `[Worker] Tu dong huy don #${orderId} thanh cong, da phat event thong bao.`,
        );
        return { status: 'cancelled', orderId };
      }

      if (order.status === 'CANCELLED') {
        try {
          await this.avaibilityService.releaseHoldSlot(cakeId, date, quantity);
          this.logger.log(
            `[Worker] Đơn #${orderId} đã ở trạng thái CANCELLED, đã trả lại slot cho cake #${cakeId}.`,
          );
        } catch (slotError: any) {
          this.logger.error(
            `[Critical] Đơn #${orderId} đã hủy trước đó nhưng lỗi nhả slot bánh: ${slotError.message}`,
          );
        }
        return { status: 'already_cancelled', orderId };
      }

      this.logger.log(
        `[Worker] Đơn #${orderId} trạng thái là ${order.status} (không phải NEW/CANCELLED). Bỏ qua Job.`,
      );
      return { status: 'skipped', orderId };
    } catch (err: any) {
      this.logger.error(
        `[Worker Error] Loi khi xu ly don het han #${orderId}: ${err.message}`,
      );
      throw err;
    }
  }
}
