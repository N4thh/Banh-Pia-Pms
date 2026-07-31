import Guide from "./mb-guide"
export default function MobileGuideBG() {
  return(
    <section
      className=" relative h-[110vh] w-full overflow-hidden
        bg-[linear-gradient(#C01F1F_0%,#F5E2C5_30%,#F5E2C5_75%,#C01F1F_100%)]"
        style={{
          clipPath: "ellipse(250% 100% at 50% 100%)",
        }}
    >
      {/* Circle */}
      <div className="absolute inset-0"> 
        {/* middle */}
        <div className="absolute rounded-[50%] left-1/2 top-2/5 -translate-x-1/2 -translate-y-1/2
          shadow-[inset_0_0_27.2px_0_#F7EACC,inset_0_0_250px_0_#F7EACC]
          bg-[radial-gradient(circle_250vw_at_50%_10%,#A01818_3%,#C01F1F_22%,#EDC6AD_61%,#F7EACC_80%,#FDF6E8_100%)]"
          style={{
            width: "min(195vw,2620px)",
            height: "min(195vw, 2620px)",
          }} 
        />
      </div>


      <div
        className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-10
          w-[92vw] 
          h-[clamp(420px,80vh,560px)] md:h-auto md:aspect-1140/387"
      >
        <Guide />
      </div>
        
    </section>
  )
}