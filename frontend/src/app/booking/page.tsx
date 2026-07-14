import Header from "@/src/components/Header";
import BoookingInfo from "./booking-info";

export default function Booking() {
    return(
        <div className="relative h-screen overflow-hidden">
            {/* Header */}
            <div className="w-[80vw] mx-auto">
                <Header />
            </div>

            {/* Right background */}
            <div className="absolute right-0 top-0 h-full w-[30vw] -z-10 overflow-hidden
            bg-[radial-gradient(ellipse_80vw_80vh_at_top,#A01818_0%,#C01F1F_16%,#F7EACC_77%,#FDF6E8_100%)]
            " >
                <div className="absolute rounded-[50%] top-[10%] right-[-10%]
                shadow-[inset_0_0_11.1px_0_#F7EACC,inset_0_0_50.4px_0_#F7EACC,0_0_3.1px_0_#F7EACC,0_0_23.8px_0_#F7EACC]
                bg-[radial-gradient(circle_20vw_at_left,#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
                style={{
                    width: "min(11.5vw,173px)",
                    height: "min(11.5vw, 173px)",
                }} />
                <div className="absolute rounded-[50%] bottom-[-5%] right-[-5%]
                shadow-[inset_0_0_16px_0_#F7EACC,inset_0_0_96.5px_0_#F7EACC,0_0_8.3px_0_#F7EACC,0_0_36.8px_0_#F7EACC]
                bg-[radial-gradient(circle_35vw_at_top,#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
                style={{
                    width: "min(16.5vw,273px)",
                    height: "min(16.5vw, 273px)",
                }} />
            </div>

            {/* BookingInfo */}
            <div
                className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 
                        w-[88vw] sm:w-[85vw] md:w-[79.125vw]
                        h-[clamp(420px,75vh,560px)] md:h-auto"
            >
                <BoookingInfo />
            </div>
        </div>
      
    );
}