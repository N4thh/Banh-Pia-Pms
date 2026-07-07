import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../components/Modal";
import { X, Trash2, CirclePlus, CircleMinus } from "lucide-react";
import { getCart, removeFromCart, clearCart, saveCart, CartItem, refreshTimeCart } from "../../../utils/cartUtils";

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

    function handleRemove(id: string) {
        const updated = removeFromCart(id);
        setCart(updated);
    }

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
            panelClassName="w-full max-w-[40vw] h-[95vh] bg-white rounded-2xl shadow-xl flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
                <div>

                    <h2 className="text-[#C01F1F] mt-0.5 font-semibold font-vollkorn ml-[1vw]
                    text-[17px] sm:text-[19px] md:text-[20px] lg:text-[22px] xl:text-[25px] 2xl:text-[28px]">
                    {totalQty > 0 ? `Bạn đã thêm ${totalQty} bánh ` : "Bạn chưa thêm bánh nào"}
                    </h2>
                    <div
                    className="bg-[url('/cart/Line.svg')] bg-contain bg-no-repeat"
                    style={{
                    width: "min(30vw, 666.5px)",
                    height: "min(4vw,15px)"
                    }}
                />
                </div>
                <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                        <button
                            onClick={() => {
                            handleClear(); 
                            changeInCart();
                        }}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                        >
                            <Trash2 size={13} />
                            Xóa tất cả
                        </button>
                    )}

                </div>
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
                                {/* product image placeholder */}
                                <div className="w-20 h-20 shrink-0 rounded-lg bg-[#D9D9D9] border-4 border-[#FDF6E8]" />

                                {/* info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[#3D2008] font-semibold text-md leading-tight truncate font-vollkorn">
                                        {item.productName}
                                    </h3>
                                    <p className="text-[#C2973F] text-xs mt-0.5">
                                        {SaltedEggLabel(item.saltedEgg)}
                                    </p>
                                    <div className="flex items-center justify-center gap-2 border rounded-2xl p-1
                                        w-fit mt-[1vh] border-[#3D2008]">
                                        <button
                                        type="button"
                                        onClick={() =>updateQuantity(item.id, -1)}
                                        className="transition-all duration-150 hover:scale-90
                                        focus-visible:outline-none focus-visible:ring-2"> <CircleMinus />
                                        </button>

                                        <span className="font-medium">{item.quantity}</span>

                                        <button
                                        type="button"
                                        className="transition-all duration-150 hover:scale-90
                                        focus-visible:outline-none focus-visible:ring-2"
                                        onClick={() => updateQuantity(item.id, +1)}
                                        > <CirclePlus />
                                        </button>

                                    </div>

                                </div>

                                {/* quantity + remove */}
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => {
                                        handleRemove(item.id);
                                        changeInCart();
                                    }}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                                    >
                                        <X size={14} />
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer summary */}
                    <div className="px-5 py-2 border border-dotted border-[#3D2008]">
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
