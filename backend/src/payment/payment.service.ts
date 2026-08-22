import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PayOS } from '@payos/node';
import { PrismaService } from 'src/prisma/prisma.service';
import { PAYMENT_EVENTS, PaymentSuccessEventPayload } from 'src/payment/constants/payment-event.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly payos: PayOS;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    this.payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID || '',
      apiKey: process.env.PAYOS_API_KEY || '',
      checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
    });
  }
  async CreatePaymentLink(orderId: number) {
    this.logger.log(`[PAYOS] Yêu cầu tạo link thanh toán cho đơn #${orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new BadRequestException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    // Validate config trước khi gọi PayOS
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      this.logger.error('[PAYOS] FRONTEND_URL chưa được cấu hình');
      throw new InternalServerErrorException('FRONTEND_URL is not configured');
    }

    const payosClientId = process.env.PAYOS_CLIENT_ID;
    const payosApiKey = process.env.PAYOS_API_KEY;
    const payosChecksumKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!payosClientId || !payosApiKey || !payosChecksumKey) {
      this.logger.error(
        `[PAYOS] Thiếu PayOS credentials - CLIENT_ID: ${!!payosClientId}, API_KEY: ${!!payosApiKey}, CHECKSUM: ${!!payosChecksumKey}`,
      );
      throw new InternalServerErrorException('PayOS credentials are not configured');
    }

    // Kiểm tra link hiện tại — tránh lỗi PayOS 231 (đơn đã tồn tại)
    const existingLink = await this.prisma.paymentLink.findUnique({
      where: { orderId },
    });

    if (existingLink) {
      // Link chưa thanh toán → trả lại link cũ
      if (existingLink.status === 'PENDING') {
        this.logger.log(`[PAYOS] Link PENDING đã tồn tại cho đơn #${orderId}, trả lại link cũ`);
        return {
          checkoutUrl: existingLink.checkoutUrl,
          qrCode: existingLink.qrCode,
        };
      }
      // Link đã xử lý (PAID/CANCELLED) → xóa link cũ để tạo mới
      await this.prisma.paymentLink.delete({ where: { orderId } });
    }

    // PayOS yêu cầu amount >= 1000 VND
    const amountInVnd = Math.round(Number(order.totalMoney) * 1000);
    if (amountInVnd < 1000) {
      throw new BadRequestException('Tổng tiền đơn hàng không hợp lệ cho thanh toán online');
    }

    // PayOS lưu orderCode độc lập với database. Không dùng orderId trực tiếp,
    // vì khi reset database, auto-increment có thể sinh lại orderId cũ.
    // Dùng số ngẫu nhiên trong phạm vi Prisma Int (32-bit).
    const payosOrderCode = Math.floor(100_000_000 + Math.random() * 900_000_000);

    const paymentData = {
      orderCode: payosOrderCode,
      amount: amountInVnd,
      description: `Thanh toan don hang #${orderId}`,
      cancelUrl: `${frontendUrl}/payment/cancel?orderId=${orderId}`,
      returnUrl: `${frontendUrl}/payment/success-bank?orderId=${orderId}`,
    };

    this.logger.log(`[PAYOS] Đơn #${orderId} - amount=${amountInVnd} VND`);

    try {
      const paymentLinkData =
        await this.payos.paymentRequests.create(paymentData);
      const saveLink = await this.prisma.paymentLink.create({
        data: {
          id: paymentLinkData.paymentLinkId,
          orderId: orderId,
          payosOrderCode,
          checkoutUrl: paymentLinkData.checkoutUrl,
          qrCode: paymentLinkData.qrCode,
          amountRemaining: amountInVnd,
        },
      });

      this.logger.log(
        `[PAYOS] Tạo link thành công cho đơn #${orderId}, linkId=${saveLink.id}`,
      );

      return {
        checkoutUrl: saveLink.checkoutUrl,
        qrCode: saveLink.qrCode,
      };
    } catch (err: any) {
      // Log chi tiết hơn để debug trên production
      this.logger.error(
        `[PAYOS] Lỗi tạo link cho đơn #${orderId}: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException('Lỗi cổng thanh toán');
    }
  }
  
  async handleWebhook(body: any) {
    try {
      const webhookData = await this.payos.webhooks.verify(body);
      let paymentEventPayload: PaymentSuccessEventPayload | null = null;
      const txResult =  await this.prisma.$transaction(async (tx) => {
        const isDuplicated = await tx.paymentTransaction.findUnique({
          where: { reference: webhookData.reference },
        });

        if (isDuplicated) {
          return {
            status: 'duplicated',
            message: `Giao dich #${webhookData.orderCode} da duoc xu ly truoc do`,
          };
        }
        //create paymentTrans
        const createTransaction = await tx.paymentTransaction.create({
          data: {
            paymentLinkId: webhookData.paymentLinkId,
            reference: webhookData.reference,
            amount: webhookData.amount,
            transactionDateTime: new Date(webhookData.transactionDateTime),
            description: webhookData.description,
            counterAccountNumber: webhookData.counterAccountNumber,
            counterAccountName: webhookData.counterAccountName,
            counterAccountBank: webhookData.counterAccountBankId,
            signatureValid: true,
            rawPayload: body,
          },
        });
        //updatePaymentLink
        const paymentLink = await tx.paymentLink.findUnique({
          where: { payosOrderCode: webhookData.orderCode },
          include: { order: { include: { user: true } } },
        });
        if (!paymentLink) {
          throw new BadRequestException(
            `Không tìm thấy payment link cho PayOS orderCode ${webhookData.orderCode}`,
          );
        }

        const orderId = paymentLink.orderId;
        const updatePaymentLink = await tx.paymentLink.update({
          where: { orderId },
          data: {
            status: 'PAID',
            amountPaid: webhookData.amount,
            amountRemaining: 0,
          },
        });
        //update Order status
        const orderStatus = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'PROCESSING',
          },
          include: { user: true },
        });

        this.logger.log(
          `[PAYOS] don hang #${webhookData.orderCode} thanh toan thanh cong`,
        );

        paymentEventPayload = {
          orderId,
          amount: webhookData.amount,
          paidAt: new Date(),
          customerName: orderStatus.user.fullName ?? 'Khách hàng',
        };

        return {
          paymentLinkId: createTransaction.paymentLinkId,
          paymentStatus: updatePaymentLink.status,
          orderStatus: orderStatus.status,
        }; 
      });
      if(txResult.status !== 'duplicated' && paymentEventPayload) {
        this.eventEmitter.emit(
          PAYMENT_EVENTS.PAYMENT_SUCCESS,
          paymentEventPayload,
        );
      } 
        
      return txResult; 
    } catch (err: any) {
      this.logger.error(`Loi thanh toan PayOS: ${err.message}`);
      throw new InternalServerErrorException('Loi thanh toan');
    }
  }
}
