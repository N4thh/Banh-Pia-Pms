import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus, PaymentLinkStatus, CancelReason} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvailabilityService } from 'src/availability/availability.service';


@Injectable()
export class PaymentCronService {
    private readonly logger = new Logger(PaymentCronService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly availabilityService: AvailabilityService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredOrders() {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const expiredOrders = await this.prisma.order.findMany({
            where: {
                status: OrderStatus.NEW,
                paymentMethod: "BANK_TRANSFER",
                orderDate: {lt: tenMinutesAgo},
            },
            include: {paymentLink: true, items: true},
        })

        if(expiredOrders.length === 0)
            return;

        await this.prisma.$transaction(
            expiredOrders.map((order) =>
                this.prisma.order.update({
                    where: {id: order.id},
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
                            }
                        }
                        : undefined,
                    }
                })
            ),
        )

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

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCashProcessingOrders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ordersToProcess = await this.prisma.order.findMany({
            where: {
                status: OrderStatus.NEW,
                paymentMethod: 'CASH',
                receiveDate: { lte: today },
            },
        });

        if (ordersToProcess.length === 0)
            return;

        await this.prisma.$transaction(
            ordersToProcess.map((order) =>
                this.prisma.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.PROCESSING },
                }),
            ),
        );
        this.logger.log(`Đã chuyển ${ordersToProcess.length} đơn CASH sang PROCESSING`);
    }
}
