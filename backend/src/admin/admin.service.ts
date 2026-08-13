import { BadRequestException, Injectable } from '@nestjs/common';
import { Cake, OrderStatus, VisitLog } from '@prisma/client';
import { getBusinessDateOnly, toPrismaDate, addDaysToDateOnly, getMondayOfWeek, normalizeDateOnly, minDateOnly, diffDays, weekdayLabel, weekdayIndex } from 'src/common/utils/date-only.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetOrdersBySlotDto } from './dto/admin-orders.dto';
import { AdminStatsOverviewDto } from './dto/admin-stats-overview.dto';

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


    //GetStarOverView

    private resolveStatsRange(dto: AdminStatsOverviewDto, now = new Date()) { 
        const todayStr = getBusinessDateOnly(now);
        const mondayStr = dto.startDate ? getMondayOfWeek(dto.startDate) : getMondayOfWeek(todayStr); 

        const weeks = dto.weeks ?? 1; 
        const idealEnd = addDaysToDateOnly(mondayStr, weeks * 7 -1); 
        const idealEndStr = normalizeDateOnly(idealEnd); 
        const rangeEndStr = minDateOnly(idealEnd, todayStr); 
        const dayCount = diffDays(mondayStr, rangeEndStr) + 1; 
        const isPartial = rangeEndStr !== idealEndStr; 
        return { rangeStart: mondayStr, rangeEnd: rangeEndStr, weeks, dayCount, isPartial };
    }

    private async loadCompletedOrders(range: ResolvedStatsRange) {
        const from = toPrismaDate(range.rangeStart);
        const to = toPrismaDate(range.rangeEnd);

        return this.prisma.order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                receiveDate: { gte: from, lte: to },
            },
            select: {
                id: true,
                totalMoney: true,
                receiveDate: true,
                items: {
                    select: {
                        cakeId: true,
                        eggCount: true,
                        quantity: true,
                        cake: { select: { kind: true } },
                    },
                },
            },
            orderBy: { receiveDate: 'asc' },
        });
    }

    private async loadVisitLog(range: ResolvedStatsRange) {
        return this.prisma.$queryRaw<VisitLogRow[]>`
            SELECT
                (v."createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day,
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE v."deviceType" = 'mobile')::int AS mobile,
                COUNT(*) FILTER (WHERE v."deviceType" = 'desktop')::int AS desktop,
                COUNT(*) FILTER (WHERE v."deviceType" = 'other')::int AS other,
                COUNT(*) FILTER (WHERE v."userId" IS NOT NULL)::int AS "loggedInVisits"
            FROM "VisitLog" v
            WHERE (v."createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                BETWEEN ${range.rangeStart}::date AND ${range.rangeEnd}::date
            GROUP BY day
            ORDER BY day;
        `;
    }

    private async loadNewReturningVisitors(range: ResolvedStatsRange) {
        return this.prisma.$queryRaw<NewReturningRow[]>`
            SELECT
                (v."createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day,
                COUNT(*) FILTER (
                    WHERE (u."createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                        BETWEEN ${range.rangeStart}::date AND ${range.rangeEnd}::date
                )::int AS new_visitors,
                COUNT(*) FILTER (
                    WHERE (u."createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date < ${range.rangeStart}::date
                )::int AS returning_visitors
            FROM "VisitLog" v
            JOIN "User" u ON u.id = v."userId"
            WHERE (v."createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                BETWEEN ${range.rangeStart}::date AND ${range.rangeEnd}::date
                AND v."userId" IS NOT NULL
            GROUP BY day
            ORDER BY day;
        `;
    }
    
    private buildOrderStatistics(range: ResolvedStatsRange, orders: OrderWithItems[]) {
        const dailyMap = new Map<string, DailyEntry>();
        const byWeekdayMap = new Map<WeekdayIndex, WeekdayEntry>();
        const cakeBreakdownByDate: Record<string, CakeBreakDown> = {};

        for (let i = 1; i <= 7; i++) {
            const index = i as WeekdayIndex;
            byWeekdayMap.set(index, {
                weekdayIndex: index,
                label: weekdayLabel(index),
                orders: 0,
                cakes: 0,
                visits: 0,
                revenue: 0,
                profit: 0,
                newVisitors: 0,
                returningVisitors: 0,
            });
        }

        for (let offset = 0; offset < range.dayCount; offset++) {
            const date = normalizeDateOnly(addDaysToDateOnly(range.rangeStart, offset));
            const index = weekdayIndex(date);
            dailyMap.set(date, {
                date,
                weekdayIndex: index,
                weekday: weekdayLabel(index),
                orders: 0,
                cakes: 0,
                visits: 0,
                revenue: 0,
                profit: 0,
                newVisitors: 0,
                returningVisitors: 0,
            });
        }

        for (const order of orders) {
            const date = normalizeDateOnly(order.receiveDate);
            const daily = dailyMap.get(date);
            const index = weekdayIndex(date);
            const weekday = byWeekdayMap.get(index);
            const revenue = Number(order.totalMoney);
            const cakes = order.items.reduce((sum, item) => sum + item.quantity, 0);

            // Guard này giúp an toàn nếu DB trả về order ngoài range do dữ liệu bất thường.
            if (!daily || !weekday) continue;

            daily.orders += 1;
            daily.cakes += cakes;
            daily.revenue += revenue;
            daily.profit += revenue / 2;

            weekday.orders += 1;
            weekday.cakes += cakes;
            weekday.revenue += revenue;
            weekday.profit += revenue / 2;

            const breakdown = cakeBreakdownByDate[date] ??= {
                totalCakes: 0,
                totalOrders: 0,
                byEggCount: { '0': 0, '1': 0, '2': 0, '3': 0 },
                byKind: {},
            };

            breakdown.totalCakes += cakes;
            breakdown.totalOrders += 1;

            for (const item of order.items) {
                const eggCount = String(item.eggCount);
                breakdown.byEggCount[eggCount] =
                    (breakdown.byEggCount[eggCount] ?? 0) + item.quantity;
                breakdown.byKind[item.cake.kind] =
                    (breakdown.byKind[item.cake.kind] ?? 0) + item.quantity;
            }
        }

        const daily = [...dailyMap.values()];
        const byWeekday = [...byWeekdayMap.values()].sort(
            (a, b) => a.weekdayIndex - b.weekdayIndex,
        );

        return {
            daily,
            byWeekday,
            cakeBreakdownByDate,
            summary: {
                orders: daily.reduce((sum, day) => sum + day.orders, 0),
                cakes: daily.reduce((sum, day) => sum + day.cakes, 0),
                revenue: daily.reduce((sum, day) => sum + day.revenue, 0),
                profit: daily.reduce((sum, day) => sum + day.profit, 0),
            },
        };
    }

    private mergeVisitorStatistics(
        stats: ReturnType<AdminService['buildOrderStatistics']>,
        visitRows: VisitLogRow[],
        visitorRows: NewReturningRow[],
    ) {
        const visitsByDate = new Map(visitRows.map((row) => [normalizeDateOnly(row.day), row]));
        const visitorsByDate = new Map(visitorRows.map((row) => [normalizeDateOnly(row.day), row]));

        for (const day of stats.daily) {
            const visits = visitsByDate.get(day.date);
            const visitors = visitorsByDate.get(day.date);
            day.visits = visits?.total ?? 0;
            day.newVisitors = visitors?.new_visitors ?? 0;
            day.returningVisitors = visitors?.returning_visitors ?? 0;
        }

        for (const weekday of stats.byWeekday) {
            for (const day of stats.daily) {
                if (day.weekdayIndex !== weekday.weekdayIndex) continue;
                weekday.visits += day.visits;
                weekday.newVisitors += day.newVisitors;
                weekday.returningVisitors += day.returningVisitors;
            }
        }

        const devices = visitRows.reduce(
            (result, row) => ({
                mobile: result.mobile + row.mobile,
                desktop: result.desktop + row.desktop,
                other: result.other + row.other,
                total: result.total + row.total,
            }),
            { mobile: 0, desktop: 0, other: 0, total: 0 },
        );

        return {
            devices,
            summary: {
                visits: devices.total,
                newVisitors: stats.daily.reduce((sum, day) => sum + day.newVisitors, 0),
                returningVisitors: stats.daily.reduce((sum, day) => sum + day.returningVisitors, 0),
            },
        };
    }

    private buildComparison(current: SummaryNumbers, previous: SummaryNumbers | null) {
        if (!previous) return null;

        const compare = (currentValue: number, previousValue: number) => {
            if (previousValue === 0) {
                return {
                    current: currentValue,
                    previous: previousValue,
                    changePercent: currentValue === 0 ? 0 : null,
                    direction: currentValue === 0 ? 'flat' as const : 'up' as const,
                };
            }

            const change = ((currentValue - previousValue) / previousValue) * 100;
            return {
                current: currentValue,
                previous: previousValue,
                changePercent: Math.round(change * 10) / 10,
                direction: change === 0 ? 'flat' as const : change > 0 ? 'up' as const : 'down' as const,
            };
        };

        return {
            orders: compare(current.orders, previous.orders),
            cakes: compare(current.cakes, previous.cakes),
            visits: compare(current.visits, previous.visits),
            revenue: compare(current.revenue, previous.revenue),
            profit: compare(current.profit, previous.profit),
            newVisitors: compare(current.newVisitors, previous.newVisitors),
            returningVisitors: compare(current.returningVisitors, previous.returningVisitors),
        };
    }

    private buildSummary(
        orderSummary: OrderSummary,
        visitorSummary: VisitorSummary,
    ): SummaryNumbers {
        return { ...orderSummary, ...visitorSummary };
    }

    async getStatOverview(dto: AdminStatsOverviewDto) {
        const range = this.resolveStatsRange(dto);
        const orders = await this.loadCompletedOrders(range);
        const orderStats = this.buildOrderStatistics(range, orders);
        const [visitRows, visitorRows] = await Promise.all([
            this.loadVisitLog(range),
            this.loadNewReturningVisitors(range),
        ]);
        const visitorStats = this.mergeVisitorStatistics(orderStats, visitRows, visitorRows);
        const summary = this.buildSummary(orderStats.summary, visitorStats.summary);

        let comparison: ReturnType<AdminService['buildComparison']> = null;
        if (range.weeks === 1) {
            const previousRange: ResolvedStatsRange = {
                rangeStart: normalizeDateOnly(addDaysToDateOnly(range.rangeStart, -7)),
                rangeEnd: normalizeDateOnly(addDaysToDateOnly(range.rangeEnd, -7)),
                weeks: 1,
                dayCount: range.dayCount,
                isPartial: range.isPartial,
            };
            const previousOrders = await this.loadCompletedOrders(previousRange);
            const previousOrderStats = this.buildOrderStatistics(previousRange, previousOrders);
            const [previousVisitRows, previousVisitorRows] = await Promise.all([
                this.loadVisitLog(previousRange),
                this.loadNewReturningVisitors(previousRange),
            ]);
            const previousVisitorStats = this.mergeVisitorStatistics(
                previousOrderStats,
                previousVisitRows,
                previousVisitorRows,
            );
            comparison = this.buildComparison(
                summary,
                this.buildSummary(previousOrderStats.summary, previousVisitorStats.summary),
            );
        }

        return {
            range,
            summary,
            comparison,
            daily: orderStats.daily,
            byWeekday: orderStats.byWeekday,
            cakeBreakdownByDate: orderStats.cakeBreakdownByDate,
            devices: visitorStats.devices,
        };
    }

    
}

