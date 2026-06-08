import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Processor('notification_queue', {concurrency: 50})
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  private readonly TELEGRAM_TOKEN =
    '8787220115:AAF6uCjIo9EwK0ENMeQhO57Y8i7nSv6YXAU';
  private readonly TELEGRAM_CHAT_ID = '5762949907';

  constructor(private readonly httpService: HttpService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'order.paid': {
        const { orderId, amount, customerName } = job.data;

        const amountK = (Number(amount) / 1000).toLocaleString('vi-VN', {
          maximumFractionDigits: 2,
        });

        this.logger.log(
          `[Worker] Đang xử lý gửi Telegram cho đơn hàng #${orderId} - Số tiền: ${amountK} K`,
        );

        const url = `https://api.telegram.org/bot${this.TELEGRAM_TOKEN}/sendMessage`;

        const textMessage = `
            ━━━━━━━━━━

            ✅ THANH TOÁN THÀNH CÔNG

            🆔 Mã đơn: #${orderId}

            👤 Khách hàng:
            ${customerName}

            💰 Số tiền:
            ${amountK} K

            🎉 Đơn hàng đã được thanh toán thành công.

            ━━━━━━━━━━
            `.trim();

        try {
          await firstValueFrom(
            this.httpService.post(url, {
              chat_id: this.TELEGRAM_CHAT_ID,
              text: textMessage,
            }),
          );

          this.logger.log(`[Telegram] Đã gửi thông báo đơn hàng #${orderId}`);
        } catch (err: any) {
          this.logger.error(
            `[Telegram Bot Error] Không thể gửi tin nhắn: ${
              err.response?.data?.description || err.message
            }`,
          );
        }

        break;
      }
      case 'order.cancelled.auto': {
        const { orderId, paymentMethod, quantity, receiveDate } = job.data;

        this.logger.log(
          `[Worker] Đang xử lý gửi Telegram thông báo hủy đơn #${orderId} - Số lượng: ${quantity}`,
        );

        const url = `https://api.telegram.org/bot${this.TELEGRAM_TOKEN}/sendMessage`;

        const textMessage = `
            ━━━━━━━━━━

            ❌ ĐƠN HÀNG TỰ ĐỘNG HỦY

            🆔 Mã đơn: #${orderId}

            📅 Ngày nhận bánh:
            ${receiveDate}

            🔄 Phương thức thanh toán:
            ${paymentMethod}

            ⏰ Lý do hủy:
            Đơn hàng đã quá hạn thanh toán.

            ━━━━━━━━━━
            `.trim();

        try {
          await firstValueFrom(
            this.httpService.post(url, {
              chat_id: this.TELEGRAM_CHAT_ID,
              text: textMessage,
            }),
          );

          this.logger.log(`[Telegram] Đã gửi thông báo hủy đơn #${orderId}`);
        } catch (err: any) {
          this.logger.error(
            `[Telegram Bot Error] Không thể gửi tin nhắn: ${
              err.response?.data?.description || err.message
            }`,
          );
        }

        break;
      }
    }
  }
}
