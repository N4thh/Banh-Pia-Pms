"use client";

import { useFormContext } from "react-hook-form";
import { useCheckoutStep } from "../layout";
import { ChevronLeft, LoaderCircle, OctagonAlert, UserRoundCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CheckoutFormValues } from "../types";
import axios from "axios";
import { useRouter } from "next/navigation";

// Kéo xuống quá ngưỡng này (px) thì coi như người dùng muốn đóng
const DRAG_CLOSE_THRESHOLD = 100;

// Nội dung popup
function PendingPopupContent({
    pendingUser,
    formatPhone,
    handleSkipFill,
    handleConfirmFill,
}: {
    pendingUser: {
        phone: string | undefined;
        fullName: string;
        latestAddress: {
            houseNumber: string;
            street: string;
            ward: string;
            district: string;
        } | null;
    } | null;
    formatPhone: (phone: string) => string;
    handleSkipFill: () => void;
    handleConfirmFill: () => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="border border-[#0088FF] rounded-2xl px-4 py-2 flex justify-between items-center">
                <div className="flex flex-col
                text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
                    <p>Số điện thoại*</p>
                    <p>{pendingUser?.phone === undefined ? "" : formatPhone(pendingUser.phone ?? "")}</p>
                </div>
                <UserRoundCheck color="#0088FF" />
            </div>
            <hr className="border-[#0088FF]" />
            <div className="flex flex-col text-[#0088FF]">
                <h3 className="font-vollkorn font-semibold text-[16px] sm:text-[17px] md:text-[18px] lg:text-[19px] xl:text-[20px] 2xl:text-[21px]">
                    Chào mừng quay trở lại, {pendingUser?.fullName}!
                </h3>
                <span className="text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[15px] 2xl:text-[16px]">
                    Bạn có muốn hệ thống tự động điền thông tin còn lại?
                </span>
            </div>

            {pendingUser?.latestAddress && (
                <div className="px-3 py-2 border border-[#0088FF]/25 rounded-lg text-[#0088FF]/65 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px]">
                    <p className="lg:font-medium text-[14px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[17px] 2xl:text-[17px]">
                        Địa chỉ gần nhất của bạn:
                    </p>
                    <p className="py-[0.5vh] text-[12px] sm:text-[12px] md:text-[12px] lg:text-[14px] xl:text-[15px] 2xl:text-[15px]">
                        {pendingUser.latestAddress.houseNumber},{" "}
                        Đường {pendingUser.latestAddress.street},<br />
                        Phường {pendingUser.latestAddress.ward},{" "}
                        Quận {pendingUser.latestAddress.district}
                    </p>
                </div>
            )}

            <p className="text-[#0088FF]/65
            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
                Bạn có muốn dùng lại địa chỉ này cho đơn hàng này không?
            </p>

            <div className="flex justify-between text-[#0088FF]
            text-[16px] sm:text-[16px] md:text-[16px] lg:text-[19px] xl:text-[19px] 2xl:text-[19px]">
                <button
                    onClick={handleSkipFill}
                    className="px-2 font-semibold hover:text-[#0088FF]/65 active:text-[#0088FF]/20 transition-colors [text-decoration-skip-ink:none] underline"
                >
                    Tôi không muốn
                </button>
                <button
                    onClick={handleConfirmFill}
                    className="px-2 font-semibold hover:text-[#0088FF]/65 active:text-[#0088FF]/20 transition-colors [text-decoration-skip-ink:none] underline"
                >
                    Tự động điền thông tin
                </button>
            </div>
        </div>
    );
}

