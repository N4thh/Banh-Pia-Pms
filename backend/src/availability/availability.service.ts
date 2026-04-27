import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookSlotDto } from './dto/book-slot.dto';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class AvailabilityService {
    constructor(private readonly prisma: PrismaService) {}
    
    async bookSlot(dto: BookSlotDto) { 
        return this.prisma.$transaction(async (tx) => {
            const rows = await tx.$queryRaw<any[]>`
            SELECT * FROM "Availability"
            WHERE "cakeId" = ${dto.cakeId}
            AND "date" = ${dto.date}::date
            FOR UPDATE`; 

            if(rows.length === 0)
                throw new NotFoundException(`Chưa có slot cho ngày này`)
            
            const slot = rows[0];
            const newBooked = slot.currentBooked + dto.quantity;
            if(newBooked > slot.bufferLimit)
                throw new ConflictException("Hôm nay mẹ con làm hết nổi rồi cô chú ơi. Cô chú đặt sang ngày khác dùm mẹ con với ạ")
            
            await tx.$executeRaw`
            UPDATE "Availability"
            SET "currentBooked" = ${newBooked}
            WHERE "id" = ${slot.id}`

            const status = newBooked > slot.maxCapacity ? 'WAITLIST' : 'CONFIRMED'; 
            return {status, currentBooked: newBooked}
        })
    }

    async createSlot(dto: CreateSlotDto) {
        const bufferLimit = Math.ceil(dto.maxCapacity * 1.03);
        return this.prisma.availability.upsert({
            where: { cakeId_date: {
                    cakeId: dto.cakeId,
                    date: new Date(dto.date)
                }
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
            }
        });
    }
}