type ResolvedStatsRange = {
    rangeStart: string;
    rangeEnd: string;
    weeks: number;
    dayCount: number;
    isPartial: boolean;
};

//VisitLog
type VisitLogRow = { 
    day: Date;
    total: number; 
    mobile: number; 
    desktop: number; 
    other: number; 
    loggedInVisits: number; 
}
type NewReturningRow = { 
    day: Date; 
    new_visitors: number; 
    returning_visitors: number; 
}

//Orders
type WeekdayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type OrderSummary = {
    orders: number;
    cakes: number;
    revenue: number;
    profit: number;
};

type VisitorSummary = {
    visits: number;
    newVisitors: number;
    returningVisitors: number;
};

type SummaryNumbers = OrderSummary & VisitorSummary;

type DailyEntry = { 
    date: string;
    weekdayIndex: WeekdayIndex;
    weekday: string; 
    orders: number; 
    cakes: number; 
    visits: number; 
    revenue: number; 
    profit: number; 
    newVisitors: number; 
    returningVisitors: number;
}

type WeekdayEntry = {
    weekdayIndex: WeekdayIndex;
    label: string;
    orders: number;
    cakes: number;
    visits: number;
    revenue: number;
    profit: number;
    newVisitors: number;
    returningVisitors: number;
};

type CakeBreakDown = { 
    totalCakes: number; 
    totalOrders: number; 
    byEggCount: Record<string, number>; 
    byKind: Record<string, number>; 
}

type OrderWithItems = { 
    id: number; 
    totalMoney: any; 
    receiveDate: Date; 
    items: {
        cakeId: number;
        eggCount: number; 
        quantity: number; 
        cake: {kind: string}
    }[];
}

