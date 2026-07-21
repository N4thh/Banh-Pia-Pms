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
    note: string;
    customer: { fullName: string; phone: string };
    address: { houseNumber: string; street: string; ward: string; district: string } | null;
    items: { cakeId: number; cakeName: string; quantity: number; priceAtPurchase: number }[];
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

    //Create Payment Link
    const createLink = async (orderId: string) => {
        const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-link/${orderId}`)
        setPaymentLink(response.data); 
    } 
    useEffect(() => {
        if (orderId && order?.paymentMethod === "BANK_TRANSFER") {
            createLink(orderId); 
        }
    }, [orderId, order?.paymentMethod]);
    useEffect(() => { 
        if (!order || order.paymentMethod !== "BANK_TRANSFER") 
            return;
            
        const interval = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [order, router])
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
