'use client'
import { useState } from "react";
import Saurieng from "./Saurieng";
import Dauxanh from "./Dauxanh";

type ProductProps = {
    onCartUpdate?: () => void;  // propagate cart update to Header
};

export default function Product({ onCartUpdate }: ProductProps) {
    const [openDauxanh, setOpenDauxanh] = useState(false);
    const [openSaurieng, setOpenSaurieng] = useState(false);

    return(
        <div className="flex flex-col h-full gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4">
            <div className="flex flex-col items-center justify-center">
                <h1
                    className="font-vollkorn font-semibold text-[#FDF6E8] tracking-wide leading-tight relative pt-[2%] sm:pt-[4%]
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
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-7
                        font-semibold text-[clamp(11px,0.9vw,20.25px)] text-[#FDF6E8] whitespace-nowrap"
                    > BÙI</div>

                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.9vw,20.25px)] text-[#FDF6E8] whitespace-nowrap"
                    > BÉO NGẬY</div>
                </div>

            </div>
            {/* Product */}
            <div className="flex flex-col md:flex-row flex-1 w-full gap-3 sm:gap-5 md:gap-10 min-h-0 sm:pt-[2vh]">

                <button
                    type="button"
                    onClick={() => setOpenDauxanh(true)}
                    className="flex flex-row md:flex-row w-full md:w-1/2 border rounded-2xl p-1.5 sm:p-2 bg-[#FDF6E8] text-left overflow-hidden"
                >
                    <div className="w-2/5 sm:w-1/2 shrink-0">
                    </div>

                    <div className="w-3/5 sm:w-1/2 flex flex-col items-start justify-start p-2 sm:p-3 md:p-4 min-w-0">
                        <h1 className="font-vollkorn font-semibold text-[#3D2008] text-[clamp(14px,1.6vw,22px)] leading-tight">
                            Nhân Đậu Xanh
                        </h1>

                        <h2 className="text-[#C2973F] text-[clamp(11px,1.3vw,18px)] leading-snug mt-1 ">
                            Mịn Màng, Ngọt Thanh, Dịu Nhẹ, Vừa Quen Thuộc, Vừa Ấm Lòng.
                        </h2>

                        <div className="flex items-end mt-auto pt-2">
                            <h1 className="text-[#3D2008] text-[clamp(16px,1.5vw,28px)] font-medium leading-none">70.000đ</h1>
                            <h2 className="text-[#3D2008] text-[clamp(10px,1vw,14px)] ml-1 leading-none">/bánh</h2>
                        </div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setOpenSaurieng(true)}
                    className="flex flex-row md:flex-row w-full md:w-1/2 border rounded-2xl p-1.5 sm:p-2 bg-[#FDF6E8] text-left overflow-hidden"
                >
                    <div className="w-2/5 sm:w-1/2 shrink-0"></div>
                    <div className=" w-3/5 sm:w-1/2 flex flex-col items-start justify-start p-2 sm:p-3 md:p-4 min-w-0">
                        <h1 className="font-vollkorn font-semibold text-[#3D2008] text-[clamp(14px,1.6vw,22px)] leading-tight">
                            Nhân Sầu Riêng
                        </h1>

                        <h2 className="text-[#C2973F] text-[clamp(11px,1.3vw,18px)] leading-snug mt-1">
                            Béo Ngậy, Thơm Nức Mũi, Đậm Đà Đến Miếng Cuối Cùng!
                        </h2>

                        <div className="flex items-end mt-auto pt-2">
                            <h1 className="text-[#3D2008] text-[clamp(16px,1.5vw,28px)] font-medium leading-none">70.000đ</h1>
                            <h2 className="text-[#3D2008] text-[clamp(10px,1vw,14px)] ml-1 leading-none">/bánh</h2>
                        </div>
                    </div>
                </button>

            </div>

            <Dauxanh open={openDauxanh} onClose={() => setOpenDauxanh(false)} onAddToCart={onCartUpdate ?? (() => {})} />
            <Saurieng open={openSaurieng} onClose={() => setOpenSaurieng(false)} onAddToCart={onCartUpdate ?? (() => {})} />
        </div>
    );
}
