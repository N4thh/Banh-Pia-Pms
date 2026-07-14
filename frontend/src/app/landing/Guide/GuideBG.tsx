import Guide from "./Guide"
export default function GuideBG() {
  return(
    <section
      className=" relative h-[110vh] w-full overflow-hidden
        bg-[linear-gradient(#C01F1F_0%,#F5E2C5_30%,#F5E2C5_75%,#C01F1F_100%)]"
        style={{
          clipPath: "ellipse(180% 100% at 50% 100%)",
        }}
    >
      {/* Circle */}
      <div className="absolute inset-0"> 
        {/* left */}
        <div className="absolute rounded-[50%] right-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 
          shadow-[inset_0_0_27.2px_0_#F7EACC,inset_0_0_250px_0_#F7EACC]
          bg-[radial-gradient(circle_120vw_at_50%_0%,#A01818_0%,#C01F1F_18%,#F7EACC_67%,#FDF6E8_100%)]"
          style={{
            width: "min(56.25vw,1620px)",
            height: "min(56.25vw, 1620px)",
          }} />
          
        {/* middle */}
        <div className="absolute rounded-[50%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          shadow-[inset_0_0_27.2px_0_#F7EACC,inset_0_0_250px_0_#F7EACC]
          bg-[radial-gradient(circle_80vw_at_50%_10%,#A01818_3%,#C01F1F_22%,#EDC6AD_61%,#F7EACC_80%,#FDF6E8_100%)]"
          style={{
            width: "min(66.25vw,1620px)",
            height: "min(66.25vw, 1620px)",
          }} />
          {/* right */}
        <div className="absolute rounded-[50%] left-1/2 top-1/2 translate-x-1/2 -translate-y-1/3 
          shadow-[inset_0_0_27.2px_0_#F7EACC,inset_0_0_250px_0_#F7EACC]
          bg-[radial-gradient(circle_120vw_at_50%_0%,#A01818_0%,#C01F1F_18%,#F7EACC_67%,#FDF6E8_100%)]"
          style={{
            width: "min(56.25vw,1620px)",
            height: "min(56.25vw, 1620px)",
          }} />
          {/* Clip path */}
          <div
            className="absolute rounded-[50%] right-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 z-3
            shadow-[inset_0_0_12px_0_#F7EACC,inset_0_0_42px_0_#F7EACC]
            bg-[radial-gradient(circle_100vw_at_50%_10%,#A01818_0%,#C01F1F_22%,#CB8172_67%,#F7EACC_85%)]"
            style={{
              width: "min(56.25vw,1620px)",
              height: "min(56.25vw, 1620px)",
              clipPath: "circle(58.89% at 150% 33.33%)",
            }}
          />
          <div
            className="absolute rounded-[50%] left-1/2 top-1/2 translate-x-1/2 -translate-y-1/3
            shadow-[inset_0_0_12px_0_#F7EACC,inset_0_0_42px_0_#F7EACC]
            bg-[radial-gradient(circle_100vw_at_50%_10%,#A01818_0%,#C01F1F_22%,#CB8172_67%,#F7EACC_85%)]
            "
            style={{
              width: "min(56.25vw,1620px)",
              height: "min(56.25vw, 1620px)",
              clipPath: "circle(58.89% at -50% 33.33%)"
            }}
          />
          <div
          className="absolute rounded-[50%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-3
          shadow-[inset_0_0_12px_0_#F7EACC,inset_0_0_42px_0_#F7EACC]"
          style={{
            width: "min(66.25vw,1620px)",
            height: "min(66.25vw, 1620px)",
            backgroundColor: "transparent", 
            clipPath: "circle(R% at X% Y%)", 
          }}
          />
      </div>


      <div
        className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-10
          w-[88vw] sm:w-[85vw] md:w-[79.125vw]
          h-[clamp(420px,80vh,560px)] md:h-auto md:aspect-1140/387"
      >
        <Guide />
      </div>
        
    </section>
  )
}