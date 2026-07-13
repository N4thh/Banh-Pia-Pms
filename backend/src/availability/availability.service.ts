import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { HoldSlotDto } from './dto/hold-slot.dto';
import { RedisService } from 'src/redis/redis.service';
import { GetSlotsDto } from './dto/get-slot.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async bookSlot(dto: BookSlotDto, tx?: any) {
    if (tx) {
      return this.executeBookingLogic(dto, tx);
    }

    return this.prisma.$transaction(
      async (newTx) => {
        return this.executeBookingLogic(dto, newTx);
      },
      { timeout: 5000 },
    );
  }

  private async executeBookingLogic(dto: BookSlotDto, prismaClient: any) {
    await prismaClient.$executeRaw`SET LOCAL lock_timeout = '3s'`;

    const rows = await prismaClient.$queryRaw<any[]>`
          SELECT * FROM "Availability"
          WHERE "cakeId" = ${dto.cakeId}
          AND "date" = ${dto.date}::date
          FOR UPDATE`;
    if (rows.length === 0)
      throw new NotFoundException(`Chưa có slot cho ngày này`);

    const slot = rows[0];

    const newBooked = slot.currentBooked + dto.quantity;

    if (newBooked > slot.bufferLimit)
      throw new ConflictException(
        'Hôm nay chúng tôi chưa thể xử lý thêm đơn hàng. Bạn vui lòng đặt sang ngày khác giúp chúng tôi nhé',
      );

    await prismaClient.$executeRaw`
        UPDATE "Availability"
        SET "currentBooked" = ${newBooked}
        WHERE "id" = ${slot.id}`;

    const status = newBooked > slot.maxCapacity ? 'WAITLIST' : 'CONFIRMED';

    return { status, currentBooked: newBooked };
  }
  async createSlot(dto: CreateSlotDto) {
    const bufferLimit = Math.ceil(dto.maxCapacity * 1.03);
    return this.prisma.availability.upsert({
      where: {
        cakeId_date: {
          cakeId: dto.cakeId,
          date: new Date(dto.date),
        },
      },
      update: {
        maxCapacity: dto.maxCapacity,
        bufferLimit: bufferLimit,
      },
      create: {
        cakeId: dto.cakeId,
        date: new Date(dto.date),
        maxCapacity: dto.maxCapacity,
        bufferLimit: bufferLimit,
      },
    });
  }

  async holdSlot(dto: HoldSlotDto) {
    const { cakeId, date, quantity, phone } = dto;
    const redisKey = `hold:cake:${cakeId}:date:${date}:user:${phone}`;

    const existkey = await this.redisService.get(redisKey);
    if (existkey)
      throw new BadRequestException(
        'Bạn đang có một hóa đơn chưa thanh toán. Vui lòng kiểm tra lại trong mục thanh toán giúp chúng tôi',
      );

    try {
      await this.prisma.$transaction(async (tx) => {
        //set 3s
        await tx.$executeRaw`SET LOCAL lock_timeout = '3s'`;

        const row = await tx.$queryRaw<any[]>`
          SELECT * FROM "Availability"
          WHERE "cakeId" = ${dto.cakeId} 
          AND "date" = ${dto.date}::date
          FOR UPDATE
          `;

        if (row.length === 0)
          throw new NotFoundException('Hiện chưa có slot cho ngày này');

        const slot = row[0];
        const newbook = dto.quantity + slot.currentBooked;

        if (newbook > slot.bufferLimit) {
          throw new ConflictException(
            'Hôm nay mẹ con làm hết nổi rồi cô chú ơi. Cô chú đặt sang ngày khác dùm mẹ con với ạ',
          );
        }
      });

      //set Redis 10 minutes
      await this.redisService.setHold(redisKey, dto.quantity, 600);
      return { status: 'Success', ttl: '600s' };
    } catch (err) {
      throw err;
    }
  }
  async releaseHoldSlot(cakeId: number, date: string, quantity: number) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SET LOCAL lock_timeout = '3s'`;

      const slot = await tx.$queryRaw<any[]>`
        SELECT id, "currentBooked"
        FROM "Availability"
        WHERE "cakeId" = ${cakeId} AND "date" = ${date}::date
        FOR UPDATE
      `;

      if (!slot || slot.length === 0) {
        throw new InternalServerErrorException(
          'Không tìm thấy slot bánh để hoàn trả!',
        );
      }

      const currentSlot = slot[0];
      const newBooked = Math.max(0, currentSlot.currentBooked - quantity);

      await tx.availability.update({
        where: { id: currentSlot.id },
        data: {
          currentBooked: newBooked,
        },
      });
      return { success: true, newBooked };
    });
  }
  
  async getSlot(dto: GetSlotsDto) { 
    const today = new Date(); today.setHours(0,0,0,0); 
    const endDay = new Date(today); endDay.setDate(today.getDate() + 30); 

    if(dto.date) {
      const slots = await this.prisma.availability.findMany({
        where:  {date: new Date(dto.date)}, 
        include: { cake: { select: {kind: true}}, 
      }})
      const totalMax = slots.reduce((s,c) => s + c.maxCapacity, 0);
      const totalBooked = slots.reduce((s,c) => s + c.currentBooked, 0); 
      return {
        date: dto.date, 
        totalMax, 
        totalBooked, 
        cakes: slots.map(s => ({
          kind: s.cake.kind, 
          remaining: s.maxCapacity - s.currentBooked,
        })),
      };
    }

    //
    const slots = await this.prisma.availability.findMany({
      where: {date: {gte: today, lt: endDay}},
      orderBy: {date: 'asc'}, 
      select: {date: true, maxCapacity: true, currentBooked: true},
    });

    const grouped = new Map<string, {totalMax: number, totalBooked: number}>(); 
    for(const s of slots) { 
      const key = s.date.toISOString().split('T')[0];
      const prev = grouped.get(key) || {totalMax: 0, totalBooked: 0}; 

      grouped.set(key, {
        totalMax: prev.totalMax + s.maxCapacity, 
        totalBooked: prev.totalBooked + s.currentBooked,
      });
    }

    return Array.from(grouped.entries()).map(([date, d]) => ({
      date, 
      totalMax: d.totalMax,
      totalBooked: d.totalBooked,
      available: d.totalBooked < d.totalMax
    }));
  }
}
