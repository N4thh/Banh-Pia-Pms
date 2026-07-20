// booking.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateOrderDto } from './dto/create-order.dto';
// Giả định đường dẫn các Guard của em
import { IdempotencyGuard } from 'src/common/guards/idempotency.guard';
import { OrderThrottlerGuard } from 'src/common/guards/order-throttler.guard';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @UseGuards(OrderThrottlerGuard, IdempotencyGuard) // Bọc các chốt chặn bảo vệ hệ thống
  async createOrder(@Body() dto: CreateOrderDto) {
    return await this.bookingService.createOrder(dto);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) { 
    return this.bookingService.getOrderById(id); 
  }
}