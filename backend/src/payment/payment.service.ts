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
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new BadRequestException(`Không tìm thấy đơn hàng #${orderId}`);
    }

    const amountInVnd = Number(order.totalMoney) * 1000;
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    if(!frontendUrl)
      throw new InternalServerErrorException("FRONTEND_URL is not configured");

    const paymentData = {
      orderCode: orderId,
      amount: amountInVnd,
      description: 'Thanh toán đơn hàng',
      cancelUrl: `${frontendUrl}/payment/cancel?orderId=${orderId}`,
      returnUrl: `${frontendUrl}/payment/success?orderId=${orderId}`,
    };

    try {
      const paymentLinkData =
        await this.payos.paymentRequests.create(paymentData);
      const saveLink = await this.prisma.paymentLink.create({
        data: {
          id: paymentLinkData.paymentLinkId,
          orderId: orderId,
          checkoutUrl: paymentLinkData.checkoutUrl,
          qrCode: paymentLinkData.qrCode,
          amountRemaining: amountInVnd,
        },
      });

      this.logger.log(
        `[PAYOS] Da tao link thanh cong voi don hang #${orderId}`,
      );

      return {
        checkoutUrl: saveLink.checkoutUrl,
        qrCode: saveLink.qrCode,
      };
    } catch (err: any) {
      this.logger.error(`Loi tao link payOS: ${err.message}`);
      throw new InternalServerErrorException('Loi cong thanh toan');
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
        const updatePaymentLink = await tx.paymentLink.update({
          where: { orderId: webhookData.orderCode },
          data: {
            status: 'PAID',
            amountPaid: webhookData.amount,
            amountRemaining: 0,
          },
        });
        //update Order status
        const orderStatus = await tx.order.update({
          where: { id: webhookData.orderCode },
          data: {
            status: 'PROCESSING',
          },
          include: { user: true },
        });

        this.logger.log(
          `[PAYOS] don hang #${webhookData.orderCode} thanh toan thanh cong`,
        );

        paymentEventPayload = {
          orderId: webhookData.orderCode,
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
