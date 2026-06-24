export default function Hero() {
  const glowShadow = `
    drop-shadow(19px 15px 2px rgba(0,0,0,0.01))
    drop-shadow(12px 8px 2px rgba(0,0,0,0.07))
    drop-shadow(7px 5px 6px rgba(0,0,0,0.23))
    drop-shadow(3px 2.5px 4px rgba(0,0,0,0.38))
    drop-shadow(1px 1px 2px rgba(0,0,0,0.44))
    drop-shadow(0px 0px 8.3px #F7EACC)
    brightness(1.15)
    saturate(1.1)
  `;

  return (
    <section className="flex min-h-screen w-full flex-col items-center overflow-hidden ">

      {/* moon + cake*/}
      <div className="relative h-[40vh] w-full top-0 overflow-hidden ">


        <div
          className="absolute bottom-0 right-10
          bg-[url('/landing1/Group117.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(9vw, 246px)",
            height: "min(9vw, 246px)",
            filter: glowShadow,
          }}
        />
      </div>


      <div className="relative w-full h-[60vh] overflow-hidden  ">

        <div className="flex flex-col justify-center items-center">
          <h1
            className="font-serif font-bold text-center text-[#FDF6E8] tracking-wide leading-tight z-10 relative pt-[12vh]
            text-[32px]
            sm:text-[40px]
            md:text-[48px]
            lg:text-[54px]
            xl:text-[60px]
            [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]"
          >
            Bánh Tròn Vị Ngọt,
            <br />
            Gói Trọn Yêu Thương.
          </h1>
          <div className="bg-[url('/landing1/Line.png')] bg-contain bg-no-repeat bg-center h-5 mt-2"
          style={{
            width: "min(32vw, 40vw)"

          }} />
          <button className="border rounded-4xl bg-[#FDF6E8] text-[#C01F1F] 
          py-3 px-8 font-bold mt-8 text-[14px] sm:text-[15px] md:text-[16px]">
            Đặt bánh ngay
          </button>
        </div>    
        
            {/* cake */}
        <div
          className="absolute top-0 right-35 bg-[url('/landing1/Group118.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(13vw, 369px)",
            height: "min(13vw, 369px)",
            filter: glowShadow,
          }}
        />    
        <div
          className="absolute bottom-30 right-0 bg-[url('/landing1/Group119.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(11vw, 369px)",
            height: "min(11vw, 369px)",
            filter: glowShadow,
          }}
        />
        <div
          className="absolute top-0 left-15 bg-[url('/landing1/Group118.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(13vw, 369px)",
            height: "min(14vw, 369px)",
            filter: glowShadow,
          }}
        />
        <div
          className="absolute bottom-30 left-0 bg-[url('/landing1/Group119.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(10vw, 369px)",
            height: "min(10vw, 369px)",
            filter: glowShadow,
          }}
        />


      </div>

    </section>
  );
}