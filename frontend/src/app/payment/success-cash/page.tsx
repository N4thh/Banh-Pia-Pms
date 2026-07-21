"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderContext {
    id: number;
    totalMoney: number;
    paymentMethod: string;
    customer: { fullName: string; phone: string };
    items: { cakeId: number; quantity: number; priceAtPurchase: number }[];
}

export default function SuccessCashPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [order, setOrder] = useState<OrderContext | null>(null);

    useEffect(() => {
        if (!orderId) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/booking/${orderId}`)
            .then(res => setOrder(res.data))
            .catch(() => {});
    }, [orderId]);

    if (!order) {
        return <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin" size={48} />
        </div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-[#3D2008]">
            <CheckCircle size={80} className="text-green-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Đặt bánh thành công!</h1>
            <p className="text-sm mb-2">Đơn hàng #{order.id}</p>
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