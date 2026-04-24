import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCakeDto } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';

@Injectable()
export class CakesService {
  constructor(private prisma: PrismaService) {}

  async getAllCakes() {
    return this.prisma.cake.findMany();
  }

  async findOne(id: number) {
    return this.prisma.cake.findUnique({
      where: { id: id },
    });
  }
  async createCake(data: CreateCakeDto) {
    return this.prisma.cake.create({
      data: data,
    });
  }

  async updateCake(id: number, data: UpdateCakeDto) {
    return this.prisma.cake.update({
      where: { id: id },
      data,
    });
  }

  async deleteCake(id: number) { 
    return this.prisma.cake.delete({
      where: {id: id}
    })
  }
}
