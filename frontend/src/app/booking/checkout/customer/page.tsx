"use client";

import { useFormContext } from "react-hook-form";
import { useCheckoutStep } from "../layout";
import { LoaderCircle, OctagonAlert } from "lucide-react";
import { useState } from "react";
import { CheckoutFormValues } from "../types";
import axios from "axios";

export default function Customer() {
    const {step, setStep} = useCheckoutStep();
    const [loading, setLoading] = useState(false);
    const { setValue, getValues } = useFormContext<CheckoutFormValues>();
    const [pendingUser, setPendingUser] = useState<{
    fullName: string;
    latestAddress: {
        houseNumber: string;
        street: string;
        ward: string;
        district: string;
    } | null;
    } | null>(null) 

    const { register, trigger, watch, formState: { errors }  } = useFormContext(); 
    const paymentMethod = watch("paymentMethod");
   
    const handleNext = async () => {
    const isValid = await trigger(["fullName", "phone"]);
        if (!isValid) return;

        setLoading(true);
        try {
            const phone = getValues("phone");
            const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/customer/create`,
            { phone }
            );

            const { isNewUser, user } = res.data;

            if (!isNewUser && user && user.latestAddress) {
            setPendingUser(user);
            return;
            }

            setStep(2);
        } catch (err) {
            console.error(err);
            setStep(2);
        } finally {
            setLoading(false);
        }
        };

        const handleConfirmFill = () => {
            if (!pendingUser) return;
            if (!watch("fullName")?.trim()) {
                setValue("fullName", pendingUser.fullName);
            }
            if (pendingUser.latestAddress) {
                setValue("newAddress.houseNumber", pendingUser.latestAddress.houseNumber);
                setValue("newAddress.street", pendingUser.latestAddress.street);
                setValue("newAddress.ward", pendingUser.latestAddress.ward);
                setValue("newAddress.district", pendingUser.latestAddress.district);

                setValue("shippingMethod", "DELIVERY", { shouldValidate: true });
            }
            setPendingUser(null);
            setStep(2);
        };

        const handleSkipFill = () => {
            setPendingUser(null);
            setStep(2);
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
                text-[#FDF6E8] font-semibold bg-[#C01F1F] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors "
                type="button" onClick={handleNext}>
                        {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        {loading ? "Đang xử lý..." : "Tiếp tục"}
                </button>
                
            </div>

            {pendingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-md text-[#3D2008]">
                <h3 className="font-vollkorn font-semibold mb-2
                    text-[18px] sm:text-[19px] md:text-[20px] lg:text-[21px] xl:text-[22px] 2xl:text-[23px]">
                    Xin chào {pendingUser.fullName} <br/> Bạn đã từng đặt bánh trước đây
                </h3>

                {pendingUser.latestAddress && (
                    <div className="mb-4 p-3 border border-[#3D2008]/25 rounded-lg
                    text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px]">
                    <p className="font-bold">Địa chỉ gần nhất của bạn:</p>
                    <p className="py-[1vh]">
                        {pendingUser.latestAddress.houseNumber},{" "}
                        Đường {pendingUser.latestAddress.street},<br />
                        Phường {pendingUser.latestAddress.ward},{" "}
                        {pendingUser.latestAddress.district}
                    </p>
                    </div>
                )}

                <p className="mb-6
                    text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px]">
                    Bạn có muốn dùng lại địa chỉ này cho đơn hàng này không?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                    onClick={handleSkipFill}
                    className="px-5 py-2 border border-[#3D2008]/25 rounded-lg font-semibold
                    hover:bg-[#3D2008] hover:text-white hover:ring-1 ring-[#3D2008] hover:border-[#FDF6E8] active:bg-[#A61B1B] transition-colors">
                    Không, cảm ơn
                    </button>
                    <button
                    onClick={handleConfirmFill}
                    className="px-5 py-2 bg-[#C01F1F] text-white rounded-lg font-semibold
                    hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors">
                    Dùng lại địa chỉ
                    </button>
                </div>
                </div>
            </div>
            )}
    </div>
        
        
    );
}