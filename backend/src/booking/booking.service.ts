import { Injectable, BadRequestException } from '@nestjs/common';
import { AvailabilityService } from 'src/availability/availability.service';
import { CustomerService } from 'src/customer/customer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, ShippingMethod } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerService: CustomerService,
    private readonly avaibilityService: AvailabilityService,
    private readonly redisService: RedisService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
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
          throw new BadRequestException(
            'Không tìm thấy địa chỉ giao hàng',
          );
        }
      }

      ///
      const itemStatuses: {
        cakeId: number;
        date: string;
        quantity: number;
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
          priceAtPurchase: dbCake?.basePrice,
          status: slotStatus,
        });
      }

      const hasWaitlist = itemStatuses.some(
        (item) => item.status === 'WAITLIST',
      );
      const finalPaymentStatus = hasWaitlist ? 'PENDING_WAITLIST' : 'PENDING';
      const finalStatus = hasWaitlist ? OrderStatus.NEW : OrderStatus.NEW;
      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: finalAddressId,
          totalMoney: totalMoney,
          status: finalStatus,
          shippingMethod: dto.shippingMethod,
          paymentMethod: dto.paymentMethod,
          note: dto.note,
          items: {
            create: itemStatuses.map((item) => ({
              cakeId: item.cakeId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
            })),
          },
        },
      });

      for (const item of itemStatuses) {
        const redisKey = `hold:${order.id}:${item.cakeId}:${item.date}`;
        await this.redisService.setHold(redisKey, item.quantity, 600);
      }
      return order;
    });
  }
}