export default function Customer() {
    const router = useRouter();
    const { step, setStep } = useCheckoutStep();
    const [loading, setLoading] = useState(false);
    const [renderPendingModal, setRenderPendingModal] = useState(false);
    const [visiblePendingModal, setVisiblePendingModal] = useState(false);
    const { setValue, getValues } = useFormContext<CheckoutFormValues>();
    const [pendingUser, setPendingUser] = useState<{
        phone: string | undefined;
        fullName: string;
        latestAddress: {
            houseNumber: string;
            street: string;
            ward: string;
            district: string;
        } | null;
    } | null>(null);

    const { register, trigger, watch, formState: { errors } } = useFormContext();
    const paymentMethod = watch("paymentMethod");

    // ref trỏ trực tiếp tới panel để điều khiển transform trong lúc kéo tay (mobile only)
    const panelRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const dragStartY = useRef(0);
    const dragDeltaY = useRef(0);

    const formatPhone = (phone: string) => {
        return phone.replace(/(\d{4})(\d{3})(\d+)/, "$1 $2 $3");
    };

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
    const handleDismissModal = () => {
        setPendingUser(null);
    };

    // Drag handlers chỉ dành cho mobile bottom-sheet
    const handleDragStart = (e: React.PointerEvent) => {
        isDraggingRef.current = true;
        dragStartY.current = e.clientY;
        dragDeltaY.current = 0;
        if (panelRef.current) panelRef.current.style.transition = "none";
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handleDragMove = (e: React.PointerEvent) => {
        if (!isDraggingRef.current || !panelRef.current) return;
        const delta = Math.max(0, e.clientY - dragStartY.current);
        dragDeltaY.current = delta;
        panelRef.current.style.transform = `translateY(${delta}px)`;
    };

    const handleDragEnd = () => {
        if (!isDraggingRef.current || !panelRef.current) return;
        isDraggingRef.current = false;
        panelRef.current.style.transition = "";
        panelRef.current.style.transform = "";

        if (dragDeltaY.current > DRAG_CLOSE_THRESHOLD) {
            handleDismissModal();
        }
        dragDeltaY.current = 0;
    };

    useEffect(() => {
        if (pendingUser) {
            setRenderPendingModal(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisiblePendingModal(true));
            });
        } else {
            setVisiblePendingModal(false);
            const timer = setTimeout(() => setRenderPendingModal(false), 250);
            return () => clearTimeout(timer);
        }
    }, [pendingUser]);

    if (step === 2) return null;

    return (
        <div className="space-y-[2vh] text-[#3D2008]">
            <p className="mt-6 mb-2 font-semibold font-vollkorn text-[20px] sm:text-[21px] md:text-[22px] lg:text-[23px] xl:text-[24px] 2xl:text-[25px]">
                Thông tin liên hệ
            </p>

            {/* input phone */}
            <div>
                <input
                    type="text"
                    {...register("phone", {
                        required: "Vui lòng nhập số điện thoại",
                        pattern: {
                            value: /^0[0-9]{9}$/,
                            message: "Số điện thoại không hợp lệ",
                        },
                    })}
                    className={`w-full p-2 border focus:outline-[#3D2008] rounded ${
                        errors.phone ? "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                    }`}
                    placeholder="Số điện thoại*"
                />
                {errors.phone && (
                    <p className="text-[#E90000] text-sm mt-1 flex items-center gap-1">
                        <OctagonAlert size={18} /> {errors.phone.message?.toString()}
                    </p>
                )}
            </div>

            {/* input fullName */}
            <div>
                <input
                    type="text"
                    {...register("fullName", {
                        required: "Vui lòng nhập họ và tên",
                        minLength: { value: 3, message: "Tên phải có ít nhất 3 ký tự" },
                    })}
                    className={`w-full p-2 border focus:outline-[#3D2008] rounded ${
                        errors.fullName ? "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                    }`}
                    placeholder="Họ và tên*"
                />
                {errors.fullName && (
                    <p className="text-[#E90000] text-sm mt-1 flex items-center gap-1">
                        <OctagonAlert size={18} /> {errors.fullName.message?.toString()}
                    </p>
                )}
            </div>

            <p className="mt-[6vh] font-vollkorn font-semibold text-[20px] sm:text-[21px] md:text-[22px] lg:text-[23px] xl:text-[24px] 2xl:text-[25px]">
                Phương thức thanh toán
            </p>

            <div className="flex flex-col gap-4 font-medium text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                <div>
                    <label
                        className={`flex w-full cursor-pointer justify-between rounded-lg border-2 p-2 transition-colors duration-200 ${
                            paymentMethod === "CASH"
                                ? "bg-[#3D2008] text-[#FDF6E8] border-[#FDF6E8] ring-1 ring-[#3D2008]"
                                : "bg-white border-[#3D2008]/25"
                        }`}
                    >
                        <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px]">
                            Thanh toán khi nhận bánh
                        </p>
                        <input type="radio" value="CASH" className="h-5 w-5" {...register("paymentMethod")} />
                    </label>
                </div>

                <div>
                    <label
                        className={`flex w-full cursor-pointer justify-between rounded-lg border-2 p-2 transition-colors duration-200 ${
                            paymentMethod === "BANK_TRANSFER"
                                ? "bg-[#3D2008] text-[#FDF6E8] border-[#FDF6E8] ring-1 ring-[#3D2008]"
                                : "bg-white border-[#3D2008]/25"
                        }`}
                    >
                        <div className="flex flex-col gap-1">
                            <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px]">
                                Chuyển khoản
                            </p>
                            <p className="font-normal text-[12px]">
                                Mã QR và thông tin chuyển khoản sẽ xuất hiện ở trang thanh toán
                            </p>
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

            <div className="flex flex-col">
                <button
                    className="w-full lg:w-fit lg:ml-auto inset-0 border py-3 px-6 rounded-xl text-[#FDF6E8] font-semibold bg-[#C01F1F] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors"
                    type="button"
                    onClick={handleNext}
                >
                    {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
                    {loading ? "Đang xử lý..." : "Tiếp tục"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="inline-flex w-full justify-center items-center underline text-[#C01F1F] [text-decoration-skip-ink:none] font-semibold lg:hidden mt-5"
                >
                    <ChevronLeft size={20} />
                    <span className="text-sm">Quay lại trang chủ</span>
                </button>
            </div>

            {/* Popup */}
            {renderPendingModal && (
                <>
                    {/* Desktop */}
                    <div
                        className={`hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/50 transition-opacity duration-300 ${
                            visiblePendingModal ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div className="bg-[#E6F2F8] rounded-2xl p-6 w-[90vw] max-w-2xl text-[#3D2008] shadow-2xl">
                            <PendingPopupContent
                                pendingUser={pendingUser}
                                formatPhone={formatPhone}
                                handleSkipFill={handleSkipFill}
                                handleConfirmFill={handleConfirmFill}
                            />
                        </div>
                    </div>

                    {/* Mobile */}
                    <div
                        className={`lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-opacity duration-300 ${
                            visiblePendingModal ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div
                            ref={panelRef}
                            onPointerDown={handleDragStart}
                            onPointerMove={handleDragMove}
                            onPointerUp={handleDragEnd}
                            onPointerCancel={handleDragEnd}
                            className={`bg-[#E6F2F8] rounded-t-2xl rounded-b-none p-6 w-full text-[#3D2008] flex flex-col gap-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                                visiblePendingModal ? "translate-y-0" : "translate-y-full"
                            }`}
                        >
                            {/* Drag handle */}
                            <div className="flex justify-center -mt-2 -mb-2 pb-2 pt-1 touch-none select-none cursor-grab active:cursor-grabbing">
                                <span className="w-18 h-1.5 rounded-full bg-[#D1D1D6]/60" />
                            </div>

                            <PendingPopupContent
                                pendingUser={pendingUser}
                                formatPhone={formatPhone}
                                handleSkipFill={handleSkipFill}
                                handleConfirmFill={handleConfirmFill}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
