import Product from "./Product";
export default function ProductBG() {
  return (
    <section
      className=" relative h-[110vh] flex flex-col
        bg-[linear-gradient(#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
        style={{
          clipPath: "ellipse(180% 100% at 50% 100%)",
        }}
    >
      {/* Top */}
      <div className="flex-1 h-1/2 relative w-full" >

        <div className="absolute rounded-[50%] top-[25%] left-[6%]
          shadow-[inset_0_0_27.5px_0_#F7EACC,inset_0_0_109px_0_#F7EACC]
          bg-[radial-gradient(circle_20vw_at_65%_0%,#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
          style={{
            width: "min(16vw,173px)",
            height: "min(16vw, 173px)",
          }} />

        <div className="absolute rounded-[50%] top-[10%] right-[2%]
          shadow-[inset_0_0_27.5px_0_#F7EACC,inset_0_0_109px_0_#F7EACC]
          bg-[radial-gradient(circle_13vw_at_40%_20%,#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
          style={{
            width: "min(10.5vw,173px)",
            height: "min(10.5vw, 173px)",
          }} />

        <div className="absolute rounded-[50%] top-[40%] right-[13%]
          shadow-[inset_0_0_27.5px_0_#F7EACC,inset_0_0_109px_0_#F7EACC]
          bg-[radial-gradient(circle_9vw_at_40%_25%,#A01818_0%,#C01F1F_0%,#F7EACC_120%,#FDF6E8_100%)]"
          style={{
            width: "min(13.5vw,173px)",
            height: "min(13.5vw, 173px)",
          }} />

      </div>


      {/* Bottom */}
      <div className="flex-1 h-1/2 w-full">
        <svg
          viewBox="0 0 800 130"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs className="
          shadow-[inset_0_0_25px_0_#C01F1F_25%]"
          >
            <radialGradient id="waveFar" cx="40%" cy="10%"r="90%">
              <stop offset="0%" stopColor="#C01F1F" />
              <stop offset="32%" stopColor="#D8796C" />
              <stop offset="77%" stopColor="#F7EACC" />
              <stop offset="100%" stopColor="#FDF6E8" />
            </radialGradient>

            <radialGradient id="waveNear"cx="20%"cy="-2%"r="90%">
              <stop offset="0%" stopColor="#C01F1F" />
              <stop offset="35%" stopColor="#D8796C" />
              <stop offset="75%" stopColor="#F7EACC" />
              <stop offset="100%" stopColor="#FDF6E8" />
            </radialGradient>

          </defs>

          <path
            d="
              M0,70
              C100,30 180,80 280,60
              C380,35 500,80 620,55
              C700,35 760,70 800,50
              L800,200
              L0,200
              Z
            "
            fill="url(#waveFar)"
          />

          <path
            d="
              M0,110
              C120,70 220,130 340,95
              C460,60 560,140 680,100
              C740,80 780,100 800,90
              L800,200
              L0,200
              Z
            "
            fill="url(#waveNear)"
          />

        </svg>
      </div>

      {/* Product */}
      <div
        className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 z-10
          w-[88vw] sm:w-[85vw] md:w-[79.125vw]
          h-[clamp(420px,75vh,560px)] md:h-auto md:aspect-1124/444"
      >
        <Product />
      </div>
    </section>
  );
}
