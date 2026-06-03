import { PaymentMethod } from '@prisma/client';

export const BOOKING_EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_CANCELLED_AUTO: 'order.cancelled.auto',
};

export interface OrderCreatedEventPayload {
  orderId: number;
  customerName: string | null;
  totalMoney: number;
  phone: string;
  receiveDate: string;
  paymentMethod: PaymentMethod;
  items: {
    cakeId: number;
    quantity: number;
    orderDate: Date;
  }[];
}
