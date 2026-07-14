
import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { CircleMinus, CirclePlus } from "lucide-react";
import { addToCart } from "../../../utils/cartUtils";

type SauriengProps = {
    open: boolean;
    onClose: () => void;
    onAddToCart: () => void;  
};

export default function Saurieng({ open, onClose, onAddToCart }: SauriengProps) {
    const [quantity, setQuantity] = useState(0);
    const [saltedEgg, setSaltedEgg] = useState(0);
    const basePrice = 70000; 
    const totalPrice = basePrice + saltedEgg * 10000;

    useEffect(() => {
        if(!open) 
          setQuantity(0)
    },[open]);
    
    return (
        <Modal
            open={open}
            onClose={onClose}
            panelClassName="rounded-2xl w-full max-w-[60vw] max-h-[90vh] h-auto
            bg-[radial-gradient(ellipse_50vw_90vh_at_top,#A01818_0%,#C01F1F_38%,#EDC6AD_100%)]
            shadow-[0_0_8.3px_0_#F7EACC,0_0_36.8px_0_#F7EACC,inset_0_0_27.5px_0_#F7EACC,inset_0_0_109px_0_#F7EACC]
            "
        >
            <div className="flex flex-col md:flex-row h-full md:h-[70vh] gap-3 md:gap-5 p-2 md:p-4">
                {/* image */}
                <div className="w-full md:w-1/2 h-[25vh] md:h-full border border-[#D9D9D9] bg-[#D9D9D9] rounded-2xl shrink-0">
                </div>

                <div className="w-full md:w-1/2 text-[#FDF6E8] flex flex-col gap-3 md:gap-4 min-h-0 flex-1 overflow-hidden py-2">
                    {/* top */}
                    <div className="shrink-0">
                        <h2 className="font-vollkorn font-semibold
                            text-[14px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[22px] 2xl:text-[25px]">
                            Bánh Pía Nhân Sầu Riêng
                        </h2>
                        <p className="mb-4
                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[17px] 2xl:text-[20px]">
                            Béo Ngậy, Thơm Nức Mũi, Đậm Đà Đến Miếng Cuối Cùng!
                        </p>
                    </div>
                    {/* mid */}
                    <div className="flex flex-col gap-2 font-medium flex-1 min-h-0 overflow-y-auto pr-1">
                        <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[15px] 2xl:text-[16px] shrink-0">
                        Lựa chọn trứng muối</p>
                        <button className={`w-full flex justify-between items-center px-4 py-2 border rounded-2xl
                        text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] shrink-0
                        transition-all duration-200
                        ${
                            saltedEgg === 0 ? "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                        }`}
                        onClick={() => setSaltedEgg(0)}>
                        Không thêm trứng muối</button>

                        <button className= {`w-full flex justify-between items-center  px-4 py-2 border rounded-2xl
                        text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] shrink-0
                        transition-all duration-200
                        ${
                            saltedEgg === 1 ?  "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                        }`}
                        onClick={() => setSaltedEgg(1)}>
                        Thêm 1 trứng muối <span>+10.000đ /bánh</span></button>

                        <button className={`w-full flex justify-between items-center  px-4 py-2 border rounded-2xl
                        text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] shrink-0
                        transition-all duration-200
                        ${
                            saltedEgg === 2 ? "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                        }`}
                        onClick={() => setSaltedEgg(2)}>
                        Thêm 2 trứng muối <span>+20.000đ /bánh</span></button>

                        <button className={`w-full flex justify-between items-center  px-4 py-2 border rounded-2xl
                        text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] shrink-0
                        transition-all duration-200
                        ${
                            saltedEgg === 3 ? "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                        }`}
                        onClick={() => setSaltedEgg(3)}>
                        Thêm 3 trứng muối <span>+30.000đ /bánh</span></button>

                    </div>
                    {/* bot */}
                    <div className="flex flex-col gap-2 shrink-0 pt-2 border-t border-[#F7EACC]/30">
                        <div className="flex items-center justify-between">
                            <p>
                                <span className=" font-semibold
                                    text-[13px] sm:text-[14px] md:text-[17px] lg:text-[19px] xl:text-[21px] 2xl:text-[24px]
                                    transition-all duration-200">
                                    {totalPrice.toLocaleString("vi-VN")}đ</span>
                                <span className="font-light text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]">
                                /bánh</span>
                            </p>
                            <div className="flex items-center justify-center gap-2 border rounded-2xl p-1
                                bg-[radial-gradient(ellipse_3.5vw_50vh,#A01818_0%,#C01F1F_38%,#EDC6AD_100%)]">
                                <button
                                type="button"
                                onClick={() => setQuantity((prev) => Math.max(0,prev - 1))}
                                className="transition-all duration-150 hover:scale-90
                                focus-visible:outline-none focus-visible:ring-2"> <CircleMinus />
                                </button>

                                <span className="font-medium">{quantity}</span>

                                <button
                                type="button"
                                className="transition-all duration-150 hover:scale-90
                                focus-visible:outline-none focus-visible:ring-2"
                                onClick={() => setQuantity((prev) => prev + 1)}
                                > <CirclePlus />
                                </button>

                            </div>
                        </div>
                        {/* submit */}
                        <button
                            type="button"
                            disabled={quantity === 0}
                            onClick={() => {
                                addToCart({
                                    productId: '2',
                                    productName: 'Bánh Pía Nhân Sầu Riêng',
                                    saltedEgg,
                                    quantity,
                                    unitPrice: totalPrice,
                                });
                                setQuantity(0);
                                setSaltedEgg(0);
                                onAddToCart();
                                onClose();
                            }}
                            className="w-full rounded-2xl py-2 font-semibold border border-[#F7EACC]
                            bg-[#C01F1F] text-[#FDF6E8]
                            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] 2xl:text-[18px]
                            disabled:cursor-not-allowed
                            hover:bg-[#D62424] active:bg-[#A61B1B] disabled:bg-[#E08E8B] transition-colors"
                        >
                            Thêm vào giỏ hàng
                        </button>
                    </div>

                </div>
            </div>

        </Modal>
    );
}
