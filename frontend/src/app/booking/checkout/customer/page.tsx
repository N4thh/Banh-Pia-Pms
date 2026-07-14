"use client";

import { useFormContext } from "react-hook-form";
import { useCheckoutStep } from "../layout";
import { OctagonAlert } from "lucide-react";

export default function Customer() {
    const {step, setStep} = useCheckoutStep(); 
    const { register, trigger, watch, formState: { errors }  } = useFormContext(); 
    const paymentMethod = watch("paymentMethod");
    const handleNext = async () => { 
        const isValid = await trigger(["fullName", "phone"]); 
        if(isValid) {
            setStep(2); 
        }
   };

   if(step === 2) return null;

    return(
        <div className="space-y-[2vh] text-[#3D2008]">
            <p className="mt-6 mb-2 font-semibold font-vollkorn
            text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]"
            >Thông tin người nhận</p>
            {/* input */}
            <div>
                <input
                type="text"
                {...register("phone", {
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                    value: /^0[0-9]{9}$/,
                    message: "Số điện thoại không hợp lệ"
                    }
                })}
                className={`w-full p-2 border focus:outline-[#3D2008] rounded ${
                    errors.phone ?  "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                }`}
                placeholder="Số điện thoại*"
                />
                {/* Hiển thị lỗi số điện thoại */}
                {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <OctagonAlert size={18}/> {errors.phone.message?.toString()}
                </p>
                )}
            </div>
            <div>
                <input
                type="text"
                {...register("fullName", { 
                    required: "Vui lòng nhập họ và tên", 
                    minLength: { value: 3, message: "Tên phải có ít nhất 3 ký tự" }
                })}
                className={`w-full p-2 border focus:outline-[#3D2008] rounded ${
                    errors.fullName ?  "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                }`}
                placeholder="Họ và tên*"
                
                />
                {errors.fullName && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <OctagonAlert size={18}/> {errors.fullName.message?.toString()}
                </p>
                )}
            </div>

            <p className="mt-[6vh] font-vollkorn font-semibold 
            text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]"
            >Phương thức thanh toán</p>

            {/* Payment method */}
            <div className="flex flex-col gap-4 font-medium
                text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                
                <div>
                    <label className={`flex w-full cursor-pointer  justify-between rounded-lg border-2 p-2 transition-colors duration-200 ${
                        paymentMethod === "CASH"
                            ? "bg-[#3D2008] text-white border-[#FDF6E8] ring-1 ring-[#3D2008]"
                            : "bg-white  border-[#3D2008]/25"
                    }`}>
                        <p>Thanh toán khi nhận bánh</p>
                        <input
                            type="radio"
                            value="CASH"
                            className="h-5 w-5"
                            {...register("paymentMethod")}
                        />
                    </label>
                </div>

                <div>
                    <label className={`flex w-full cursor-pointer  justify-between rounded-lg border-2 p-2 transition-colors duration-200 ${
                        paymentMethod === "BANK_TRANSFER"
                            ? "bg-[#3D2008] text-white border-[#FDF6E8] ring-1 ring-[#3D2008]"
                            : "bg-white  border-[#3D2008]/25"
                    }`}>
                        <div className="flex flex-col gap-1">
                            <p>Chuyển khoản</p>
                            <p className="font-normal
                            text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px]"
                            > Mã QR và thông tin chuyển khoản sẽ xuất hiện ở trang thanh toán</p>
                        </div>
                        <input
                            type="radio"
                            value="BANK_TRANSFER"
                            className="h-5 w-5"
                            {...register("paymentMethod")}
                        />
                    </label>
                </div>
            </div>
            

            <div className="flex">
                <button className="ml-auto inset-0 border py-3 px-6 rounded-lg 
                text-[#FDF6E8] font-semibold bg-[#C01F1F]"
                type="button" onClick={handleNext}>Tiếp tục</button>
            </div>
    </div>
        
        
    );
}