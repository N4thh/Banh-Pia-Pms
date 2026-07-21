"use client";

import { useRouter } from "next/navigation";
import { QRCodeGenerator } from '@makozi/react-qr-code-generator';
import Header from "@/src/components/Header";
import PaymentSuccessBank from "./success-bank/page";
import CancelPage from "./cancel/page";

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
    status: string;
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

    if(order.status === "PROCESSING" || order.status === "COMPLETED") { 
        return<PaymentSuccessBank
        
        />
    }
    if(order.status === "CANCELLED") { 
        return <CancelPage 
        
        />
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-[#3D2008]">
            
            
            {paymentLink ? (
                <div>
                    <div className="w-[80vw] mx-auto">
                        <Header />
                    </div>
        
                    {/* Right background */}
                    <div className="absolute right-0 top-0 h-full w-[30vw] -z-10 overflow-hidden
                    bg-[radial-gradient(ellipse_80vw_80vh_at_top,#A01818_0%,#C01F1F_16%,#F7EACC_77%,#FDF6E8_100%)]
                    " >
                        <div className="absolute rounded-[50%] top-[10%] right-[-10%]
                        shadow-[inset_0_0_11.1px_0_#F7EACC,inset_0_0_50.4px_0_#F7EACC,0_0_3.1px_0_#F7EACC,0_0_23.8px_0_#F7EACC]
                        bg-[radial-gradient(circle_20vw_at_left,#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
                        style={{
                            width: "min(11.5vw,173px)",
                            height: "min(11.5vw, 173px)",
                        }} />
                        <div className="absolute rounded-[50%] bottom-[-5%] right-[-5%]
                        shadow-[inset_0_0_16px_0_#F7EACC,inset_0_0_96.5px_0_#F7EACC,0_0_8.3px_0_#F7EACC,0_0_36.8px_0_#F7EACC]
                        bg-[radial-gradient(circle_35vw_at_top,#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
                        style={{
                            width: "min(16.5vw,273px)",
                            height: "min(16.5vw, 273px)",
                        }} />
                    </div>
                    {/* Payment link */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col w-[50vw] min-w-[320px] border-2 border-[#3D2008]/25 rounded-2xl bg-whitee">
                            <div className="flex flex-col h-1/2">
                                <button
                                    onClick={() => router.push("/")}
                                    className=""
                                >
                                   Đổi phương thức thanh toán
                                </button>
                                <h1 className="text-2xl font-semibold mb-2">Chuyển khoảng</h1>
                                <p className="text-sm mb-4">Đơn hàng #{order.id} - {order.customer.fullName}</p>
                                <p className="text-lg font-semibold mb-6">
                                    Tổng tiền: {Number(order.totalMoney).toLocaleString()}đ
                                </p>
                                <QRCodeGenerator
                                    value={paymentLink.qrCode}
                                    size={200}
                                    bgColor="#F7EACC"
                                    fgColor="#000000"
                                />
                            </div>
                            <div className="h-1/2 border">
                                <a
                                    href={paymentLink.checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm underline text-[#3D2008]"
                                >
                                    Hoặc click vào đây để mở cổng thanh toán
                                </a>
                            </div>
                            <p className="text-red-500 mt-6 font-semibold">
                                Mã QR hết hạn sau: {minutes}:{seconds.toString().padStart(2, "0")}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Đơn hàng của bạn đã bị hủy do quá hạn</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-8 px-6 py-2 border border-[#3D2008]/25 rounded-lg"
                    >
                        Về trang chủ
                    </button>
                </div>
                
            )}
        </div>
    );
}