import { Clock, MapPin, Phone, Sparkles, UserRound } from "lucide-react";
export default function Footer(){ 
    return (
        <section
        className=" relative h-[25vh] w-full overflow-hidden flex justify-center items-center
            bg-[radial-gradient(ellipse_95vw_40vh_at_top,#A01818_3%,#C01F1F_22%,#EDC6AD_61%,#F7EACC_80%,#FDF6E8_100%)]"
            style={{
            clipPath: "ellipse(180% 100% at 50% 100%)",
            }}
        >
            <div className="flex flex-col gap-2 h-1/2 w-2/3 font-semibold">
                {/* top */}
                <div className="flex justify-center items-center gap-3">
                    <p className="flex gap-2 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F]
                    text-[clamp(10.5px,0.8vw,16px)]">
                    <Clock size={18} />
                    TỪ 8:00 ĐẾN 19:00</p>

                    <p className="flex gap-2 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F]
                    text-[clamp(10.5px,0.8vw,16px)]">
                    <MapPin size={18} />
                    57/38/4, ĐƯỜNG DƯƠNG VĂN CAM, PHƯỜNG LINH XUÂN, TP THỦ ĐỨC</p>

                    <p className="flex gap-2 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F]
                    text-[clamp(10.5px,0.8vw,16px)]">
                    <Phone size={18} />
                    033-871-0915</p>
                </div>

                <div className="flex justify-center items-center gap-2">
                    <p className="flex gap-2 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F]
                    text-[clamp(10.5px,0.8vw,16px)]">
                    <Sparkles size={18} />
                    BÁNH PÍA</p>

                    <p className="flex gap-1 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F]
                    text-[clamp(10.5px,0.8vw,16px)]">
                    <UserRound size={18} />
                    CÔ LOAN</p>
                </div>
            </div>
        </section>
    );
}