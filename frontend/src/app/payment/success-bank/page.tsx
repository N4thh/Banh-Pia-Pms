"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

function formatDateShortVN(isoDate: string): string {
    const date = isoDate.split("T")[0]; 
    const [month, day] = date.split("-");

    return `${day}/${month}`;
}
interface Address {
    houseNumber: string;
    street: string;
    ward: string;
    district: string;
}
interface OrderItem {
    cakeId: number;
    cakeName: string;
    quantity: number;
    priceAtPurchase: number;
    eggCount: number;
}

interface OrderContext {
    id: number;
    receiveDate: string;
    orderDate: string; 
    shippingMethod: string;
    totalMoney: number;
    paymentMethod: string;
    customer: { fullName: string; phone: string };
    items: OrderItem[];
    address: Address;
}


export default function SuccessBankPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [order, setOrder] = useState<OrderContext | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const valueSecondRow = "text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px] font-normal font-sans";
    const valueThirdRow = "font-vollkorn font-semibold text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]";

    function SaltedEggLabel(count: number) {
        if (count === 0) return "Không thêm trứng muối";
        return `${count} trứng muối`;
    }

    const totalQuantity = order?.items.reduce((total, item) => total + item.quantity, 0);


    useEffect(() => {
        if (!orderId) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/booking/${orderId}`)
            .then(res => setOrder(res.data))
            .catch(() => {});
    }, [orderId]);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `invoice-${order?.id}`,
    });

    if (!order) {
        return <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin" size={48} />
        </div>;
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center p-6 text-[#3D2008] gap-[8vh]">
            {/* top background */}
            <div className="relative h-[25vh] w-[90vw] max-w-9xl -z-10 overflow-hidden
            bg-[radial-gradient(ellipse_50vw_25vh_at_top,#A01818_0%,#C01F1F_13%,#F7EACC_94%,#FDF6E8_100%)]" >
                <h1 className="flex justify-center items-center h-full text-[#FDF6E8] font-bold font-vollkorn
                text-[39px] sm:text-[40px] md:text-[41px] lg:text-[42px] xl:text-[43px] 2xl:text-[44px]"
                >Đặt bánh thành công!</h1>
                <div
                className="absolute aspect-square bg-[url('/landing1/Group118.svg')] bg-no-repeat bg-contain"
                style={{
                    bottom: "clamp(4px, 0.5vw, 8px)",
                    right: "clamp(12px, 8.3vw, 180px)",
                    width: "clamp(50px, 13vw, 250px)",
                }}
                />

                <div
                className="absolute aspect-square bg-[url('/landing1/Group117.svg')] bg-no-repeat bg-contain"
                style={{
                    bottom: "clamp(30px, 5.25vw, 100px)",
                    right: "clamp(-36px, -1.5vw, -15px)",
                    width: "clamp(40px, 9vw, 200px)",
                }}
                />

                <div
                className="absolute aspect-square bg-[url('/landing1/Group119.svg')] bg-no-repeat bg-contain"
                style={{
                    bottom: "clamp(-76px, -4vw, -15px)",
                    right: "clamp(-4px, -0.2vw, 0px)",
                    width: "clamp(50px, 10vw, 250px)",
                }}
                />

                <div
                className="absolute aspect-square bg-[url('/landing1/Group116.svg')] bg-no-repeat bg-contain"
                style={{
                    top: "clamp(-68px, -3.5vw, -15px)",
                    left: "clamp(8px, 12vw, 90px)",
                    width: "clamp(50px, 14vw, 250px)",
                }}
                />

                <div
                className="absolute aspect-square bg-[url('/landing1/Group115.svg')] bg-no-repeat bg-contain"
                style={{
                    bottom: "clamp(-60px, -3.1vw, -15px)",
                    left: "clamp(-32px, -1.7vw, -12px)",
                    width: "clamp(45px, 10vw, 250px)",
                }}
                />

            </div>

            <div className="flex flex-col items-center gap-[2vh]">

                <h1 className="text-2xl font-bold mb-2  font-vollkorn
                text-[43px] sm:text-[44px] md:text-[45px] lg:text-[46px] xl:text-[47px] 2xl:text-[48px]"
                >Cảm ơn bạn đã đặt bánh!</h1>
                <div className="flex flex-col w-fit items-center
                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                    <p>Đơn hàng của bạn đã được nhận thành công</p>
                    <p>Chúng tôi sẽ liên hệ để xác nhận lại trong vòng 24 giờ nữa</p>
                </div>

            </div>

            <div ref={invoiceRef} className="flex flex-col gap-[5vh]">
                <div className="h-fit w-[60vw] border border-[#FFFDF7] bg-[#FFFDF7] drop-shadow-2xl flex justify-between rounded-2xl py-2 px-6 font-semibold font-vollkorn
                text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">
                    <div className="flex flex-col">
                        <p className="font-semibold">Đặt bánh vào</p>
                        <p className={valueSecondRow}>{formatDateShortVN(order.orderDate)}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold">Nhận bánh vào</p>
                        <p className={valueSecondRow}>{formatDateShortVN(order.receiveDate)}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold">Phương thức nhận bánh</p>
                        <p className={valueSecondRow}>{order.shippingMethod === 'PICKUP' ? 'Nhận trực tiếp' : 'Giao đến' }</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold">Phương thức thanh toán</p>
                        <p className={valueSecondRow}>{order.paymentMethod === 'CASH' ? 'Thanh toán khi nhận bánh' : 'Chuyển khoản'}</p>
                    </div>
                </div>
                <div className="h-fit w-[60vw] border border-[#FFFDF7] bg-[#FFFDF7]
                    drop-shadow-2xl flex flex-col justify-between rounded-2xl py-2 px-6 gap-[2vh] ">
                    <div className="flex w-full justify-between border-b pb-[1vh] ">
                        <p className="font-vollkorn font-semibold
                        text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]"
                        >Đơn bánh đã đặt</p>
                        <button
                            onClick={handlePrint}
                            className="text-[#C01F1F] hover:underline no-print"
                        >
                            Tải hóa đơn
                        </button>
                    </div>
                    <div className="flex w-full justify-between border-b pb-[1vh] mb-[2vh]
                        text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                        <div className="flex flex-col gap-[0.5vh]">
                            <p className= {valueThirdRow}>Địa điểm nhận bánh</p>
                            <p>{order.address.houseNumber}, Đường {order.address.street},<br /> Phường {order.address.ward}, Tp.{order.address.district}</p>
                        </div>
                        <div className="flex flex-col gap-[0.5vh]">
                            <p className= {valueThirdRow}>Thời gian nhận bánh</p>
                            <p>Từ 7:00 đến 13:00</p>
                        </div>
                        <div className="flex flex-col gap-[0.5vh]">
                            <p className= {valueThirdRow}>Liên hệ nhận bánh</p>
                            <p>033-871-0915</p>
                        </div>
                    </div>
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
                    <div className="flex flex-col gap-[2vh] pb-[2vh] mt-[2vh] border-t border-dotted pt-[2vh]
                    text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                        <div className="flex justify-between">
                            <p>Tạm tính</p>
                            <p>{Number(order.totalMoney).toLocaleString()} đ</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Tổng sản phẩm</p>
                            <p>{totalQuantity}</p>
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
            </div>

            <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-[#C01F1F] text-white rounded-lg font-semibold"
            >
                Về trang chủ
            </button>  
        </div>
    );
}