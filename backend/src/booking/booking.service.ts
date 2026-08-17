import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AvailabilityService } from 'src/availability/availability.service';
import { CustomerService } from 'src/customer/customer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, ShippingMethod } from './dto/create-order.dto';
import { CancelReason, OrderStatus } from '@prisma/client';
import { RedisService } from 'src/redis/redis.service';
import {
  BOOKING_EVENTS,
  OrderCreatedEventPayload,
} from './constants/booking-event.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  getBusinessDateOnly,
  normalizeDateOnly,
  toPrismaDate,
} from 'src/common/utils/date-only.util';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly customerService: CustomerService,
    private readonly avaibilityService: AvailabilityService,
    private readonly redisService: RedisService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const updateCustomerDto = {
        fullName: dto.fullName,
        address: dto.newAddress,
      };
      const user = await this.customerService.createOrUpdateUser(
        updateCustomerDto,
        dto.phone,
        tx,
      );
      let finalAddressId: number | null = null;
      if (dto.shippingMethod === ShippingMethod.DELIVERY) {
        finalAddressId =
          dto.addressId ?? user.addresses[user.addresses.length - 1]?.id;
        if (!finalAddressId) {
          throw new BadRequestException('Không tìm thấy địa chỉ giao hàng');
        }
      }

      ///
      const itemStatuses: {
        cakeId: number;
        date: string;
        quantity: number;
        eggCount: number;
        priceAtPurchase: any;
        status: any;
      }[] = [];
      let totalMoney = 0;
      const cakeId = dto.items.map((item) => item.cakeId);
      const cake = await tx.cake.findMany({
        where: { id: { in: cakeId } },
      });

      for (const item of dto.items) {
        const slotStatus = await this.avaibilityService.bookSlot(
          {
            cakeId: item.cakeId,
            date: new Date(item.date),
            quantity: item.quantity,
          },
          tx,
        );

        const dbCake = cake.find((c) => c.id === item.cakeId);
        totalMoney += Number(dbCake?.basePrice) * item.quantity;

        itemStatuses.push({
          cakeId: item.cakeId,
          date: item.date,
          quantity: item.quantity,
          eggCount: item.eggCount,
          priceAtPurchase: dbCake?.basePrice,
          status: slotStatus,
        });
      }

      const receiveDate = toPrismaDate(dto.receiveDate);
      const isCashOrderDue =
        dto.paymentMethod === 'CASH' &&
        normalizeDateOnly(receiveDate) <= getBusinessDateOnly();
      const finalStatus = isCashOrderDue
        ? OrderStatus.PROCESSING
        : OrderStatus.NEW;
      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: finalAddressId,
          totalMoney: totalMoney,
          receiveDate,
          status: finalStatus,
          shippingMethod: dto.shippingMethod,
          paymentMethod: dto.paymentMethod,
          note: dto.note,
          items: {
            create: itemStatuses.map((item) => ({
              cakeId: item.cakeId,
              quantity: item.quantity,
              eggCount: item.eggCount,
              priceAtPurchase: item.priceAtPurchase,
            })),
          },
        },
        include: {
          user: true,
          items: true,
        },
      });

      for (const item of itemStatuses) {
        const redisKey = `hold:${order.id}:${item.cakeId}:${item.date}`;
        await this.redisService.setHold(redisKey, item.quantity, 600);
      }
      return { order, itemStatuses };
    });

    const eventPayload: OrderCreatedEventPayload = {
      orderId: result.order.id,
      customerName: result.order.user.fullName,
      totalMoney: Number(result.order.totalMoney),
      phone: result.order.user.phone,
      receiveDate: result.order.receiveDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      paymentMethod: result.order.paymentMethod,
      items: result.itemStatuses.map((item) => ({
        cakeId: item.cakeId,
        quantity: item.quantity,
        orderDate: new Date(item.date),
      })),
    };
    this.eventEmitter.emit(BOOKING_EVENTS.ORDER_CREATED, eventPayload);

    return {
      message: 'Đặt bánh thành công, đang chờ thanh toán!',
      orderId: result.order.id,
    };
  }

  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: id },
      include: {
        user: true,
        address: true,
        items: {
          include: { cake: true },
        },
        paymentLink: true,
      },
    });

    if (!order)
      throw new NotFoundException(`Không tìm thấy order với id: ${id}`);

    const finalCancelReason =
      order.cancelReasonNote !== null
        ? order.cancelReasonNote
        : order.cancelReason;

    return {
      id: order.id,
      totalMoney: Number(order.totalMoney),
      status: order.status,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      receiveDate: order.receiveDate,
      orderDate: order.orderDate,
      note: order.note,
      cancelReason: finalCancelReason,
      cancelledAt: order.cancelledAt,
      customer: {
        fullName: order.user.fullName,
        phone: order.user.phone,
      },
      address: order.address
        ? {
            houseNumber: order.address.houseNumber,
            street: order.address.street,
            ward: order.address.ward,
            district: order.address.district,
          }
        : null,
      items: order.items.map((item) => ({
        cakeId: item.cakeId,
        cakeName: item.cake.kind,
        quantity: item.quantity,
        eggCount: item.eggCount,
        priceAtPurchase: Number(item.priceAtPurchase),
      })),
      paymentLink: order.paymentLink
        ? {
            qrCode: order.paymentLink.qrCode,
            checkoutUrl: order.paymentLink.checkoutUrl,
            status: order.paymentLink.status,
            amountPaid: Number(order.paymentLink.amountPaid),
            amountRemaining: Number(order.paymentLink.amountRemaining),
            createdAt: order.paymentLink.createdAt,
            canceledAt: order.paymentLink.canceledAt,
          }
        : null,
    };
  }

  async getAllOrder(id: number) {
    const order = await this.prisma.order.findMany({
      where: { userId: id },
      select: {
        id: true,
        totalMoney: true,
        orderDate: true,
        receiveDate: true,
        status: true,
        paymentMethod: true,
        shippingMethod: true,
        address: true,
        cancelReason: true,
        cancelledAt: true,
        items: {
          select: { quantity: true },
        },
      },
    });
    if (order.length === 0)
      throw new NotFoundException('Không tìm thấy đơn hàng');

    return order.map((o) => ({
      orderId: o.id,
      totalMoney: Number(o.totalMoney),
      status: o.status,
      orderDate: o.orderDate,
      receiveDate: o.receiveDate,
      paymentMethod: o.paymentMethod,
      shippingMethod: o.shippingMethod,
      cancelReason: o.cancelReason,
      cancelledAt: o.cancelledAt,
      address: o.address
        ? {
            houseNumber: o.address.houseNumber,
            street: o.address.street,
            ward: o.address.ward,
            district: o.address.district,
          }
        : null,
      items: o.items,
    }));
  }

  async cancelOrderById(orderId: number, adminId: number, dto: CancelOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại!');

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Đơn hàng đã bị hủy trước đó');
    }
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy đơn đã hoàn thành');
    }

    // Trả slot trước khi update order
    for (const item of order.items) {
      try {
        await this.avaibilityService.releaseHoldSlot(
          item.cakeId,
          String(order.receiveDate),
          item.quantity,
        );
      } catch (err: any) {
        console.error(
          `[Cancel] Lỗi trả slot cake #${item.cakeId}: ${err.message}`,
        );
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelReason: dto.cancelReason,
        cancelReasonNote:
          dto.cancelReason === CancelReason.OTHER ? dto.cancelReasonNote : null,
        cancelledAt: new Date(),
        cancelledBy: adminId,
      },
    });
  }
  async completedOrderById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại!');

    if (order.status === OrderStatus.CANCELLED)
      throw new BadRequestException('Không thể hoàn thành đơn đã hủy');

    if (order.status === OrderStatus.COMPLETED)
      throw new BadRequestException('Không thể hoàn thành đơn đã hoàn tất');

    if (order.status === OrderStatus.NEW)
      throw new BadRequestException(
        'Chỉ đơn "Đang xử lý" mới có thể hoàn tất, vui lòng xem lại!',
      );

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
      },
    });
  }
}
