import Hero from "@/src/components/landing/Hero";
import Product from "../components/landing/Product";
import Guide from "../components/landing/Guide";

export default function HomePage() {
  return (
    <div className="relative w-full text-white overflow-x-hidden min-h-screen
                    bg-[radial-gradient(ellipse_80vw_80vh_at_top,#F7EACC_0%,#CF0000_20%,#630002_150%)] bg-fixed">
      {/* Background pattern — fixed-size tile, intentional */}
      <div className="absolute inset-0 bg-[url('/landing1/Backgroundpattern.png')] bg-repeat bg-size-[800_800px] opacity-20 mix-blend-overlay pointer-events-none z-0" />

      <div
        className="absolute left-1/2 -translate-x-1/2
                    bg-[url('/landing1/moon.png')] bg-contain bg-no-repeat
                    opacity-100
                    pointer-events-none z-20"
        style={{
          width: "min(42vw, 805px)",
          height: "min(42vw, 805px)",
          top: "calc(min(42vw, 805px) / -2.5)",
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-1
        bg-[url('/landing1/cloud.png')] bg-contain bg-no-repeat
        opacity-100 pointer-events-none"
        style={{
          width: "min(126vw, 2415px)",
          aspectRatio: "804 / 536",
        }}
      />

      <div className="relative z-10 w-full flex flex-col">
        <Hero />
        <Product />
        <Guide />
      </div>

    </div>
  );
}
