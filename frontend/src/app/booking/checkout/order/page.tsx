"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutFormValues } from "../types";
import { useFormContext } from "react-hook-form";
import { useCheckoutStep } from "../layout";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Clock, LoaderCircle, MapPin, OctagonAlert, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartItem, getCart } from "@/src/utils/cartUtils";
import axios from "axios";
import SlotWarningModal, { SlotViolation } from "./SlotWarningModal";
import toast from "react-hot-toast";

const KIND_TO_PRODUCT_NAME: Record<string, string> = {
    "Dau Xanh": "Bánh Pía Đậu Xanh",
    "Sau Rieng": "Bánh Pía Sầu Riêng",
};

function formatDateShortVN(isoDate: string): string {
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}`;
}

interface slot { 
    date: string, 
    totalMax: number, 
    totalBooked: number, 
    available: boolean, 
};

interface CakeSlot {
    id: number,
    kind: string, 
    remaining: number,
};
interface slotByDate { 
    date: string, 
    totalMax: number, 
    totalBooked: number,
    cakes: CakeSlot[],
};

export default function Order() {
    const {step, setStep} = useCheckoutStep(); 
    const { register, watch, trigger, formState: { errors } } = useFormContext<CheckoutFormValues>(); 
    const shippingMethod = watch("shippingMethod");
    const router = useRouter();
    const pickupRef = useRef<HTMLHeadingElement>(null);
    const deliveryRef = useRef<HTMLHeadingElement>(null);
    const [loading, setLoading] = useState(false);
    const [slots, setSlots] = useState<slot[]>([]);
    const [slotByDay, setSlotByDay] = useState<slotByDate | null>(null); 
    const [shippingMethodError, setShippingMethodError] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [warningData, setWarningData] = useState<{
        date: string; 
        violations: SlotViolation[];
    } | null>(null);
    const [pendingDate, setPendingDate] = useState<string | null>(null);
    const { setValue, getValues } = useFormContext<CheckoutFormValues>();    
    const fetchSlots = async () => { 
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/availability/slots`
        );
        setSlots(response.data); 
    };

    useEffect(() => { 
        fetchSlots();
        setCart(getCart());
    }, []);
    
    useEffect(() => { 
        if(shippingMethod === "PICKUP") {
            pickupRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
        if(shippingMethod === "DELIVERY") {
            deliveryRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [shippingMethod]);

    if(step === 1) return null;

    //formatDate
    const formatDate = (date: string) => {
        const [, month, day] = date.split("-");
        return `${day}/${month}`;
    };

    //Warning
    const totalByCake = new Map<string, {total: number}>();
    for(const c of cart) { 
        const prev = totalByCake.get(c.productId) || {total: 0};
        totalByCake.set(c.productId, {
            total: prev.total + c.quantity
        });
    }

    let available = true;
    const result: Array<{kind: string, ordered: number, remaining: number, enough: boolean}> = [];

    if(slotByDay?.cakes) {
        for(const cake of slotByDay.cakes) { 
            const ordered = totalByCake.get(cake.id.toString());

            if(!ordered)
                continue;
            if(ordered.total > cake.remaining) {
                available = false;
                result.push({
                    kind: cake.kind,
                    ordered: ordered.total,
                    remaining: cake.remaining,
                    enough: false
                });
            }
            else{
                result.push({
                    kind: cake.kind,
                    ordered: ordered.total,
                    remaining: cake.remaining,
                    enough: true
                });
            }
        }
    }

    const handleSelectSlot = async (date: string) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/availability/slots?date=${date}`
            );
            const data: slotByDate = response.data;
            setSlotByDay(data);

            const violations: SlotViolation[] = [];
            for (const cake of data.cakes) {
                const ordered = totalByCake.get(cake.id.toString());
                const orderedQty = ordered?.total ?? 0;
                const productName = KIND_TO_PRODUCT_NAME[cake.kind] ?? cake.kind;
                violations.push({
                    kind: cake.kind,
                    productName,
                    ordered: orderedQty,
                    remaining: cake.remaining,
                    enough: orderedQty <= cake.remaining,
                });
            }

            const hasViolation = violations.some((v) => !v.enough);

            if (hasViolation) {
                setPendingDate(date);
                setWarningData({
                    date: formatDateShortVN(date),
                    violations,
                });
            } else {
                setWarningData(null);
                setPendingDate(null);
                setValue("receiveDate", date, { shouldValidate: true });
            }
        } catch (err) {
            console.error("Lỗi khi lấy slot theo ngày:", err);
        }
    };

    const handleGoBackToCart = () => {
        setWarningData(null);
        router.push("/");
    };

    const handleChooseAnotherDate = () => {
        setWarningData(null);
        setPendingDate(null);
    };

    const generateIdempotencyKey = async (payload: string) => { 
       const encoder = new TextEncoder();
       const data = encoder.encode(payload); //`Uint8Array`
       const hash = await crypto.subtle.digest("SHA-256", data);
       const hashHex = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

       return hashHex;
    } 
    //HandleNext
    const handleNext = async () => { 
        let isValid = false;
        setLoading(true);
        
        try {
            if (!shippingMethod) {
                setShippingMethodError(true);
                return;
            }
            
            if (shippingMethod === "DELIVERY") {
                isValid = await trigger([
                    "newAddress.houseNumber",
                    "newAddress.street",
                    "newAddress.ward",
                    "newAddress.district"
                ]);
            } else {
                isValid = true;
            }

            if(isValid) {
                if (cart.length === 0) {
                    toast.error("Giỏ hàng đang trống. Vui lòng chọn ít nhất một sản phẩm.");
                    return;
                }

                const data = getValues()
                if (!data.receiveDate) {
                    toast.error("Vui lòng chọn ngày nhận bánh");
                    return;
                }
                //set items value to formprovider
                const items = cart.map((c) => ({
                    cakeId: Number(c.productId),
                    date: data.receiveDate, 
                    quantity: c.quantity,
                }))

                console.log("Payload gửi lên BE:", { ...data, items });

                //generate key for order
                const phone = data.phone;
                const receiveDate = data.receiveDate; 
                const payload = JSON.stringify({phone, items, receiveDate, paymentMethod: data.paymentMethod })
                const key = await generateIdempotencyKey(payload);

                try{
                    const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/booking/create`, {...data, items}, {
                        headers: { 'x-idempotency-key': key },
                    });

                    console.log("Response từ BE:", response.data);

                    const { orderId } = response.data;
                    console.log("OrderId:", orderId);

                    if (data.paymentMethod === "CASH") {
                        console.log("Redirecting to CASH success page...");
                        router.push(`/payment/success?orderId=${orderId}&method=cash`);
                    } else if (data.paymentMethod === "BANK_TRANSFER") {
                        console.log("Redirecting to payment page...");
                        router.push(`/payment?orderId=${orderId}`);
                    }
                } catch(err :any){
                    console.error("Booking API error:", err);
                    
                    if (err.response?.status === 409) {
                        const message = err.response.data?.message || "";
                        const match = message.match(/Mã đơn:\s*(\d+)/);
                        
                        if (match) {
                            const existingOrderId = match[1];
                            const orderRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/booking/${existingOrderId}`); 
                            const existingOrder = orderRes.data; 

                            if (existingOrder.paymentMethod === "CASH") {
                                router.push(`/payment/success?orderId=${existingOrderId}&method=cash`);
                            } else if (data.paymentMethod === "BANK_TRANSFER") {
                                router.push(`/payment?orderId=${existingOrderId}`);
                            }
                            return;
                        }
                    }

                    toast.error(err.response?.data?.message || `Lỗi ${err.response?.status}: ${err.message}`);
                }
                
            }
        } catch(err: any) {
            console.error(err); 
        }finally{
            setLoading(false);
        }

    };

    return( 
        <div className="space-y-[3vh] text-[#3D2008]">
            <p className="mt-2 mb-1 font-semibold font-vollkorn
            text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]"
            >Phương thức nhận bánh</p>

             {/* shipping method */}
            <div>
                <div className="flex justify-between gap-[2vh]">
                    <div className="w-1/2 flex flex-col">
                        <label className={`flex w-full cursor-pointer  justify-between rounded-lg border-2 p-2 transition-colors duration-200 ${
                            shippingMethod === "PICKUP"
                                ? "bg-[#3D2008] text-white border-[#FDF6E8] ring-1 ring-[#3D2008]"
                                : "bg-white  border-[#3D2008]/25"
                        }`}>
                            <p>Đến lấy</p>
                            <input
                                type="radio"
                                value="PICKUP"
                                className="h-5 w-5"
                                {...register("shippingMethod")}
                            />
                        </label>
                
                    </div>
                    <div className="w-1/2 flex flex-col">
                        <label className={`flex w-full cursor-pointer  justify-between rounded-lg border-2 p-2 transition-colors duration-200 ${
                            shippingMethod === "DELIVERY"
                                ? "bg-[#3D2008] text-white border-[#FDF6E8] ring-1 ring-[#3D2008]"
                                : "bg-white  border-[#3D2008]/25"
                        }`}>
                            <p>Giao đến</p>
                            <input
                                type="radio"
                                value="DELIVERY"
                                className="h-5 w-5"
                                {...register("shippingMethod")}
                            />
                        </label>      
                    </div>
                
                </div>
                <AnimatePresence mode="wait">
                        {shippingMethod === "PICKUP" && (
                            <motion.div
                                key="pickup"
                                ref={pickupRef}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col gap-3 mt-3 p-4
                                border border-dashed border-[#3D2008] rounded-2xl bg-[#3D2008]/10">
                                    <h2 className="font-semibold font-vollkorn
                                     text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[18px]"
                                     >Thông tin địa điểm nhận bánh:</h2>
                                    <div className=" gap-[2vh] flex flex-col
                                    text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                                        <p className="[text-decoration-skip-ink:none] underline flex items-center gap-[0.3vw] "> 
                                        <MapPin size={20} /> 57/38/4, đường Dương Văn Cam, phường Linh Xuân, Tp.Thủ Đức</p>
                                        <div className="flex justify-between">
                                            <p className="flex items-center gap-[0.3vw]"> <Clock size={20}/>Từ 7:00 đến 13:00</p>
                                            <p className="flex items-center gap-[0.3vw]"> <Phone size={18} /> 033-871-0915</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {shippingMethod === "DELIVERY" && (
                                <motion.div
                                    key="delivery"
                                    ref={deliveryRef}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 mt-3 p-4 flex flex-col gap-2
                                       border border-dashed border-[#3D2008] rounded-2xl bg-[#3D2008]/10
                                       text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                                    >
                                        <h2 className="font-semibold font-vollkorn
                                        text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[18px]"
                                        >Vui lòng nhập địa chỉ nhận bánh</h2>
                                        <div className="flex gap-[1vw]">
                                            <input {...register("newAddress.houseNumber", {
                                                required: true,
                                            })} 
                                            placeholder="Số nhà*" 
                                            className={`w-1/2 border p-3 rounded-md ${
                                                 errors.newAddress?.houseNumber ?  "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                                            }
                                            `}/>
                                            
                                            <input {...register("newAddress.street", {
                                                required: true,
                                            })} 
                                            placeholder="Tên đường*" 
                                            className={`w-1/2 border p-3 rounded-md ${
                                                 errors.newAddress?.street ?  "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                                            }
                                            `}/>
                                        </div>
                                        <div className="flex gap-[1vw]">
                                            <input {...register("newAddress.ward", {
                                                required: true,
                                            })} 
                                            placeholder="Phường/Xã*" 
                                            className={`w-1/2 border p-3 rounded-md ${
                                                 errors.newAddress?.ward ?  "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                                            }
                                            `}/>

                                            <input {...register("newAddress.district", {
                                                required: true,
                                            })}
                                            placeholder="Quận/Huyện*" 
                                            className={`w-1/2 border p-3 rounded-md ${
                                                 errors.newAddress?.district ?  "border-[#E90000] focus:ring-[#E90000]" : "border-[#3D2008]/25"
                                            }
                                            `}/>
                                        </div>
                                        {(
                                        errors.newAddress?.houseNumber ||
                                        errors.newAddress?.street ||
                                        errors.newAddress?.ward ||
                                        errors.newAddress?.district
                                        ) && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <OctagonAlert size={18}/> Vui lòng nhập đầy đủ địa chỉ nhận bánh.
                                        </p>
                                        )}
                                    </div>
                                </motion.div> 
                            )}
                </AnimatePresence>
                {shippingMethodError && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <OctagonAlert size={18} />
                        Vui lòng chọn phương thức nhận bánh
                    </p>
                )}
            </div>

            {/* Cake pickup date  */}
            <div className="flex flex-col gap-1.5 max-h-[40vh]">
                <p className="font-semibold font-vollkorn
                    text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]">
                    Ngày nhận bánh
                </p>
                <div className="flex flex-wrap gap-2 overflow-y-auto pt-2">
                    {slots.map((slot) => (
                        <button
                            key={slot.date}
                            type="button"
                            onClick={() => handleSelectSlot(slot.date)}
                            className={`px-4 py-2 rounded-lg border-2 transition-colors duration-200 w-[7.5vw]
                                text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]
                                ${pendingDate === slot.date || slotByDay?.date === slot.date
                                    ? "bg-[#3D2008] text-white border-[#FDF6E8] ring-1 ring-[#3D2008]" 
                                    : "bg-white border-[#3D2008]/25 hover:border-[#3D2008]"
                                }`}
                        > <div className="flex flex-col font-medium">{formatDate(slot.date)} <span
                         className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px]">
                        {slot.totalBooked}/{slot.totalMax} đơn</span></div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
                <p className="font-semibold font-vollkorn
                    text-[17px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[21px] 2xl:text-[22px]">
                    Ghi chú cho đơn bánh
                </p>
                <textarea 
                placeholder="Thêm ghi chú cho đơn bánh..."
                className="border p-2 rounded-md h-[20vh] resize-none overflow-y-auto "
                />

            </div>

            <div className="flex items-center justify-end gap-[3vw]">
                <div>
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex items-center underline text-[#C01F1F] [text-decoration-skip-ink:none] font-semibold"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                        >Quay lại</span>
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => handleNext()}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#C01F1F] text-white py-3 px-6 rounded-lg"
                        >
                        {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        {loading ? "Đang xử lý..." : "Đặt hàng"}
                    </button>
                </div>
            </div>
            
            <SlotWarningModal
                open={warningData !== null}
                date={warningData?.date ?? ""}
                violations={warningData?.violations ?? []}
                onClose={handleChooseAnotherDate}
                onGoBack={handleGoBackToCart}
            />
        </div>
    );
}
