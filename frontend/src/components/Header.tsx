"use client";

import { Star } from "lucide-react";
import CartMenu from "../app/landing/Cart/CartMenu";
import { useEffect, useState } from "react";
import { CartItem, getCart } from "../utils/cartUtils";
import { usePathname, useRouter } from "next/navigation";

type HeaderProps = {
  cartRefreshTrigger?: number;
  onCartUpdate?: () => void;
};

export default function Header({ cartRefreshTrigger, onCartUpdate}: HeaderProps) {
   const router = useRouter(); 
   const pathname = usePathname(); 
   const [cart, setCart] = useState<CartItem[]>([]);
   const [openCartMenu, setOpenCartMenu] = useState(false);
   //scroll
   const scrollToSection = (id: string) => {
        if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
        });
        } else {
            router.push(`/`);
        }
    };
    //handleOpenCart
    const handleOpen = (() =>{
        if(pathname === "/booking") 
            setOpenCartMenu(false);
        else 
            setOpenCartMenu(true);
    })

    //event
    useEffect(() => {
        setCart(getCart());
    }, [cartRefreshTrigger]);

    return (
        <header className="fixed top-4 left-0 w-full z-50 flex justify-center">
            <div className="w-[80vw] flex items-center justify-between
                py-4 px-6 gap-6
                rounded-2xl bg-white/1 backdrop-blur-[2px] border border-white/20 shadow-lg
                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]
                text-[#3D2008] font-medium font-">

                <button onClick={() => scrollToSection("product")}>
                    BÁNH TRUNG THU
                </button>
                <button onClick={() => scrollToSection("guide")}>
                    ĐẶT VÀ NHẬN BÁNH
                </button>

                <Star />

                <button onClick={() => scrollToSection("guide")}>
                    ĐƠN BÁNH CỦA TÔI
                </button>

                <button onClick={() => handleOpen()}>
                    GIỎ HÀNG ({cart.length})
                </button>

                <CartMenu
                    open={openCartMenu}
                    onClose={() => setOpenCartMenu(false)}
                    refreshTrigger={cartRefreshTrigger}
                    changeInCart = {() => onCartUpdate?.()}
                />
            </div>
        </header>
    );
}
