import { Clock, MapPin, Phone, Sparkles, UserRound } from "lucide-react";
export default function MobileFooter(){ 
    return (
        <section
        className=" relative h-[25vh] w-full overflow-hidden flex justify-center items-center
            bg-[radial-gradient(ellipse_180vw_45vh_at_top,#A01818_3%,#C01F1F_22%,#EDC6AD_61%,#F7EACC_80%,#FDF6E8_100%)]"
            style={{
            clipPath: "ellipse(150% 100% at 50% 100%)",
            }}
        >
            <div className="flex flex-col gap-2 h-3/5 w-4/5 font-semibold">
                {/* top */}
                <div className="flex flex-col justify-center items-center gap-3">
                    <p className="flex gap-2 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F] text-xs">
                    <Clock size={18} />
                    TỪ 7:00 ĐẾN 13:00</p>

                    <p className="flex gap-2 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F] text-xs">
                    <MapPin size={18} />
                    57/38/4, ĐƯỜNG DƯƠNG VĂN CAM, PHƯỜNG LINH XUÂN, TP THỦ ĐỨC</p>

                    
                </div>

                <div className="flex justify-center items-center gap-2">
                    <p className="flex gap-2 items-center
                    border border-[#C01F1F] rounded-xl px-6 py-3 bg-[#C01F1F] text-xs">
                    <Phone size={18} />
                    033-871-0915</p>
                    
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