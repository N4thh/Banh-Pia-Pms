"use client";

import { Suspense } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function CancelContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-[#3D2008]">
            <XCircle size={80} className="text-[#E90000] mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Thanh toán đã bị hủy</h1>
            <p className="text-sm mb-4">Đơn hàng {orderId ? `#${orderId}` : ""} chưa được thanh toán.</p>
            <p className="text-sm text-gray-600 mb-6">
                Bạn có thể thử thanh toán lại hoặc chọn phương thức khác.
            </p>

            <div className="flex gap-3">
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 rounded-lg font-semibold bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors"
                >
                    Về trang chủ
                </button>           
            </div>
        </div>
    );
}

export default function CancelPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="animate-spin text-[#C01F1F]" size={48} />
            </div>
        }>
            <CancelContent />
        </Suspense>
    );
}