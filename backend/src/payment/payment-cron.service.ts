import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus, PaymentLinkStatus, CancelReason } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvailabilityService } from 'src/availability/availability.service';
import {
  BUSINESS_TIME_ZONE,
  getBusinessDateOnly,
  toPrismaDate,
} from 'src/common/utils/date-only.util';

@Injectable()
export class PaymentCronService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PaymentCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.promoteDueCashOrders();
    } catch (error: any) {
      this.logger.error(
        `Không thể đối soát đơn CASH khi khởi động: ${error.message}`,
        error.stack,
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredOrders() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.NEW,
        paymentMethod: 'BANK_TRANSFER',
        orderDate: { lt: tenMinutesAgo },
      },
      include: { paymentLink: true, items: true },
    });

    if (expiredOrders.length === 0) return;

    await this.prisma.$transaction(
      expiredOrders.map((order) =>
        this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            cancelReason: CancelReason.PAYMENT_EXPIRED,
            cancelledAt: new Date(),
            paymentLink: order.paymentLink
              ? {
                  update: {
                    status: PaymentLinkStatus.CANCELLED,
                    canceledAt: new Date(),
                    cancellationReason: 'EXPIRED',
                  },
                }
              : undefined,
          },
        }),
      ),
    );

    // Trả slot cho từng đơn sau khi đã update order
    for (const order of expiredOrders) {
      for (const item of order.items) {
        try {
          await this.availabilityService.releaseHoldSlot(
            item.cakeId,
            String(order.receiveDate),
            item.quantity,
          );
        } catch (err: any) {
          this.logger.error(
            `[Critical] Đơn #${order.id} đã hủy DB nhưng lỗi nhả slot bánh: ${err.message}`,
          );
        }
      }
    }

    this.logger.log(`Đã hủy ${expiredOrders.length} đơn hết hạn`);
  }

  /**
   * Idempotently promote due and overdue CASH orders after scheduler or service downtime.
   */
  async promoteDueCashOrders() {
    const today = toPrismaDate(getBusinessDateOnly());
    const result = await this.prisma.order.updateMany({
      where: {
        status: OrderStatus.NEW,
        paymentMethod: 'CASH',
        receiveDate: { lte: today },
      },
      data: { status: OrderStatus.PROCESSING },
    });

    if (result.count > 0) {
      this.logger.log(`Đã chuyển ${result.count} đơn CASH sang PROCESSING`);
    }

    return result.count;
  }

  @Cron('5 0 * * *', { timeZone: BUSINESS_TIME_ZONE })
  async handleDailyCashProcessingOrders() {
    await this.promoteDueCashOrders();
  }

  @Cron(CronExpression.EVERY_HOUR, { timeZone: BUSINESS_TIME_ZONE })
  async reconcileDueCashProcessingOrders() {
    await this.promoteDueCashOrders();
  }
}
