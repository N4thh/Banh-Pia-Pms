"use client";

import { Star } from "lucide-react";
import CartMenu from "../app/landing/Cart/CartMenu";
import { useEffect, useState } from "react";
import { CartItem, getCart } from "../utils/cartUtils";
import { usePathname, useRouter } from "next/navigation";
import MobileMyOrderMenu from "../app/landing/MyOrder/mobile/mb-MyOrderMenu";


type HeaderProps = {
  cartRefreshTrigger?: number;
  onCartUpdate?: () => void;
};

export default function MobileHeader({ cartRefreshTrigger, onCartUpdate}: HeaderProps) {
   const router = useRouter(); 
   const pathname = usePathname(); 
   const [cart, setCart] = useState<CartItem[]>([]);
   const [openCartMenu, setOpenCartMenu] = useState(false);
   const [openMyOrderMenu, setOpenMyOrderMenu] = useState(false);

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
    const handleOpenCartMenu = (() =>{
        if(pathname !== "/") 
            setOpenCartMenu(false);
        else 
            setOpenCartMenu(true);
    })

    const OpenMyOrderMenu = (() =>{
        if(pathname !== "/") 
            setOpenMyOrderMenu(false);
        else 
            setOpenMyOrderMenu(true);
    })

    //event
    useEffect(() => {
        setCart(getCart());
    }, [cartRefreshTrigger]);

    return (
        <header className="fixed top-4 left-0 w-full z-50 flex justify-center">
            <div className="w-[90vw] flex items-center justify-between
                py-4 px-6 gap-6
                rounded-2xl bg-white/1 backdrop-blur-[2px] border border-white/20 shadow-lg
                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]
                text-[#3D2008] font-medium font-">

                <button className="text-sm flex-2 flex justify-start" onClick={() => OpenMyOrderMenu()} >
                    TÌM ĐƠN
                </button>

                <Star className="flex-1 flex justify-center" size={35} />

                <button className="text-sm flex-2 flex justify-end" onClick={() => handleOpenCartMenu()}>
                   GIỎ HÀNG ({cart.length})
                </button>

                <CartMenu
                    open={openCartMenu}
                    onClose={() => setOpenCartMenu(false)}
                    refreshTrigger={cartRefreshTrigger}
                    changeInCart = {() => onCartUpdate?.()}
                />
                <MobileMyOrderMenu
                    open={openMyOrderMenu}
                    onClose={() => setOpenMyOrderMenu(false)}
                />
            </div>
        </header>
    );
}
