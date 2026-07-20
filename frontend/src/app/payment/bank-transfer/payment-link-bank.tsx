"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeGenerator } from '@makozi/react-qr-code-generator';

interface OrderItem {
    cakeId: number;
    cakeName: string;
    quantity: number;
    priceAtPurchase: number;
}

interface OrderContext {
    id: number;
    totalMoney: number;
    paymentMethod: string;
    customer: { fullName: string; phone: string };
    items: OrderItem[];
}

interface Props {
    order: OrderContext;
    paymentLink: { qrCode: string; checkoutUrl: string } | null;
    secondsLeft: number;
}

export default function PaymentLink({ order, paymentLink, secondsLeft }: Props) {
    const router = useRouter();
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-[#3D2008]">
            <h1 className="text-2xl font-semibold mb-2">Quét mã QR để thanh toán</h1>
            <p className="text-sm mb-4">Đơn hàng #{order.id} - {order.customer.fullName}</p>
            <p className="text-lg font-semibold mb-6">
                Tổng tiền: {Number(order.totalMoney).toLocaleString()}đ
            </p>

            {paymentLink ? (
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-[#3D2008]/25 rounded-2xl bg-white">
                    <QRCodeGenerator
                        value={paymentLink.qrCode}
                        size={256}
                        bgColor="#F7EACC"
                        fgColor="#000000"
                        logoSize={20}
                    />
                    <a
                        href={paymentLink.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline text-[#3D2008]"
                    >
                        Hoặc click vào đây để mở cổng thanh toán
                    </a>
                </div>
            ) : (
                <Loader2 className="animate-spin" size={48} />
            )}

            <p className="text-red-500 mt-6 font-semibold">
                Mã QR hết hạn sau: {minutes}:{seconds.toString().padStart(2, "0")}
            </p>

            <button
                onClick={() => router.push("/")}
                className="mt-8 px-6 py-2 border border-[#3D2008]/25 rounded-lg"
            >
                Về trang chủ
            </button>
        </div>
    );
}