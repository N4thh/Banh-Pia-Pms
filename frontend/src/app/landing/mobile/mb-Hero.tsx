const glowShadow = `
  drop-shadow(12px 10px 2px rgba(0,0,0,0.08))
  drop-shadow(8px 7px 4px rgba(0,0,0,0.12))
  drop-shadow(4px 4px 8px rgba(0,0,0,0.18))
  drop-shadow(0px 0px 6px rgba(247,234,204,0.45))
  brightness(1.15)
  saturate(1.1)
`;

export default function MobileHero() {
  return (
    <section className="relative flex min-h-[70vh] w-full flex-col items-center overflow-hidden mt-50">

      <div className="relative w-full h-[23vh] mt-6 ">
        <div
          className="absolute top-0 -right-[min(12vw,50px)] bg-[url('/landing1/Group118.svg')] bg-no-repeat bg-contain rotate-6"
          style={{
            width: "min(45vw, 250px)",
            height: "min(45vw, 250px)",
            filter: glowShadow,
          }}
        />

        <div
          className="absolute top-15 -left-[min(10vw,40px)] bg-[url('/landing1/Group118.svg')] bg-no-repeat bg-contain -rotate-24"
          style={{
            width: "min(35vw, 200px)",
            height: "min(35vw, 200px)",
            filter: glowShadow,
          }}
        />
      </div>      
      <div className="flex flex-col items-center z-10 px-4">
        <h1
          className="font-vollkorn font-bold text-center text-[#FDF6E8] tracking-wide leading-tight
          text-[clamp(28px,8vw,40px)]
          [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]"
        >
          Bánh Tròn Vị Ngọt,
          <br />
          Nối Trọn Yêu Thương.
        </h1>

        <div
          className="bg-[url('/landing1/Line.png')] bg-contain bg-no-repeat bg-center h-4 mt-3"
          style={{
            width: "min(60vw, 280px)",
          }}
        />

        <button className="border rounded-4xl bg-[#FDF6E8] text-[#C01F1F]
          py-2.5 px-7 font-bold mt-6 text-[15px]">
          Đặt bánh ngay
        </button>
      </div>

      {/* Decorative cakes: chỉ giữ 2 cái, đặt 2 góc chéo cho cân đối */}


    </section>
  );
}