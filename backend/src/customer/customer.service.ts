import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FindCustomerDto } from './dto/find-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findExistUser(dto: FindCustomerDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: { addresses: true },
    });
    if (!user) {
      return {
        isNewUser: true,
        user: null,
      };
    }
    return {
      isNewUser: false,
      user,
    };
  }

  async createOrUpdateUser(dto: UpdateCustomerDto, phone: string, tx?: any) {
    const prismaClient = tx ?? this.prisma  //make sure that if the booking is succesfull, the user will be created
    return prismaClient.user.upsert({
      where: { phone: phone },
      update: {
        ...(dto.fullName && {
          fullName: dto.fullName
        }),
        ...(dto.address && {
          addresses: {
            create: {
              ...dto.address, 
              city: 'Hồ Chí Minh'
            }
          }
        })
      },
      create: {
        phone: phone,
        fullName: dto.fullName,
        ...(dto.address && {
          addresses: {
            create: {
              ...dto.address,
              city: 'Hồ Chí Minh',
            },
          },
        }),
      },
      include: { addresses: true },
    });
  }
}
