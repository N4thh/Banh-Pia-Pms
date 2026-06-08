import { Controller, Post, Param, ParseIntPipe, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-link/:orderId')
  @HttpCode(HttpStatus.CREATED)
  async createPaymentLink(@Param('orderId', ParseIntPipe) orderId: number) {
    this.logger.log(`[Controller] Tiếp nhận yêu cầu tạo link thanh toán cho đơn #${orderId}`);
    return await this.paymentService.CreatePaymentLink(orderId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK) // Trả về 200 OK chuẩn cấu hình Webhook thay vì 201 Created mặc định của POST
  async handlePayOSWebhook(@Body() webhookBody: any) {
    this.logger.log(`[Controller] Nhận dữ liệu Webhook ngầm từ PayOS gửi sang`);
    
    // Đẩy payload sang cho Service xử lý xác thực chữ ký và chạy Transaction DB
    const result = await this.paymentService.handleWebhook(webhookBody);
    
    // Trả về kết quả cho PayOS kết thúc luồng
    return result;
  }
}