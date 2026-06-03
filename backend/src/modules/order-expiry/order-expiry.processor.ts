import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';
import { AvailabilityService } from 'src/availability/availability.service';
import { BOOKING_EVENTS } from 'src/booking/constants/booking-event.constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('order-expiry-queue')
export class OrderExpiryProcessor extends WorkerHost {
  constructor(
    private readonly avaibilityService: AvailabilityService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }
  private readonly logger = new Logger(OrderExpiryProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { cakeId, date, quantity, orderId, receiveDate } = job.data;
    this.logger.log(
      `[Worker] Start processing Job #${job.id} - Name: ${job.name}`,
    );

    this.logger.log(
      `[Worker] Processing expiry for Order #${orderId} - Cake: ${cakeId} - Qty: ${quantity}`,
    );
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        this.logger.warn(
          `[Worker] Không tìm thấy đơn hàng #${orderId} trong hệ thống. Bỏ qua Job.`,
        );
        return { status: 'skipped', orderId };
      }
      
      const finalPaymentMethod = order.paymentMethod;
      if (finalPaymentMethod === 'CASH') {
        this.logger.log(
          `[Worker] Đơn hàng #${orderId} thanh toán bằng TIỀN MẶT. Không áp dụng tự động hủy.`,
        );
        return { status: 'skipped', orderId };
      }
      if (order.status !== 'NEW') {
        this.logger.log(
          `[Worker] Đơn hàng #${orderId} đã được thanh toán hoặc hủy trước đó. Bỏ qua Job.`,
        );
        return { status: 'skipped', orderId };
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
          },
        });
        await this.avaibilityService.releaseHoldSlot(cakeId, date, quantity);
      });

      this.eventEmitter.emit(BOOKING_EVENTS.ORDER_CANCELLED_AUTO, {
        orderId,
        paymentMethod: finalPaymentMethod,
        quantity,
        receiveDate
      });
      this.logger.log(
        `[Worker] Đã tự động hủy đơn #${orderId} và hoàn trả ${quantity} slot bánh.`,
      );
      return { status: 'cancelled', orderId };
    } catch (err: any) {
      this.logger.error(
        `[Worker] Lỗi khi xử lý đơn hết hạn #${orderId}: ${err.message}`,
      );
      throw err;
    }
  }
}
