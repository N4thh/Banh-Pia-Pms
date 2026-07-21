import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus, PaymentLinkStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class PaymentCronService { 
    private readonly logger = new Logger(PaymentCronService.name); 

    constructor(private readonly prisma: PrismaService){} 

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredOrders() {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); 

        const expiredOrders = await this.prisma.order.findMany({
            where: {
                status: OrderStatus.NEW, 
                orderDate: {lt: tenMinutesAgo},
            },
            include: {paymentLink: true}
        })

        if(expiredOrders.length === 0)
            return; 

        await this.prisma.$transaction(
            expiredOrders.map((order) =>
                this.prisma.order.update({
                    where: {id: order.id}, 
                    data: {
                        status: OrderStatus.CANCELLED, 
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
        this.logger.log(`Đã hủy ${expiredOrders.length} đơn hết hạn`);
    }
}