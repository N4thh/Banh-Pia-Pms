import { useEffect, useRef, useState } from "react";
import Modal from "../../../../components/Modal";
import { Minus, Plus } from "lucide-react";
import { addToCart } from "../../../../utils/cartUtils";

type SauriengProps = {
    open: boolean;
    onClose: () => void;
    onAddToCart: () => void;
};

const OPEN_DURATION = 380;
const CLOSE_DURATION = 250;
// Kéo xuống quá ngưỡng này (px) thì coi như người dùng muốn đóng sheet
const DRAG_CLOSE_THRESHOLD = 160;


const SHEET_Y_VAR = "--saurieng-sheet-y";
const SHEET_DURATION_VAR = "--saurieng-sheet-duration";

export default function MobileSaurieng({ open, onClose, onAddToCart }: SauriengProps) {
    const [quantity, setQuantity] = useState(0);
    const [saltedEgg, setSaltedEgg] = useState(0);
    const basePrice = 70000;
    const totalPrice = basePrice + saltedEgg * 10000;

    // render: có truyền open=true xuống Modal hay không (trì hoãn lúc đóng
    // để kịp chạy animation slide-down trước khi Modal thực sự unmount)
    const [render, setRender] = useState(open);
    // visible: trạng thái "đã mở hẳn" hay chưa, dùng để tính vị trí target
    const [visible, setVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const isDraggingRef = useRef(false);
    const dragStartY = useRef(0);
    const dragDeltaY = useRef(0);

    useEffect(() => {
        if (open) {
            setRender(true);
            const raf1 = requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
            return () => cancelAnimationFrame(raf1);
        }

        setVisible(false);
        const timer = setTimeout(() => setRender(false), CLOSE_DURATION);
        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!open) setQuantity(0);
    }, [open]);

    // Đồng bộ vị trí sheet (0px = mở hẳn, 100% = ẩn hoàn toàn dưới màn hình)
    // qua CSS variable, trừ khi đang kéo tay (lúc đó pointermove tự set trực tiếp)
    useEffect(() => {
        if (isDragging) return;
        const root = document.documentElement;
        root.style.setProperty(SHEET_Y_VAR, visible ? "0px" : "100%");
        root.style.setProperty(SHEET_DURATION_VAR, `${visible ? OPEN_DURATION : CLOSE_DURATION}ms`);
    }, [visible, isDragging]);

    // dọn dẹp CSS variable khi unmount hẳn, tránh rò rỉ ảnh hưởng phần tử khác
    useEffect(() => {
        return () => {
            document.documentElement.style.removeProperty(SHEET_Y_VAR);
            document.documentElement.style.removeProperty(SHEET_DURATION_VAR);
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStartY.current = e.clientY;
        dragDeltaY.current = 0;
        document.documentElement.style.setProperty(SHEET_DURATION_VAR, "0ms");
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;
        // chỉ cho kéo xuống, không cho kéo ngược lên quá vị trí mở
        const delta = Math.max(0, e.clientY - dragStartY.current);
        dragDeltaY.current = delta;
        document.documentElement.style.setProperty(SHEET_Y_VAR, `${delta}px`);
    };

    const handlePointerUp = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        setIsDragging(false);

        if (dragDeltaY.current > DRAG_CLOSE_THRESHOLD) {
            onClose(); // đóng thật, useEffect [open] sẽ lo animation trượt xuống
        } else {
            // chưa đủ ngưỡng -> bật lại về vị trí mở (snap back)
            document.documentElement.style.setProperty(SHEET_DURATION_VAR, `${OPEN_DURATION}ms`);
            document.documentElement.style.setProperty(SHEET_Y_VAR, "0px");
        }
        dragDeltaY.current = 0;
    };

    return (
        <Modal
            open={render}
            onClose={onClose}
            panelClassName={`
                rounded-2xl w-full max-w-[60vw] max-h-[90vh] h-auto
                bg-[#FFFDF7]

                max-lg:!fixed max-lg:!inset-x-0 max-lg:!bottom-0 max-lg:!top-auto
                max-lg:!left-auto max-lg:!right-auto max-lg:!m-0
                max-lg:!w-full max-lg:!max-w-none
                max-lg:!h-[80vh] max-lg:!max-h-[80vh]
                max-lg:!rounded-t-3xl max-lg:!rounded-b-none
                max-lg:will-change-transform
                max-lg:[transform:translateY(var(--saurieng-sheet-y,100%))]
                max-lg:[transition:transform_var(--saurieng-sheet-duration,300ms)_cubic-bezier(0.32,0.72,0,1)]
            `}
        >
            <div className="flex flex-col h-full lg:contents text-[#3D2008]">
                {/* Drag handle */}
                <div
                    className="hidden max-lg:flex justify-center items-center pt-2.5 pb-1.5 shrink-0
                    touch-none select-none cursor-grab active:cursor-grabbing"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    <span className="w-18 h-1.5 rounded-full bg-[#D1D1D6]/60" />
                </div>

                <div className="flex flex-col md:flex-row h-full md:h-[70vh] gap-3 md:gap-5 p-2 md:p-4 min-h-0 flex-1 lg:flex-none">
                    {/* image */}
                    <div className="w-full md:w-1/2 h-[25vh] md:h-full border border-[#D9D9D9] bg-[#D9D9D9] rounded-2xl shrink-0">
                    </div>
                        <div className="shrink-0">
                            <h2 className="font-vollkorn font-semibold
                                text-[18px] sm:text-[19px] md:text-[20px] lg:text-[21px] xl:text-[22px] 2xl:text-[23px]">
                                Bánh Pía Nhân Sầu Riêng
                            </h2>
                            <p className="mb-4
                                text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px]">
                                Béo Ngậy, Thơm Nức Mũi, Đậm Đà Đến Miếng Cuối Cùng!
                            </p>
                        </div>
                    <div className="w-full md:w-1/2  flex flex-col gap-3 md:gap-4 min-h-0 flex-1 overflow-hidden py-2">
                        {/* top */}

                        {/* mid */}
                        <div className="flex flex-col gap-2 font-medium flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
                            <p className="shrink-0 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px]">
                            Lựa chọn trứng muối</p>

                            <button className={`w-full flex justify-between items-center px-4 py-2 border rounded-2xl
                            text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px] shrink-0
                            transition-all duration-200
                            ${
                                saltedEgg === 0 ? "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                            }`}
                            onClick={() => setSaltedEgg(0)}>
                            Không thêm trứng muối</button>

                            <button className= {`w-full flex justify-between items-center  px-4 py-2 border rounded-2xl
                            text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px] shrink-0
                            transition-all duration-200
                            ${
                                saltedEgg === 1 ?  "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                            }`}
                            onClick={() => setSaltedEgg(1)}>
                            Thêm 1 trứng muối <span>+10.000đ /bánh</span></button>

                            <button className={`w-full flex justify-between items-center  px-4 py-2 border rounded-2xl
                            text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px] shrink-0
                            transition-all duration-200
                            ${
                                saltedEgg === 2 ? "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                            }`}
                            onClick={() => setSaltedEgg(2)}>
                            Thêm 2 trứng muối <span>+20.000đ /bánh</span></button>

                            <button className={`w-full flex justify-between items-center  px-4 py-2 border rounded-2xl
                            text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]shrink-0
                            transition-all duration-200
                            ${
                                saltedEgg === 3 ? "bg-[#A61B1B] text-white border-[#A61B1B]" : ""
                            }`}
                            onClick={() => setSaltedEgg(3)}>
                            Thêm 3 trứng muối <span>+30.000đ /bánh</span></button>

                        </div>
                        {/* bot */}
                        <div className="flex flex-col gap-2 shrink-0 pt-2 border-t border-[#F7EACC]/30">
                            <div className="flex items-center justify-between">
                                <p>
                                    <span className=" font-semibold text-[#E5C980] 
                                        text-[22px] sm:text-[23px] md:text-[24px] lg:text-[25px] xl:text-[26px] 2xl:text-[27px]
                                        transition-all duration-200">
                                        {totalPrice.toLocaleString("vi-VN")}đ</span>
                                    <span className="font-light text-[#E5C980] text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px]">
                                    /bánh</span>
                                </p>
                                <div className="flex items-center justify-between gap-2 border rounded-2xl px-1 py-0.5 border-[#3D2008] w-23">
                                    <button
                                    type="button"
                                    onClick={() => setQuantity((prev) => Math.max(0,prev - 1))}
                                    className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-white
                                    h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2"> <Minus size={22} />
                                    </button>

                                    <span className="text-[20px] sm:text-[21px] md:text-[22px] lg:text-[23px] xl:text-[24px] 2xl:text-[25px] font-medium">{quantity}</span>

                                    <button
                                    type="button"
                                    className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-white 
                                    h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2"
                                    onClick={() => setQuantity((prev) => prev + 1)}
                                    > <Plus size={20} />
                                    </button>

                                </div>
                                
                            </div>
                            {/* submit */}
                            <button
                                type="button"
                                disabled={quantity === 0}
                                onClick={() => {
                                    addToCart({
                                        productId: '2',
                                        productName: 'Bánh Pía Nhân Sầu Riêng',
                                        saltedEgg,
                                        quantity,
                                        unitPrice: totalPrice,
                                    });
                                    setQuantity(0);
                                    setSaltedEgg(0);
                                    onAddToCart();
                                    onClose();
                                }}
                                className="w-full rounded-2xl py-2 font-semibold border border-[#F7EACC]
                                bg-[#C01F1F] text-[#FDF6E8]
                                text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] 2xl:text-[18px]
                                disabled:cursor-not-allowed
                                hover:bg-[#D62424] active:bg-[#A61B1B] disabled:bg-[#E08E8B] transition-colors"
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </Modal>
    );
}