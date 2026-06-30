'use client'
import { useState } from "react";

export default function Guide() {
    return(
        <div className="flex flex-col h-full gap-4 sm:gap-12 md:gap-14 px-2 sm:px-4 border">
            <div className="flex flex-col items-center justify-center">
                <h1
                    className="font-vollkorn font-semibold text-[#FDF6E8] tracking-wide leading-tight relative pt-[2%] sm:pt-[4%]
                    text-[clamp(28px,3vw,72px)]
                    [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)] text-center"
                >
                    Hướng Dẫn Đặt Và Nhận Bánh
                </h1>

                <div
                    className="bg-[url('/landing2/Line.svg')] bg-contain bg-no-repeat bg-center "
                    style={{
                    width: "min(40vw, 518.4px)",
                    height: "min(3vw,76.8px)"
                    }}
                />

                <div className="flex flex-wrap justify-center w-full max-w-full gap-2 sm:gap-3 md:gap-4 pt-[1vh] px-2">
                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.8vw,20.25px)] text-[#C01F1F] bg-[#FDF6E8] whitespace-nowrap"
                    > NGÀY NHẬN BÁNH </div>

                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.8vw,20.25px)] text-[#FDF6E8] whitespace-nowrap"
                    > PHƯƠNG THỨC NHẬN BÁNH</div>
                    <div className="border border-amber-50 rounded-3xl inline-flex items-center justify-center
                        py-1 sm:py-1.5 px-3 sm:px-5 md:px-6
                        font-semibold text-[clamp(11px,0.8vw,20.25px)] text-[#FDF6E8] whitespace-nowrap"
                    > PHƯƠNG THỨC THANH TOÁN</div>

                </div>

            </div>
            {/* Product */}
            <div className="flex flex-1 w-full min-h-0 border rounded-2xl sm:p-2 md:p-4
                gap-3 sm:gap-2 md:gap-6 mb-4 sm:mb-6 md:mb-10 ">
                    <div className="border w-1/2 h-full">
                        
                    </div>

                    <div className="border w-1/2 ">
                        <ol className="list-upper-alpha pl-6">
                            <li className="flex gap-3 font-vollkorn font-semibold">
                                <span>O1.</span>
                                <span>Chọn Ngày Nhận Bánh</span>
                            </li>
                            <li className="flex gap-3 font-vollkorn font-semibold">
                                <span>O2.</span>
                                <span>Chọn Phương Thức Nhận Bánh</span>
                            </li>
                            <li className="flex gap-3 font-vollkorn font-semibold">
                                <span>O3.</span>
                                <span>Chọn Phương Thức Thanh Toán</span>
                            </li>                           
                        </ol>
                    </div>                    
            </div>
        </div>
    );
}
