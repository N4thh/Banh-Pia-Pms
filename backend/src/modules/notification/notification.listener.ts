import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { BOOKING_EVENTS } from 'src/booking/constants/booking-event.constants';
import type { OrderCreatedEventPayload } from 'src/booking/constants/booking-event.constants';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);
  private readonly TELEGRAM_TOKEN =
    '8787220115:AAF6uCjIo9EwK0ENMeQhO57Y8i7nSv6YXAU';
  private readonly TELEGRAM_CHAT_ID = '5762949907';

  constructor(
    private readonly httpService: HttpService,
    @InjectQueue('order-expiry-queue')
    private readonly orderExpiryQueue: Queue,
  ) {}

  @OnEvent(BOOKING_EVENTS.ORDER_CREATED, { async: true })
  async handleOrderCreatedEvent(payload: OrderCreatedEventPayload) {
    this.logger.log(
      `[Event Received] Received a new order signal: #${payload.orderId}`,
    );
    //tele
    await this.sendTelegramNotification(payload);

    if (payload.paymentMethod === 'CASH') {
      this.logger.log(
        `[BullMQ] Đơn #${payload.orderId} thanh toán tiền mặt, không cần lên lịch tự động hủy.`,
      );
      return;
    }
    //set cancel 10'
    try {
      for (const item of payload.items) {
        await this.orderExpiryQueue.add(
          'cancel-expired-order',
          {
            orderId: payload.orderId,
            cakeId: item.cakeId,
            date: item.orderDate,
            quantity: item.quantity,
            receiveDate: payload.receiveDate,
          },
          {
            delay: 1 * 60 * 1000,
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
          },
        );
      }
      this.logger.log(
        `[BullMQ] Đã lên lịch kiểm tra hủy đơn ngầm sau 10 phút cho đơn #${payload.orderId}`,
      );
    } catch (queueError) {
      this.logger.error('Không thể lên lịch hủy đơn hàng ngầm:', queueError);
    }
  }

  private async sendTelegramNotification(payload: OrderCreatedEventPayload) {
    const url = `https://api.telegram.org/bot${this.TELEGRAM_TOKEN}/sendMessage`;

    // Thiết kế nội dung tin nhắn đẹp đẽ, rõ ràng gửi cho Mẹ xem trên điện thoại
    const statusText =
      payload.paymentMethod === 'CASH'
        ? 'Thanh toán tiền mặt'
        : 'Chờ thanh toán (10 phút)';

    const textMessage = `
      ━━━━━━━━━━

      🔔 CÓ ĐƠN HÀNG MỚI

      🆔 Mã đơn: #${payload.orderId}

      👤 Khách: ${payload.customerName}
      📞 SĐT: ${payload.phone}

      📅 Ngày nhận bánh:
      ${payload.receiveDate}

      💰 Tổng tiền:
      ${payload.totalMoney.toLocaleString('vi-VN')} K

      📌 Trạng thái:
      ${statusText}

      ━━━━━━━━━━
      `.trim();

    try {
      // firstValueFrom giúp bọc luồng dữ liệu stream của NestJS thành async/await Promise quen thuộc
      await firstValueFrom(
        this.httpService.post(url, {
          chat_id: this.TELEGRAM_CHAT_ID,
          text: textMessage,
          parse_mode: 'Markdown',
        }),
      );
      this.logger.log(
        `[Telegram Bot] Đã bắn tin nhắn báo đơn #${payload.orderId} về điện thoại thành công!`,
      );
    } catch (err: any) {
      this.logger.error(
        `[Telegram Bot Error] Không thể gửi tin nhắn: ${err.response?.data?.description || err.message}`,
      );
    }
  }
  @OnEvent(BOOKING_EVENTS.ORDER_CANCELLED_AUTO, { async: true })
  async handleOrderCancelEvent(payload: {
    orderId: number;
    quantity: number;
    paymentMethod: string;
    receiveDate: string;
  }) {
    this.logger.log(
      `[Event] Đơn hàng #${payload.orderId} bị hủy tự động, Phương thức thanh toán: ${payload.paymentMethod}`,
    );
    const url = `https://api.telegram.org/bot${this.TELEGRAM_TOKEN}/sendMessage`;
    const textMessage = `
      ━━━━━━━━━━

      ❌ ĐƠN HÀNG TỰ ĐỘNG HỦY

      🆔 Mã đơn: #${payload.orderId}

      📅 Ngày nhận bánh:
      ${payload.receiveDate}

      ⏰ Lý do hủy:
      Đơn hàng đã quá hạn thanh toán.

      ━━━━━━━━━━
      `.trim();
    try {
      await firstValueFrom(
        this.httpService.post(url, {
          chat_id: this.TELEGRAM_CHAT_ID,
          text: textMessage,
          parse_mode: 'Markdown',
        }),
      );
    } catch (err: any) {
      this.logger.error(
        `[Telegram Bot Error] Không thể gửi tin nhắn: ${err.response?.data?.description || err.message}`,
      );
    }
  }
}
