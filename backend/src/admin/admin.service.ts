import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { getBusinessDateOnly, toPrismaDate, addDaysToDateOnly } from 'src/common/utils/date-only.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetOrdersBySlotDto } from './dto/admin-orders.dto';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {} 

    async getStats(range: "ALL" | "TODAY" | "WEEK" | "MONTH" = "ALL") { 
    const now = new Date();
    let dateFrom: Date | null = null;

    if(range === "TODAY") {
        dateFrom = toPrismaDate(getBusinessDateOnly(now));
    } else if (range === "WEEK") {
        const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const day = vnNow.getDay(); 
        const diff = day === 0 ? -6 : day - 1;
        const startOfWeekVN = new Date(vnNow);
        startOfWeekVN.setDate(startOfWeekVN.getDate() + diff);
        startOfWeekVN.setHours(0, 0, 0, 0);
        dateFrom = new Date(startOfWeekVN.getTime() - 7 * 60 * 60 * 1000);
    } else if(range === "MONTH") {
        const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const startOfMonthVN = new Date(vnNow);
        startOfMonthVN.setDate(1);
        startOfMonthVN.setHours(0, 0, 0, 0);
        dateFrom = new Date(startOfMonthVN.getTime() - 7 * 60 * 60 * 1000);
    }

    //querry select time
    const where = dateFrom ? { orderDate: {gte: dateFrom}} : {}; 

    const todayStr = getBusinessDateOnly(now);
    const todayFrom = toPrismaDate(todayStr);          
    const tomorrowFrom = addDaysToDateOnly(todayStr, 1); 
    const todayTo = new Date(tomorrowFrom.getTime() - 1);

    const [revenueData, totalOrder, completedToday, pending, totalQuantityCakesSold, 
        totalToday, totalCakeToday, pendingToday, pendingCakeToday] = await Promise.all([ 
        //revenueData
        this.prisma.order.aggregate({ 
            _sum: { totalMoney: true}, 
            where: {...where, status: OrderStatus.COMPLETED},
        }),
        //total
        this.prisma.order.count({ where }),
        //completedToday
        this.prisma.order.count({
            where: { 
                receiveDate: { gte: todayFrom, lte: todayTo }, 
                status: OrderStatus.COMPLETED,
            }
        }),
        //pending
            this.prisma.order.count({
            where: {
                status: { in: [OrderStatus.NEW, OrderStatus.PROCESSING]},
                ...where,
            },
            }),
            //totalQuantityCakesSold
        this.prisma.orderItem.aggregate({
            where: { order: {status: OrderStatus.COMPLETED},},
            _sum: { quantity: true}, 
        }),
        //totalToday
        this.prisma.order.count({
                where: {
                receiveDate: { gte: todayFrom, lte: todayTo },
            },
        }),
        //totalCakeToday
            this.prisma.orderItem.aggregate({
            where: { order: {
                receiveDate: { gte: todayFrom, lte: todayTo },
            },},
            _sum: { quantity: true}, 
        }),
        //PendingToday
        this.prisma.order.count({
            where: {
                receiveDate: { gte: todayFrom, lte: todayTo },
                status: { in: [OrderStatus.NEW, OrderStatus.PROCESSING]},
            },
            }),
            //pendingCakeToday
        this.prisma.orderItem.aggregate({
            where: { 
                order: {
                receiveDate: { gte: todayFrom, lte: todayTo },
                status: { in: [OrderStatus.NEW, OrderStatus.PROCESSING]},
                },
            },
            _sum: { quantity: true}, 
        }),
    ]);

    return {
        totalRevenue: revenueData._sum.totalMoney ?? 0,
        totalOrders: totalOrder,
        completedToday,
        pendingOrders: pending,
        range,
        totalQuantityCakesSold: totalQuantityCakesSold._sum.quantity ?? 0,
        totalToday: totalToday,
        totalCakeToday: totalCakeToday._sum.quantity ?? 0,
        pendingToday: pendingToday ?? 0,
        pendingCakeToday: pendingCakeToday._sum.quantity ?? 0,
    };
    }

    async getOrdersBySlot(dto: GetOrdersBySlotDto) {
        const page = dto.page ?? 1;
        const PAGE_SIZE = 15;
        const skip = (page - 1) * PAGE_SIZE;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    receiveDate: toPrismaDate(dto.date), 
                    items: { some: {cakeId: dto.cakeId}}
                },
                include: { 
                    user: { select: {fullName: true, phone: true}}, 
                    items: { 
                        select: {
                            quantity: true, 
                            eggCount: true, 
                            priceAtPurchase: true,
                            cake: { select: { kind: true } },
                        },
                    },
                },
                skip,
                take: PAGE_SIZE,
            }),

            this.prisma.order.count({
                where: {
                    receiveDate: toPrismaDate(dto.date), 
                    items: { some: {cakeId: dto.cakeId}}
                },
            })
        ]);

        const priority: Record<string, number> = {
            PROCESSING: 1,
            NEW: 2,
            COMPLETED: 3,
            CANCELLED: 4,
        }
        const sorted = orders.sort((a, b) => {
            const pa = priority[a.status] ?? 99;
            const pb = priority[b.status] ?? 99;
            if (pa !== pb) return pa - pb;
            return a.id - b.id;  // id ASC
        });
        
        return {
            orders: sorted.map((o) => ({
                orderId: o.id,
                customerName: o.user.fullName,
                phone: o.user.phone,
                items: o.items.map((item) => ({
                    quantity: item.quantity,
                    eggCount: item.eggCount,
                    priceAtPurchase: item.priceAtPurchase,
                })),
                status: o.status,
                orderDate: o.orderDate,
                receiveDate: o.receiveDate,
                shippingMethod: o.shippingMethod,
                paymentMethod: o.paymentMethod,
            })),
            total,
            page: dto.page,
            totalPages: Math.ceil(total / PAGE_SIZE),
            pageSize: PAGE_SIZE
        }
    }
}
