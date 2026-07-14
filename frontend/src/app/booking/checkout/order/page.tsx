"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutFormValues } from "../types";
import { useFormContext } from "react-hook-form";
import { useCheckoutStep } from "../layout";
import { useEffect, useRef, useState } from "react";
import { Clock, MapPin, OctagonAlert, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartItem, getCart } from "@/src/utils/cartUtils";
import axios from "axios";

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
    // ── All hooks MUST be declared before any conditional return ──
    const {step, setStep} = useCheckoutStep(); 
    const { register, watch, trigger, formState: { errors } } = useFormContext<CheckoutFormValues>(); 
    const shippingMethod = watch("shippingMethod");
    const router = useRouter();
    const pickupRef = useRef<HTMLHeadingElement>(null);
    const deliveryRef = useRef<HTMLHeadingElement>(null);
    const [slots, setSlots] = useState<slot[]>([]);
    const [slotByDay, setSlotByDay] = useState<slotByDate | null>(null); 
    const [shippingMethodError, setShippingMethodError] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]); 

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
                block: "start",
            });
        }
        if(shippingMethod === "DELIVERY") { 
            deliveryRef.current?.scrollIntoView({
                behavior: "smooth", 
                block: "start",
            });
        }
    }, [shippingMethod]);

    // ── Conditional return AFTER all hooks ──
    if(step === 1) return null;

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
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/availability/slots?date=${date}`
        ); 
        setSlotByDay(response.data); 
    };

    const handleNext = async () => { 
        let isValid = false;
        
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
            console.log("All valid!");
        }
    };

    return(
       
        <div className="space-y-[2vh] text-[#3D2008]">
            <p className="mt-6 mb-2 font-semibold font-vollkorn
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
                                <div className="flex flex-col gap-[2vh] mt-[2vh] p-[3vh]
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
                                    <div className="space-y-2 mt-[2vh] p-[3vh] flex flex-col gap-[1vh]
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
            <div>
                {slots.map((slot) => (
                <div key={slot.date}>
                    <input
                        type="radio"
                        value={slot.date}
                        onChange={() => handleSelectSlot(slot.date)}
                    />

                    <p>{slot.date}</p>
                </div>
                ))}
               
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className=""
                    >
                        Quay lại 
                    </button>
                </div>
                <div className="flex">
                    <button className="ml-auto inset-0 border py-3 px-6 rounded-lg
                    text-[#FDF6E8] font-semibold bg-[#C01F1F]"
                    type="button"
                    onClick={() => {handleNext()}}>Tiếp tục</button>
                </div>
            </div>
        </div>

        
        
        
    );
}