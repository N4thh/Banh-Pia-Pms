'use client'

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PaymentLink from "./payment-link-bank"
import { Loader2 } from "lucide-react";

interface OrderContext {
    id: number;
    totalMoney: number;
    status: string;
    shippingMethod: string;
    paymentMethod: string;
    receiveDate: string;
    orderDate: string;
    note: string;
    customer: { fullName: string; phone: string };
    address: { houseNumber: string; street: string; ward: string; district: string } | null;
    items: { cakeId: number; cakeName: string; quantity: number; priceAtPurchase: number; eggCount: number }[];
    paymentLink: {
        qrCode: string;
        checkoutUrl: string;
        status: string;
        amountPaid: number;
        amountRemaining: number;
        createdAt: string;
        canceledAt: string | null;
    } | null;
}

export default function PaymentPage() {
    const router = useRouter(); 
    const [order, setOrder] = useState<OrderContext | null>(null);
    const [paymentLink, setPaymentLink] = useState<{ qrCode: string; checkoutUrl: string } | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(600);

    //fetchData
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    useEffect(() => {
        if (!orderId) return;
        
        let cancelled = false;
        
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/booking/${orderId}`)
            
                if (!cancelled) setOrder(res.data);
            } catch (err: any) {
                if (!cancelled) {
                    toast.error(err.response?.data?.message || "Lỗi tải đơn hàng");
                    setOrder(null);
                }
            }
        };
        fetchOrder();
        
        return () => { cancelled = true; };
    }, [orderId]);

    //Create Payment Link - chỉ tạo mới khi chưa có
    const createLink = async (orderId: string) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/payment/create-link/${orderId}`
            );
            setPaymentLink(response.data);
        } catch (err: any) {
            // Nếu BE trả 409 hoặc 500 (đã có link hoặc conflict), lấy lại từ order
            if (err.response?.status === 409 || err.response?.status === 500) {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/booking/${orderId}`);
                if (res.data.paymentLink) {
                    setPaymentLink({
                        qrCode: res.data.paymentLink.qrCode,
                        checkoutUrl: res.data.paymentLink.checkoutUrl,
                    });
                }
            }
        }
    }
    useEffect(() => {
        if (!orderId || !order) return;
        if (order.paymentMethod !== "BANK_TRANSFER") return;

        // Ưu tiên dùng paymentLink có sẵn trong order (tránh F5 gọi lại create-link)
        if (order.paymentLink?.status === "PENDING") {
            setPaymentLink({
                qrCode: order.paymentLink.qrCode,
                checkoutUrl: order.paymentLink.checkoutUrl,
            });
            return;
        }

        // Chưa có hoặc link cũ không dùng được → tạo mới
        createLink(orderId);
    }, [orderId, order]);
    useEffect(() => {
        if (!order || order.paymentMethod !== "BANK_TRANSFER") return;

        const orderDate = new Date(order.orderDate).getTime();
        const expireAt = orderDate + 10 * 60 * 1000;
        const remaining = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
        setSecondsLeft(remaining);

        const interval = setInterval(() => {
            const newRemaining = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
            setSecondsLeft(newRemaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [order, router]);
    useEffect(() => {
        if (secondsLeft <= 0 && order?.paymentMethod === "BANK_TRANSFER") {
            router.push('/booking');
        }
    }, [secondsLeft, router, order?.paymentMethod]);

    // loading
    if (!order) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (order.paymentMethod !== "BANK_TRANSFER") {
        router.push(`/payment/success-cash?orderId=${orderId}`);
        return null;
    }

    return (
        <PaymentLink
            order={order}
            paymentLink={paymentLink}
            secondsLeft={secondsLeft}
        />
    );
}
