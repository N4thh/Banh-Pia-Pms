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
import { EditSlotDto } from './dto/edit-slot.dto';
import {
  addDaysToDateOnly,
  getBusinessDateOnly,
  normalizeDateOnly,
  toPrismaDate,
} from 'src/common/utils/date-only.util';

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
    const date = this.getDateOnly(dto.date);

    const rows = await prismaClient.$queryRaw<any[]>`
          SELECT * FROM "Availability"
          WHERE "cakeId" = ${dto.cakeId}
          AND "date" = ${date}::date
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
    const dates = dto.dates.map((date) =>
      toPrismaDate(this.getDateOnly(date))
    );

    const availabilities = await this.prisma.$transaction(
      dates.map((date) =>
        this.prisma.availability.upsert({
          where: {
            cakeId_date: {
              cakeId: dto.cakeId,
              date,
            },
          },
          update: {
            maxCapacity: dto.maxCapacity,
            bufferLimit,
          },
          create: {
            cakeId: dto.cakeId,
            date,
            maxCapacity: dto.maxCapacity,
            bufferLimit,
          },
        })
      )
  );

    return availabilities;
  }

  async holdSlot(dto: HoldSlotDto) {
    const { cakeId, quantity, phone } = dto;
    const date = this.getDateOnly(dto.date);
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
          AND "date" = ${date}::date
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
    const dateOnly = this.getDateOnly(date);

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SET LOCAL lock_timeout = '3s'`;

      const slot = await tx.$queryRaw<any[]>`
        SELECT id, "currentBooked"
        FROM "Availability"
        WHERE "cakeId" = ${cakeId} AND "date" = ${dateOnly}::date
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
    const businessToday = getBusinessDateOnly();
    const today = toPrismaDate(businessToday);
    const endDay = addDaysToDateOnly(businessToday, 30);

    if (dto.date) {
      const requestedDate = this.getDateOnly(dto.date);
      if (requestedDate < businessToday) {
        throw new BadRequestException('Ngày nhận bánh đã qua');
      }

      const slots = await this.prisma.availability.findMany({
        where: { date: toPrismaDate(requestedDate) },
        include: { cake: { select: { id: true, kind: true } } },
      });
      const totalMax = slots.reduce((s,c) => s + c.maxCapacity, 0);
      const totalBooked = slots.reduce((s,c) => s + c.currentBooked, 0); 
      return {
        date: requestedDate,
        totalMax,
        totalBooked, 
        cakes: slots.map(s => ({
          id: s.cake.id,
          kind: s.cake.kind,
          maxCapacity: s.maxCapacity,
          currentBooked: s.currentBooked,
          remaining: Math.max(0, s.maxCapacity - s.currentBooked),
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
      const key = normalizeDateOnly(s.date);
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
      available: d.totalBooked < d.totalMax,
    }));
  }

  async getAdminCalendar() {
    const businessToday = getBusinessDateOnly();
    const today = toPrismaDate(businessToday);

    const slots = await this.prisma.availability.findMany({
      where: { date: { gte: today } },
      orderBy: { date: 'asc' },
      include: {
        cake: { select: { id: true, kind: true } },
      },
    });

    //Use Set to remove duplicate -> we have a set slot day 
    const dateSet = new Set<string>(slots.map((s) => normalizeDateOnly(s.date)));
    const dates = Array.from(dateSet); //convert to array
    const datePrisma = dates.map((d) => toPrismaDate(d)); //format Date by toPrismaDate

    //Count Orderby ReceiveDay // groupby receiveDate 
    const orderCounts = await this.prisma.order.groupBy({
        by: ['receiveDate'],
        where: { receiveDate: { in: datePrisma } },
        _count: { _all: true },
    });

    //Use Map so now we Dictionary <day, totalOrder>
    const countMap = new Map<string, number>();
    for (const c of orderCounts) {
        countMap.set(normalizeDateOnly(c.receiveDate), c._count._all);
    }

    return slots.map((slot) => {
        const date = normalizeDateOnly(slot.date);
        return {
            date,
            cake: {
                cakeId: slot.cake.id,
                cakeName: slot.cake.kind,
                maxCapacity: slot.maxCapacity,
                currentBooked: slot.currentBooked,
                bufferLimit: slot.bufferLimit,
            },
            orderCount: countMap.get(date) ?? 0, 
        };
    });
  }

  private getDateOnly(value: string | Date): string {
    try {
      return normalizeDateOnly(value);
    } catch {
      throw new BadRequestException('Ngày không hợp lệ, vui lòng dùng định dạng YYYY-MM-DD');
    }
  }

  async editSlot(dto: EditSlotDto) {
    const date = toPrismaDate(this.getDateOnly(dto.date));

    return this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SET LOCAL lock_timeout = '3s'`;

        const rows = await tx.$queryRaw<Array<{ id: number; currentBooked: number }>>`
          SELECT id, "currentBooked"
          FROM "Availability"
          WHERE "cakeId" = ${dto.cakeId}
          AND "date" = ${date}::date
          FOR UPDATE
        `;

        if (rows.length === 0) {
          throw new NotFoundException('Không tìm thấy slot!');
        }

        const slot = rows[0];
        if (dto.newMaxCapacity < slot.currentBooked) {
          throw new BadRequestException(
            'Số lượng mới thấp hơn số bánh đã đặt hiện tại! Vui lòng điền số lượng lớn hơn',
          );
        }

        return tx.availability.update({
          where: { id: slot.id },
          data: {
            maxCapacity: dto.newMaxCapacity,
            bufferLimit: Math.ceil(dto.newMaxCapacity * 1.03),
          },
        });
      },
      { timeout: 5000 },
    );
  }
}
