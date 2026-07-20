"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
}

export default function PaymentSuccessCash({ order }: Props) {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-[#3D2008]">
            <CheckCircle size={80} className="text-green-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Đặt bánh thành công!</h1>
            <p className="text-sm mb-4">Đơn hàng #{order.id}</p>
            <p className="text-sm mb-2">Khách hàng: {order.customer.fullName}</p>
            <p className="text-sm mb-2">SĐT: {order.customer.phone}</p>
            <p className="text-lg font-semibold mt-4 mb-2">
                Tổng tiền: {Number(order.totalMoney).toLocaleString()}đ
            </p>
            <p className="text-sm text-gray-600 mt-2">
                Vui lòng thanh toán khi nhận bánh.
            </p>

            <button
                onClick={() => router.push("/")}
                className="mt-8 px-6 py-3 bg-[#C01F1F] text-white rounded-lg font-semibold"
            >
                Về trang chủ
            </button>
        </div>
    );
}