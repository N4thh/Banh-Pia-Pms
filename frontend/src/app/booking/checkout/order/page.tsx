"use client";

import { useFormContext } from "react-hook-form";
import { useCheckoutStep } from "../layout";
import { OctagonAlert } from "lucide-react";

export default function Order() {
    const {step, setStep} = useCheckoutStep(); 
    const { register,formState: { errors }  } = useFormContext(); 

   if(step === 1) return null;

    return(
        <div className="space-y-4">
            <p className="mt-6 mb-2 text-[#3D2008]">Thông tin người nhận</p>
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

            <div className="flex gap-4 mt-4">
                <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-[#3D2008] text-[#3D2008] rounded"
                >
                    Quay lại
                </button>
                
            </div>
    </div>
        
        
    );
}