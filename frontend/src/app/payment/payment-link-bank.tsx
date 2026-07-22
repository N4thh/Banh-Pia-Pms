"use client";

import { useRouter } from "next/navigation";
import { QRCodeGenerator } from '@makozi/react-qr-code-generator';
import Header from "@/src/components/Header";
import CancelPage from "./cancel/page";
import { ChevronLeft } from "lucide-react";

interface OrderItem {
    cakeId: number;
    cakeName: string;
    quantity: number;
    priceAtPurchase: number;
    eggCount: number;
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

    function SaltedEggLabel(count: number) {
        if (count === 0) return "Không thêm trứng muối";
        return `${count} trứng muối`;
    }

    if(order.status === "PROCESSING" || order.status === "COMPLETED") {
        router.push(`/payment/success-bank?orderId=${order.id}`);
        return null;
    }
    if(order.status === "CANCELLED") { 
        return <CancelPage 
        
        />
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-[#3D2008]">
            
            
            {paymentLink ? (
                <div className="text-[#3D2008]">
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
                    <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="flex flex-col w-full max-w-200 min-w-75 border-2 border-[#3D2008]/25 rounded-2xl
                         bg-white drop-shadow-2xl py-[3vh] sm:py-[4vh] px-[4vw] sm:px-[2vw] gap-[2vh] my-auto mt-[15vh]">
                            <div className="flex flex-col gap-[2vh] pb-[2vh] border-b border-[#3D2008]">
                                <button
                                    onClick={() => router.push("/booking")}
                                    className="w-fit text-[#C01F1F] font-semibold flex "
                                >
                                    <ChevronLeft /> 
                                    <span className="[text-decoration-skip-ink:none] underline
                                    text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                                    >Đổi phương thức thanh toán</span>
                                </button>
                                
                                <div>
                                    <h1 className="text-2xl font-semibold mb-2 font-vollkorn
                                    text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]"
                                    >Chuyển khoảng</h1>
                                    <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                                    >Vui lòng quét mã QR hoặc chuyển khoảng theo thông tin bên dưới</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-[2vh] sm:gap-[2vw]">
                                    <div className="w-full sm:w-1/2 bg-[#F7EACC] flex flex-col items-center gap-[2vh] pt-[2vh] sm:pt-[4vh] pb-[1vh] rounded-lg">
                                        <QRCodeGenerator
                                            className="w-full max-w-45 sm:max-w-37.5 h-auto"
                                            value={paymentLink.qrCode}
                                            size={150}
                                            bgColor="#F7EACC"
                                            fgColor="#000000"
                                        />
                                        <div className=" w-15 sm:w-20 h-7.5 sm:h-10 bg-no-repeat bg-contain
                                        bg-[url('/mb.svg')]"> </div>
                                    </div>
                                    <div className="w-full sm:w-1/2 flex flex-col gap-[1vh] justify-center">
                                        <h1 className="font-medium
                                        text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]"
                                        >Thông tin chuyển khoản</h1>

                                        <div className="flex items-center justify-between w-full ">
                                            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                                            >Chủ tài khoản</p>
                                            <p className="font-medium
                                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                                            >Pham Thi Kim Loan</p>
                                        </div>

                                        <div className="flex items-center justify-between w-full ">
                                            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                                            >Số tài khoản</p>
                                            <p className="font-medium
                                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                                            >VQRQAKPTV8052</p>
                                        </div>

                                        <div className="flex items-center justify-between w-full ">
                                            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                                            >Ngân hàng</p>
                                            <p className="font-medium
                                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                                            >MB Bank</p>
                                        </div>

                                        <div className="flex items-center justify-between w-full ">
                                            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                                            >Tiền cần thanh toán</p>
                                            <p className="font-medium
                                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                                            >{Number(order.totalMoney).toLocaleString()} đ</p>
                                        </div>

                                    </div>                                  
                                </div>
                            </div>

                            <div>
                                <h1 className="font-vollkorn font-semibold
                                text-[18px] sm:text-[19px] md:text-[20px] lg:text-[21px] xl:text-[22px] 2xl:text-[23px]"
                                >Giỏ hàng của bạn</h1>

                                {order.items.map((item, index) => (
                                    <div key={`${item.cakeId}-${index}`}
                                    className="flex flex-col gap-[2vh] py-1">
                                        <div className="flex gap-[1vw]">
                                            {/* Picture */}
                                            <div className="relative w-12 h-12 shrink-0">
                                                <div className="w-full h-full rounded-lg bg-[#D9D9D9] border-4 border-[#FDF6E8]" />
                                                {/* small */}
                                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-md bg-[#C2973F] text-[#FFFDF7]
                                                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px] text-center"
                                                >{item.quantity}</div>
                                            </div>
                                            <div className="flex justify-between w-full text-[#3D2008]">
                                                <div>
                                                    <h3 className="font-semibold font-vollkorn
                                                    text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]"
                                                    >{item.cakeName}</h3>
                                                    <h4 className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                                                    >{SaltedEggLabel(item.eggCount)}</h4>
                                                </div>
                                                <h4 className="font-medium text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                                                {item.priceAtPurchase.toLocaleString("vi-VN")} đ</h4>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex flex-col gap-[2vh] pb-[2vh] mt-[2vh]
                                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                                    <div className="flex justify-between">
                                        <p>Tạm tính</p>
                                        <p>{Number(order.totalMoney).toLocaleString()} đ</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Giảm giá</p>
                                        <p> - </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p> Phí giao hàng</p>
                                        <p> - </p>
                                    </div>
                                </div>

                                <div className="border-t border-dotted pt-[2vh] flex justify-between font-medium
                                text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]">
                                    <p>Tổng</p>
                                    <p>{Number(order.totalMoney).toLocaleString()} đ</p>
                                </div>
                                
                            </div>
                            <div className="flex flex-col items-center">
                                <a
                                    href={paymentLink.checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm underline text-[#3D2008]"
                                >
                                    Hoặc click vào đây để mở cổng thanh toán
                                </a>

                                 <p className="text-red-500 mt-6 font-semibold">
                                    Mã QR hết hạn sau: {minutes}:{seconds.toString().padStart(2, "0")}
                                </p>       
                            </div>
                           
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