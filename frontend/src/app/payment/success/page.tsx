"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import PaymentSuccessBank from "../payment-success-bank";
import PaymentSuccessCash from "../payment-success-cash";

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

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const method = searchParams.get("method");

    const [order, setOrder] = useState<OrderContext | null>(null);

    useEffect(() => {
        if (!orderId) return;

        let cancelled = false;

        const fetchOrder = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/booking/${orderId}`
                );
                if (!cancelled) setOrder(res.data);
            } catch (err) {
                console.error("Lỗi tải đơn hàng:", err);
            }
        };

        fetchOrder();
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    if (!order) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    // method=cash → hiển thị PaymentSuccessCash (order từ order page)
    // method=bank → hiển thị PaymentSuccessBank (order từ PayOS redirect)
    if (method === "cash") {
        return <PaymentSuccessCash order={order} />;
    }

    return (
        <PaymentSuccessBank
            order={order}
            paymentLink={null}
            secondsLeft={0}
        />
    );
}