import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface OrderItem {
    cakeId: number;
    cakeName: string;
    quantity: number;
    priceAtPurchase: number;
    eggCount: number;
}

interface Order {
  id: number;
  totalMoney: number;
  status: string;
  items: OrderItem[];
}

type OrderStepperProps = {
  orderId: number
};

export default function OrderDetail({orderId} : OrderStepperProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [open, setOpen] = useState(false);

    const [error, setError] = useState("");

    function SaltedEggLabel(count: number) {
        if (count === 0) return "Không thêm trứng muối";
        return `${count} trứng muối`;
    }
    function formatName(name: string) { 
        if(name === "Sau Rieng")
            return "Bánh Pía Nhân Sầu Riêng";
        else if(name = "Dau Xanh")
            return "Bánh Pía nhân Đậu Xanh"
        return undefined;
    }

    useEffect(() => {
    if (!orderId) return;

    let isCancelled = false;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/booking/${orderId}`
        );

        if (isCancelled) return;
        
        setOrder(res.data);
        console.log(res.data)
      } catch (err: any) {
        if (isCancelled) return;

        const message = err.response?.data?.message || "Lỗi tải đơn hàng";
        toast.error(message);
        setOrder(null);
        setError(message); 
      }
    };

    fetchOrders();
    return () => {
      isCancelled = true;
    };
  }, [orderId]);

    const handleOpen = () => {
        setOpen(prev => !prev);
    };

    if (!order) return null;
    return(
        <div className="text-[#3D2008]">
            {order.items.map((item, index) => (
                <div key={`${item.cakeId}-${index}`}
                className="flex flex-col gap-[2vh] py-1">
                    <div className="flex gap-4 lg:gap-[1vw] ">
                        {/* Picture */}
                        <div className="relative w-15 h-15 lg:w-12 lg:h-12 shrink-0">
                            <div className="w-full h-full rounded-lg bg-[#D9D9D9] border-4 border-[#FDF6E8]"/>
                        </div>
                        <div className="flex justify-between w-full text-[#3D2008]">
                            <div>
                                <h3 className="font-semibold font-vollkorn
                                text-[14px] sm:text-[14px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[16px]"
                                >{formatName(item.cakeName)}</h3>
                                <h4 className="text-[14px] sm:text-[14px] md:text-[14px] lg:text-[13px] xl:text-[13px] 2xl:text-[13px] text-[#3D2008]/75"
                                >{SaltedEggLabel(item.eggCount)}</h4>
                            </div>
                            <span className="text-[#3D2008]/75 font-light
                            text-[12px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px] 2xl:text-[15px] ">x{item.quantity}</span>

                            <h4 className="font-medium text-[14px] sm:text-[14px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[16px]">
                            {item.priceAtPurchase.toLocaleString("vi-VN")} đ</h4>
                        </div>
                    </div>
                </div>          
            ))}

            {/* Info Detail */}
           <div
                className={`grid transition-all duration-300 ease-in-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden min-h-0">
                    <div className="flex flex-col gap-[2vh] pb-[2vh] mt-[2vh] border-t border-dotted pt-[2vh]
                    text-[14px] sm:text-[14px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[16px]">
                        <div className="flex justify-between">
                            <p>Tạm tính</p>
                            <p>{Number(order.totalMoney).toLocaleString("vi-VN")} đ</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Giảm giá</p>
                            <p> - </p>
                        </div>
                        <div className="flex justify-between">
                            <p>Phí giao hàng</p>
                            <p> - </p>
                        </div>
                        <div className="flex justify-between items-end font-semibold
                            text-[18px] sm:text-[18px] md:text-[19px] lg:text-[20px] xl:text-[20px] 2xl:text-[21px]">
                            <p>Thành tiền</p>
                            <span className="flex-1 border-b border-dashed border-[#3D2008] mx-2 mb-1 items-center"></span>
                            <p>{Number(order.totalMoney).toLocaleString("vi-VN")} đ</p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleOpen}
                className="flex justify-center items-center w-full font-semibold text-[#C01F1F]
                text-[14px] sm:text-[14px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[16px]"
            >
                {open ? "Rút gọn" : "Xem thêm"}
            </button>
        </div>
    );
}