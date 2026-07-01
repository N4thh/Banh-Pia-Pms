'use client'
import { useState } from "react";

const items = [ 
    {
        title: "Chọn Ngày Nhận Bánh",
        content: (
            <>
                <ul className="list-disc pl-5">
                    <li>Để đảm bảo chất lượng, mỗi ngày chúng tôi chỉ nhận 50 đơn bánh.</li>
                    <li>Thời gian nhận bánh từ ngày 01/09 đến ngày 31/10</li>
                </ul>           
            </>

        )
    }, 
    {
        title: "Chọn Phương Thức Nhận Bánh",
        content: (
            <>
                <p>Bạn có thể chọn một trong hai hình thức nhận bánh:</p>
                <ul className="list-disc pl-5">
                    <li><strong>Đến lấy tại nhà:</strong> Nhận bánh theo ngày đã đặt trước đó</li>
                    <li><strong>Giao hàng: </strong>Chúng tôi sẽ giao đến địa chỉ bạn đã cung cấp. Phí giao hàng sẽ được tính theo khu vực</li>
                </ul>            
            </>
        )
    }, 
    { 
        title: "Chọn Phương Thức Thanh Toán", 
        content: (
            <>
                <p>Bạn có thể chọn một trong hai hình thức thanh toán sau:</p>
                <ul className="list-disc pl-5">
                    <li><strong>Chuyển khoảng:</strong> Thanh toán qua tài khoảng ngân hàng. Thông tin chuyển khoản sẽ được cung cấp sau khi đặt hàng</li>
                    <li><strong>Tiền mặt:</strong> Thanh toán khi nhận bánh tại nhà hoặc khi đơn vị vận chuyển giao hàng</li>
                </ul>
            </>
        )
    }
]

export default function Guide() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null); 

    return(
        <div className="flex flex-col w-full min-h-full gap-4 sm:gap-12 md:gap-14 px-2 sm:px-4">
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
            {/* Guide */}
            <div className="flex flex-col md:flex-row w-full border rounded-2xl bg-[#FDF6E8]
                p-3 sm:p-2 md:p-4
                gap-4 md:gap-3 lg:gap-6 mb-4 sm:mb-6 md:mb-10">
                    <div className="hidden md:block w-1/2 h-[40vh]">

                    </div>

                    <div className="w-full md:w-1/2 min-w-0">
                        <ol> 
                            {items.map((item, index) => { 
                                const isOpen = activeIndex === index;
                                return (
                                    <li key={index} className="border-b last:border-b-0 border-[#C2973F]">
                                        {/* title + button */}
                                        <div className="flex items-center justify-between gap-2 sm:gap-3 font-vollkorn font-semibold py-3 text-[#3D2008]">
                                            <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 leading-snug min-w-0 flex-1
                                                text-[14px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[22px] 2xl:text-[25px]">
                                                <span className="shrink-0">0{index +1}</span>
                                                <span className="wrap-break-word">{item.title}</span>
                                            </div>

                                            <button
                                                onClick={() => setActiveIndex(isOpen ? null : index)}
                                                className={`w-4 h-4 rounded-full border shrink-0 transition-colors duration-300
                                                    ${isOpen ? "bg-[#3D2008]" : "bg-transparent"}`}
                                            />
                                        </div>

                                        <div className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                                        style={{
                                            gridTemplateRows: isOpen ? "1fr" : "0fr"
                                        }}>
                                            <div className="overflow-hidden">
                                                <div className="pb-4 text-muted-foreground space-y-1 leading-relaxed
                                                text-[#C2973F]
                                                text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[17px] 2xl:text-[20px]">
                                                    {item.content}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}

                        </ol>
                    </div>                    
            </div>
        </div>
    );
}
