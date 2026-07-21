'use client'

import { CartItem, getCart } from "@/src/utils/cartUtils";
import { useEffect, useState } from "react";

function SaltedEggLabel(count: number) {
    if (count === 0) return "Không thêm trứng muối";
    return `${count} trứng muối`;
}

export default function CartCard() {
    const [cart,setCart] = useState<CartItem[]>([]); 
    const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  
    useEffect(() => {
        setCart(getCart());
    }, []);
    
    return(
        <div className="border border-[#FFFDF7] rounded-2xl p-4 bg-[#FFFDF7] shadow-xl max-h-[60vh] flex flex-col ">
            {cart.length > 0 && (
                <>
                    <h2 className="font-vollkorn text-[#3D2008] font-semibold
                    text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px] pb-[2vh]">
                    Giỏ hàng của bạn</h2>
                    <div className="flex-1 overflow-y-auto">
                        
                        {cart.map((item) => (
                            <div key={item.id} 
                            className="flex flex-col gap-[2vh] py-1">
                                <div className="flex gap-[1vw]">
                                    <div className="relative w-10 h-10 shrink-0">
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
                                            >{item.productName}</h3>
                                            <h4 className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                                            >{SaltedEggLabel(item.saltedEgg)}</h4>
                                        </div>
                                        <h4 className="font-medium text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                                        {item.unitPrice.toLocaleString("vi-VN")} đ</h4>
                                    </div> 
                                </div> 
                            </div>                  
                        ))}
                    </div>

                    <div className="flex flex-col gap-[2vh] pb-[2vh]
                    text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                        <div className="flex justify-between">
                            <p>Tạm tính</p>
                            <p>{total.toLocaleString("vi-VN")} đ</p>
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
                        <p>{total.toLocaleString("vi-VN")} đ</p>
                    </div>
                </>
            )}

        </div>
    );
}