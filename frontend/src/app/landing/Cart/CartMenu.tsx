import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../components/Modal";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { getCart, clearCart, saveCart, CartItem, refreshTimeCart } from "../../../utils/cartUtils";

type CartMenuProps = {
    open: boolean;
    onClose: () => void;
    refreshTrigger?: number;
    changeInCart: () => void;  
};

function SaltedEggLabel(count: number) {
    if (count === 0) return "Không trứng muối";
    return `${count} trứng muối`;
}

export default function CartMenu({ open, onClose, refreshTrigger, changeInCart }: CartMenuProps) {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);

    const reload = useCallback(() => {
        setCart(getCart());
    }, []);

    useEffect(() => {
        if (open) reload();
    }, [open, reload, refreshTrigger]);

    const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    function handleClear() {
        clearCart();
        setCart([]);
    }
    function updateQuantity(id: string, delta: number) {
        setCart(prev => {
            const updated = prev
            .map(item =>
                item.id === id ? { ...item, quantity: item.quantity + delta }
                : item
            )
            .filter(item => item.quantity > 0); //remove when quantity = 0
            saveCart(updated); 
            return updated;
        });
        changeInCart();
    }


    return (
        <Modal
            open={open}
            onClose={onClose}
            containerClassName="items-start justify-end"
            panelClassName="flex flex-col w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[40vw] h-[95vh] bg-white rounded-2xl shadow-xl "
        >
            {/* Header */}
            <div className="px-5 py-4 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-[#C01F1F] mt-0.5 font-semibold font-vollkorn ml-[1vw]
                    text-[17px] sm:text-[19px] md:text-[20px] lg:text-[22px] xl:text-[25px] 2xl:text-[28px]">
                    {totalQty > 0 ? `Bạn đã thêm ${totalQty} bánh ` : "Bạn chưa thêm bánh nào"}
                    </h2>
                  
                    <button className="block lg:hidden"
                    onClick={() => onClose()}>
                        <X />
                    </button>
                    
                    <div className="flex items-center justify-end px-2 gap-2 hidden lg:block">
                        {cart.length > 0 && (
                            <button
                                onClick={() => {
                                handleClear(); 
                                changeInCart();
                            }}
                                className="text-xs text-[#E90000] hover:text-red-700 transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={13} />
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                    
                </div>
                <div
                    className="bg-[url('/cart/Line.svg')] bg-contain bg-no-repeat lg:w-[min(30vw,666.5px)]!"
                    style={{
                        width: "min(80vw, 666.5px)",
                        height: "min(4vw, 15px)",
                    }}
                />           
            </div>

            {/* Empty state */}
            {cart.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#C2973F]">
                    <div className="w-16 h-16 rounded-full bg-[#FDF6E8] flex items-center justify-center">
                        <span className="text-4xl">:(</span>
                    </div>
                    <p className="text-md font-medium">Thật trống trải</p>
                </div>
            )}

            {/* Cart items */}
            
            {cart.length > 0 && (
                <>
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 p-3 rounded-xl border-b border-[#EDC6AD]/40"
                            >
                                {/* Picture */}
                                <div className="w-15 h-15 lg:w-25 lg:h-25 shrink-0 rounded-lg bg-[#D9D9D9] border-4 border-[#FDF6E8]" />

                                {/* info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <h3 className="text-[#3D2008] font-semibold text-md leading-tight truncate font-vollkorn
                                        text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">
                                            {item.productName}
                                        </h3>
                                        <div className="flex items-end justify-between
                                        text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
                                            {item.unitPrice.toLocaleString("vi-VN")} đ
                                        </div>
                                    </div>
                                    <p className="text-[#C2973F] mt-0.5
                                    text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">
                                        {SaltedEggLabel(item.saltedEgg)}
                                    </p>
                                    <div className="flex items-center justify-center gap-2 border rounded-2xl px-1 py-1 sm:py-0 w-fit mt-[1vh] border-[#3D2008] ">
                                        <button
                                        type="button"
                                        onClick={() =>updateQuantity(item.id, -1)}
                                        className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-white
                                        h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2"> <Minus size={20} />
                                        </button>

                                        <span className="text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px] font-medium">{item.quantity}</span>

                                        <button
                                        type="button"
                                        className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-white 
                                        h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2"
                                        onClick={() => updateQuantity(item.id, +1)}
                                        > <Plus size={20} />
                                        </button>

                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer summary */}
                    <div className="px-5 py-2 border-t border-dotted border-[#3D2008]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[#3D2008] font-medium text-sm">Tạm tính</span>
                            <span className="text-[#C01F1F] font-bold text-lg">
                                {total.toLocaleString("vi-VN")} <span className="underline">đ</span>
                            </span>
                        </div>
                            <button
                                className="w-full rounded-xl py-2.5 bg-[#C01F1F] text-white font-semibold text-sm
                                    hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors"
                                    onClick={() => {
                                        refreshTimeCart(); 
                                        router.push("/booking")
                                    }}
                            >
                                Đặt hàng ngay
                            </button>
                      
                        <p className="text-center text-[10px] text-gray-400 mt-2">
                            Giỏ hàng sẽ hết hạn sau 30 phút
                        </p>
                    </div>
                </>
            )}
        </Modal>
    );
}
