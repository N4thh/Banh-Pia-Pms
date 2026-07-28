import MbProduct from "./mb-Product";

type ProductBGProps = {
    onCartUpdate?: () => void;
};

export default function MobileProductBG({ onCartUpdate }: ProductBGProps) {
  return (
    <section
      className=" relative h-screen flex flex-col
        bg-[linear-gradient(#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
        style={{
          clipPath: "ellipse(250% 100% at 50% 100%)",
        }}
    >
      {/* Top */}
      <div className="flex-1 h-1/2 relative w-full" >
        <div className="absolute rounded-[50%] top-[30%] left-[-20%]
        shadow-[inset_0_0_19.61px_0_#F7EACC,inset_0_0_77.71px_0_#F7EACC]
        bg-[radial-gradient(circle_40vw_at_40%_30%,#A01818_0%,#C01F1F_16%,#F7EACC_67%,#FDF6E8_100%)]"
        style={{
            width: "min(45vw, 180px)",
            height: "min(45vw, 180px)",
        }} />
      </div>


      {/* Bottom */}
    <div className="relative w-full h-45 overflow-hidden">
      {/* Background Wave */}
      <svg
        viewBox="0 0 1486 582"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g filter="url(#filter0_bg)">
          <path
            d="M1486 101.644V101.772L1485.93 106.947L1479.56 582H0V163.903L2.07236 163.818C0.91107 157.051 0.211728 150.225 0 143.384L30.354 130.032C54.8888 127.822 71.9424 109.508 86.8917 93.2109C101.841 76.9196 121.602 59.6326 146.233 60.9636C197.978 63.748 205.235 140.094 256.909 143.709C289.81 146.009 314.441 115.327 347.4 113.692C375.771 112.276 398.869 132.566 426.541 137.927C442.876 141.089 458.64 138.933 474.205 134.344C512.002 123.206 548.599 97.715 589.302 99.1418C627.214 100.478 658.915 125.016 696.539 129.111C730.96 132.864 764.638 118.91 792.862 102.134C798.732 98.6467 804.5 94.9998 810.236 91.3209C832.063 77.3029 853.442 62.6726 878.502 53.2811C921.143 37.2879 972.144 39.9073 1013.76 57.322C1045.81 70.7384 1080.87 78.5221 1116.75 79.3952C1130.14 79.72 1143.45 79.4058 1156.45 77.3295C1221.9 66.8945 1268.07 14.2777 1333.14 2.27741C1387.48 -7.74231 1448.22 16.1411 1473.28 57.3859C1481.48 70.8822 1485.62 85.8213 1485.98 100.877C1485.99 101.128 1485.99 101.383 1486 101.633V101.644Z"
            fill="url(#paint0_bg)"
          />
        </g>

        <defs>
          <filter
            id="filter0_bg"
            x="0"
            y="0"
            width="1486"
            height="582"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feGaussianBlur stdDeviation="12.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.752941 0 0 0 0 0.121569 0 0 0 0 0.121569 0 0 0 0.5 0"
            />
            <feBlend in2="shape" result="effect1_innerShadow" />
          </filter>

          <radialGradient
            id="paint0_bg"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(756 -127) rotate(90) scale(460 2981.42)"
          >
            <stop stopColor="#C01F1F" />
            <stop offset="0.322432" stopColor="#D8796C" />
            <stop offset="0.769231" stopColor="#F7EACC" />
            <stop offset="1" stopColor="#FDF6E8" />
          </radialGradient>
        </defs>
      </svg>

      {/* Foreground Wave */}
      <svg
        viewBox="0 0 1521 327"
        className="absolute bottom-0 left-0 w-full h-30"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_fg)">
          <path
            d="M191.877 97.5131C209.884 109.695 228.232 122.704 251.052 127.914C299.622 139.013 348.416 111.742 398.819 108.401C450.665 104.964 498.988 126.905 544.752 146.372C590.516 165.84 643.029 184.007 693.034 172.698C735.427 163.109 766.381 134.213 806.911 120.52C874.589 97.6556 953.481 121.051 1025.81 110.117C1124.15 95.2557 1193.54 20.3278 1291.28 3.24323C1372.93 -11.0252 1464.21 22.9842 1501.87 81.7112C1539.53 140.438 1520.05 218.376 1456.91 261.518C1395.79 303.291 1308.86 310.001 1228.04 314.02C1067.12 322.018 905.912 326.966 744.662 327C584.564 327.034 424.459 322.223 264.833 312.577C212.849 309.436 159.988 305.611 111.738 290.072C63.4947 274.532 19.7315 245.322 4.53006 206.103C-10.8817 166.33 15.0631 118.246 51.6641 89.6863C93.6222 56.9538 152.275 70.7206 191.877 97.5131Z"
            fill="url(#paint0_fg)"
          />
        </g>

        <defs>
          <filter
            id="filter0_fg"
            x="0"
            y="0"
            width="1521"
            height="327"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feGaussianBlur stdDeviation="12.7" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.752941 0 0 0 0 0.121569 0 0 0 0 0.121569 0 0 0 0.5 0"
            />
            <feBlend in2="shape" result="effect1_innerShadow" />
          </filter>

          <radialGradient
            id="paint0_fg"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(771.759 -24) rotate(90) scale(351 1845.76)"
          >
            <stop stopColor="#C01F1F" />
            <stop offset="0.322432" stopColor="#D8796C" />
            <stop offset="0.769231" stopColor="#F7EACC" />
            <stop offset="1" stopColor="#FDF6E8" />
          </radialGradient>
        </defs>
      </svg>
    </div>

      {/* Product */}
      <div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-10
          w-[88vw] 
          h-[clamp(420px,80vh,560px)] md:h-auto md:aspect-1124/444"
      >
        <MbProduct onCartUpdate={onCartUpdate} />
      </div>
    </section>
  );
}
