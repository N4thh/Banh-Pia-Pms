import { useState } from "react";
import { CircleMinus, CirclePlus, Minus, Plus } from "lucide-react";
import { addToCart } from "@/src/utils/cartUtils";

type ProductProps = {
    onCartUpdate?: () => void;  // propagate cart update to Header
};

const basePrice = 80000;

export default function Product({ onCartUpdate }: ProductProps) {
    const [quantity, setQuantity] = useState(0);
    const [saltedEgg, setSaltedEgg] = useState(0);
    const totalPrice = basePrice + saltedEgg * 5000;

    return(
        <div className="flex flex-col h-full gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4">
            <div className="flex flex-col items-center justify-center">
                <h1
                    className="font-vollkorn font-semibold text-[#FDF6E8] tracking-wide leading-tight relative
                    text-[clamp(28px,3vw,72px)]
                    [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)] text-center"
                >
                    Hương Vị Quen Thuộc
                </h1>

                <div
                    className="bg-[url('/landing2/Line.svg')] bg-contain bg-no-repeat bg-center "
                    style={{
                    width: "min(40vw, 518.4px)",
                    height: "min(3vw,76.8px)"
                    }}
                />

                <div className="flex flex-wrap justify-center w-full max-w-full gap-2 sm:gap-3 md:gap-4 pt-[1vh]  px-2">
                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.8vw,20.25px)] text-[#C01F1F] bg-[#FDF6E8] whitespace-nowrap"
                    > SẦU RIÊNG </div>

                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.9vw,20.25px)] text-[#FDF6E8] whitespace-nowrap"
                    > NGỌT THANH</div>

                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.9vw,20.25px)] text-[#C01F1F] bg-[#FDF6E8] whitespace-nowrap"
                    > ĐẬU XANH </div>

                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-7
                        font-semibold text-[clamp(11px,0.9vw,20.25px)] text-[#FDF6E8] whitespace-nowrap"
                    > BÙI</div>

                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.9vw,20.25px)] text-[#FDF6E8] whitespace-nowrap"
                    > BÉO NGẬY</div>
                </div>

            </div>

            {/* Product */}
            <div className="flex-1 w-full h-127 flex items-stretch justify-center min-h-0 mt-4">
                <div
                    className="border rounded-2xl p-1.5 sm:p-2 bg-[#FDF6E8] text-left overflow-hidden h-117
                    w-236.5 flex flex-row"
                >
                    {/* Picture */}
                    <div className="w-110.75 shrink-0 border border-[#D9D9D9] bg-[#D9D9D9] rounded-2xl" />

                    <div className="w-3/5 flex flex-col items-start justify-start p-2 sm:p-3 md:p-4">
                        <h1 className="font-vollkorn font-semibold text-[#3D2008] text-[clamp(14px,1.6vw,22px)] leading-tight">
                            Nhân Sầu Riêng
                        </h1>

                        <h2 className="text-[#C2973F] text-[clamp(11px,1.3vw,18px)] leading-snug mt-1">
                            Béo Ngậy, Thơm Nức Mũi, Đậm Đà Đến Miếng Cuối Cùng!
                        </h2>

                        {/* Chọn trứng muối */}
                        <p className="font-medium text-[#3D2008] text-[clamp(10px,1.5vw,15px)] mt-5">
                            Lựa chọn trứng muối
                        </p>
                        <div className="flex flex-col gap-2 mt-2 w-full">
                            {[
                                { value: 0, price: 0, label: "Không thêm trứng muối" },
                                { value: 1, price: 5000, label: "Thêm 1 trứng muối" },
                                { value: 2, price: 10000, label: "Thêm 2 trứng muối" },
                                { value: 3, price: 15000, label: "Thêm 3 trứng muối" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setSaltedEgg(opt.value)}
                                    className={`flex justify-between pl-4 pr-2 py-2 border rounded-full text-left text-[clamp(10px,2vw,14px)] transition-colors
                                    ${saltedEgg === opt.value
                                        ? "bg-[#C01F1F] text-[#FDF6E8] border-[#C01F1F]"
                                        : "border-[#3D2008]/25 text-[#3D2008] hover:border-[#3D2008]"}`}
                                >
                                    <span>{opt.label}</span>
                                    {opt.price > 0 && (
                                        <span className="pr-1">
                                            +{opt.price.toLocaleString("vi-VN")} đ/bánh
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Số lượng + thêm giỏ */}
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex items-center justify-between w-full mt-4 gap-2">
                                {/* Tổng tiền hiện tại */}
                                <p className="text-[#E5C980]/75 text-[20px] mt-1 self-end font-medium">
                                    {totalPrice.toLocaleString("vi-VN")} đ
                                    <span className="text-[12px] font-light relative -top-1 ml-1"> /bánh</span>
                                </p>
                                <div className="flex items-center justify-center gap-2 border rounded-2xl px-1 py-1 w-fit mt-[1vh] border-[#3D2008]">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((prev) => Math.max(0, prev - 1))}
                                        className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-white
                                        h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2"> 
                                        <Minus size={20} />
                                    </button>
                                    <span className="font-medium text-[#3D2008] min-w-6 text-center text-[clamp(13px,1.1vw,16px)]">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((prev) => prev + 1)}
                                        className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-white 
                                        h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
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
                                    onCartUpdate?.();
                                }}
                                className="flex-1 py-2.5 rounded-xl font-semibold border w-full border-[#C01F1F]
                                bg-[#C01F1F] text-[#FDF6E8]
                                text-[clamp(11px, 2vw, 14px)]
                                disabled:cursor-not-allowed
                                hover:bg-[#D62424] active:bg-[#A61B1B] disabled:bg-[#E08E8B] transition-colors"
                            >
                                Thêm vào giỏ hàng
                            </button>                                                       
                        </div>

                                               
                    </div>
                </div>
            </div>
        </div>
    );
}
