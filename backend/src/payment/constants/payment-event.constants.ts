export const PAYMENT_EVENTS = {
	PAYMENT_SUCCESS: 'payment.success',
};

export interface PaymentSuccessEventPayload {
	orderId: number;
	amount: number;
	customerName: string;
	paidAt: Date;
}
