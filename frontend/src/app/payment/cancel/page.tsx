"use client";

import { XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CancelPage() {
    const router = useRouter();
    const orderId = useSearchParams().get("orderId");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-[#3D2008]">
            <XCircle size={80} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Thanh toán đã bị hủy</h1>
            <p className="text-sm mb-4">Đơn hàng {orderId ? `#${orderId}` : ""} chưa được thanh toán.</p>
            <p className="text-sm text-gray-600 mb-6">
                Bạn có thể thử thanh toán lại hoặc chọn phương thức khác.
            </p>

            <div className="flex gap-3">
                <button
                    onClick={() => router.push(`/payment?orderId=${orderId}`)}
                    className="px-6 py-3 bg-[#C01F1F] text-white rounded-lg font-semibold"
                >
                    Thử lại
                </button>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 border border-[#3D2008]/25 rounded-lg font-semibold"
                >
                    Về trang chủ
                </button>
            </div>
        </div>
    );
}