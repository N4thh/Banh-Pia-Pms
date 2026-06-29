/*
  ============================================================================
  RESPONSIVE STRATEGY (desktop-only)
  ============================================================================
  Design baseline = 1920px (24" monitor).

  Every size uses one of two forms:

    (A) Pure decoration :  min(Xvw, design_px)
        → ties the element's rendered size to a SINGLE axis (viewport width).
        → the cap equals the value the element has at 1920px.

    (B) Typography       :  clamp(min_px, Xvw, max_px)
        → same scaling rule but with a floor & ceiling for readability.

  Every POSITION that an element depends on (right-*, left-*, bottom-*) is
  also expressed in vw (with the same cap) so the gap vs. size stays constant
  when the viewport changes.

  At 1920px width the design values are:
    top cake (40vh band)   :  9vw = 172.8 → cap 173px   | right  2vw =  38.4 → cap  40px
    right-top cake         : 13vw = 249.6 → cap 250px   | right  7.3vw= 140.16→ cap 140px
    right-bottom cake      : 11vw = 211.2 → cap 212px   | bottom 6.25vw=120  → cap 120px
    left-top cake          : 13vw = 249.6 → cap 250px   | left   3vw =  57.6 → cap  60px
    left-bottom cake       : 10vw = 192   → cap 192px   | bottom 6.25vw=120  → cap 120px
    divider line width     : 40vw = 768   → cap 768px
    heading font           : 3.125vw at 1920 = 60px     → clamp(60px, 3.125vw, 96px)
    button font            : 0.85vw at 1920 ≈ 16.3px    → clamp(16px, 0.85vw, 22px)
  ============================================================================
*/

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
    <section className="flex min-h-screen w-full flex-col items-center overflow-hidden">


      <div className="relative h-[40vh] w-full top-0 overflow-hidden">
        <div
          className="absolute bottom-0 right-[min(2vw,40px)]
          bg-[url('/landing1/Group117.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(9vw, 173px)",
            height: "min(9vw, 173px)",
            filter: glowShadow,
          }}
        />
      </div>

      <div className="relative w-full h-[60vh] overflow-hidden">

        {/* Title block, centered horizontally */}
        <div className="flex flex-col items-center">

          <h1
            className="font-serif font-bold text-center text-[#FDF6E8] tracking-wide leading-tight z-10 relative pt-[5%]
            text-[clamp(60px,3.125vw,96px)]
            [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]"
          >
            Bánh Tròn Vị Ngọt,
            <br />
            Gói Trọn Yêu Thương.
          </h1>

          <div
            className="bg-[url('/landing1/Line.png')] bg-contain bg-no-repeat bg-center h-5 mt-2"
            style={{
              width: "min(40vw, 768px)",
            }}
          />

          <button className="border rounded-4xl bg-[#FDF6E8] text-[#C01F1F]
            py-3 px-8 font-bold mt-8 text-[clamp(16px,0.85vw,22px)]">
            Đặt bánh ngay
          </button>
        </div>

        <div
          className="absolute top-0 right-[min(7.3vw,140px)] bg-[url('/landing1/Group118.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(13vw, 250px)",
            height: "min(13vw, 250px)",
            filter: glowShadow,
          }}
        />

        <div
          className="absolute bottom-[min(6.25vw,120px)] right-0 bg-[url('/landing1/Group119.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(11vw, 212px)",
            height: "min(11vw, 212px)",
            filter: glowShadow,
          }}
        />
        {/* left cake */}
        <div
          className="absolute top-0 left-[min(3vw,60px)] bg-[url('/landing1/Group118.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(13vw, 250px)",
            height: "min(13vw, 250px)",
            filter: glowShadow,
          }}
        />

        <div
          className="absolute bottom-[min(6.25vw,120px)] left-0 bg-[url('/landing1/Group119.png')] bg-no-repeat bg-contain"
          style={{
            width: "min(10vw, 192px)",
            height: "min(10vw, 192px)",
            filter: glowShadow,
          }}
        />

      </div>
    </section>
  );
}
