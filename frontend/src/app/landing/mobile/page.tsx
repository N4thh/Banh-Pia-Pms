"use client";

import { useState } from "react";
import MobileHero from "./mb-Hero";
import MobileGuide from "./mobileGuide/mb-guideBG";
import MobileFooter from "./mb-Footer";
import MbProduct from "./mobileProduct/mb-ProductBG";
import MobileHeader from "@/src/components/mb-Header";

export default function MobileLandingPage() {
  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);

  function handleCartUpdate() {
    setCartRefreshTrigger((value) => value + 1);
  }

    return (
        <div className="relative w-full text-white overflow-x-hidden bg-[#630002]">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden 
            bg-[radial-gradient(ellipse_100vw_100vh_at_top,#F7EACC_0%,#CF0000_20%,#630002_150%)]
            pointer-events-none z-0">

                <div className="absolute inset-0 bg-[url('/landing1/Backgroundpattern.png')] 
                bg-repeat bg-size-[800_800px] opacity-20 mix-blend-overlay" />

                <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-2/5 bg-[url('/landing1/moon.png')] bg-contain bg-no-repeat z-20"
                style={{
                    width: "min(122vw, 805px)",
                    height: "min(122vw, 805px)",
                    top: "calc(min(42vw, 805px) / -2.5)",
                    filter: "brightness(1.02)",
                }}
                />

                <div
                className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[url('/landing1/cloud.png')] bg-contain bg-no-repeat"
                style={{
                    width: "min(300vw, 2415px)",
                    aspectRatio: "804 / 536",
                }}
                />
            </div>

            <div className="relative z-10 w-full flex flex-col">

                <div className="justify-center items-center w-[80vw]">
                    <MobileHeader cartRefreshTrigger={cartRefreshTrigger}
                    onCartUpdate={handleCartUpdate} />
                </div>
                <section>
                <MobileHero />
                </section>

                <section id="product" className="-mb-10">
                <MbProduct onCartUpdate={handleCartUpdate} />
                </section>

                 <section id="guide">
                <MobileGuide />
                </section> 

                <section className="-mt-3">
                <MobileFooter />
                </section> 

            </div>
        </div>
    );
}
