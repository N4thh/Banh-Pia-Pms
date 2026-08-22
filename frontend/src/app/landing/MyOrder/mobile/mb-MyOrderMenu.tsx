import { useEffect, useRef, useState } from "react";
import Modal from "../../../../components/Modal";
import { ChevronLeft, ChevronRight, LoaderCircle, OctagonAlert, UserRound } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import OrderStepper from "../OrderStepper";
import OrderDetail from "../OrderDetail"

type CartMenuProps = {
  open: boolean;
  onClose: () => void;
};

interface Address {
  houseNumber: string;
  street: string;
  ward: string;
  district: string;
}

interface OrderItem {
    quantity: number;
}
type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

interface OrderContext {
  orderId: number;
  totalMoney: number;
  status: OrderStatus;
  orderDate: string;
  receiveDate: string;
  paymentMethod: string;
  shippingMethod: string;
  cancelReason: string;
  cancelledAt: string;
  address: Address | null;
  items: OrderItem[];
}

// Thời gian animation slide cho bottom sheet trên mobile
const OPEN_DURATION = 380;
const CLOSE_DURATION = 250;
const DRAG_CLOSE_THRESHOLD = 120;


const SHEET_Y_VAR = "--myorder-sheet-y";
const SHEET_DURATION_VAR = "--myorder-sheet-duration";

export default function MobileMyOrderMenu({ open, onClose }: CartMenuProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderContext[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Route nội bộ
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [pendingUser, setPendingUser] = useState<{
    id: string;
    fullName: string;
    phone: string;
    latestAddress: Address | null;
  } | null>(null);

  const [render, setRender] = useState(open);
  // visible: đang ở trạng thái "hiện" hay "ẩn"
  const [visible, setVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartY = useRef(0);
  const dragDeltaY = useRef(0);

  // Click vào 1 đơn hàng: điều hướng sang trang chi tiết
  const handleOrderRowClick = (orderId: number) => {
    setSelectedOrderId(orderId);
  };

  // Nút "Quay lại": 
  const handleBackToList = () => {
    setSelectedOrderId(null);
  };

  /* Format */
function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
  const formatPhone = (phone: string) => {
    const international = phone.replace(/^0/, "(+84)");

    return international.replace(/(\(\+84\))(\d{3})(\d{3})(\d{3})/,
    "$1 $2 $3 $4"
    );
  };

  const fortmatShippingMethod = (method: string) => {
    if(method === "DELIVERY")
      return "Giao Hàng";
    else
      return "Nhận trực tiếp";
  }
  const formatPaymentMethod =(method: string) => {
    if(method === "BANK_TRANSFER")
        return "Chuyển Khoản";
    return "Thanh toán khi nhận bánh";
  }

  const formatStatus = (status: string) => {
        switch (status) {
            case "NEW":
            return {
                text: "Đã tiếp nhận",
                className: "bg-[#0088FF]/25 text-[#0088FF]",
            };

            case "PROCESSING":
            return {
                text: "Đang xử lý",
                className: "bg-[#FFCC00]/25 text-[#FFCC00]",
            };

            case "COMPLETED":
            return {
                text: "Đã nhận",
                className: "bg-[#34C759]/25 text-[#34C759]",
            };

            case "CANCELLED":
            return {
                text: "Đã hủy",
                className: "bg-[#FF5F57]/25 text-[#FF5F57]",
            };

            default:
            return {
                text: status,
                className: "bg-gray-100 text-gray-700",
            };
        }
  };

  const statusPriority: Record<string, number> = {
        PROCESSING: 1,
        NEW: 2,
        COMPLETED: 3,
        CANCELLED: 4,
  };

  /* Handle */
  const HandleClose = () => {
    setValue("");
    setError("");
    setOrders([]);
    setPendingUser(null);
    setShowOrderModal(false);
    setSelectedOrderId(null);
    onClose();
  };

  const HandleFindOrder = async (phone: string) => {
    if (!phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/create`,
        { phone }
      );
      const { isNewUser, user } = res.data;

      if (isNewUser) {
        setError("Chúng tôi không tìm thấy số điện thoại của bạn, vui lòng kiểm tra lại");
        setPendingUser(null);
        return;
      }

      setPendingUser(user);
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    HandleClose();
  };

  useEffect(() => {
    if (!pendingUser?.id) return;

    let isCancelled = false;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/booking/user/${pendingUser.id}`
        );

        if (isCancelled) return;

        setOrders(res.data);
        setShowOrderModal(true);
      } catch (err: any) {
        if (isCancelled) return;

        toast.error(err.response?.data?.message || "Lỗi tải đơn hàng");
        setOrders([]);
        setError("Không tìm thấy đơn hàng cho số điện thoại này");
      }
    };

    fetchOrders();
    return () => {
      isCancelled = true;
    };
  }, [pendingUser]);


  useEffect(() => {
    if (!open) {
      setLoading(false);
      setPendingUser(null);
      setShowOrderModal(false);
      setSelectedOrderId(null);
    }
  }, [open]);

  // Animation mở/đóng cho mobile - tách "open" (ý muốn từ props) khỏi
  // "render" (có thật sự tồn tại trong DOM) để kịp chạy animation lúc đóng
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

  // Đồng bộ vị trí sheet qua CSS variable đặt ở <html>, trừ khi đang kéo tay
  useEffect(() => {
    if (isDragging) return;
    const root = document.documentElement;
    root.style.setProperty(SHEET_Y_VAR, visible ? "0px" : "100%");
    root.style.setProperty(SHEET_DURATION_VAR, `${visible ? OPEN_DURATION : CLOSE_DURATION}ms`);
  }, [visible, isDragging]);

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
    const delta = Math.max(0, e.clientY - dragStartY.current);
    dragDeltaY.current = delta;
    document.documentElement.style.setProperty(SHEET_Y_VAR, `${delta}px`);
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (dragDeltaY.current > DRAG_CLOSE_THRESHOLD) {
      handleDismiss();
    } else {
      document.documentElement.style.setProperty(SHEET_DURATION_VAR, `${OPEN_DURATION}ms`);
      document.documentElement.style.setProperty(SHEET_Y_VAR, "0px");
    }
    dragDeltaY.current = 0;
  };

  const sortedOrders = [...orders].sort(
    (a, b) => statusPriority[a.status] - statusPriority[b.status]
  );
  const activeOrders = sortedOrders.filter((o) =>
    o.status === "NEW" || o.status === "PROCESSING"
  );
  const historyOrders = sortedOrders.filter((o) =>
    o.status === "CANCELLED" || o.status === "COMPLETED"
  );
  const selectedOrder = orders.find((o) => o.orderId === selectedOrderId) ?? null;

  // Nội dung chi tiết 1 đơn
  const renderOrderDetailBody = (order: OrderContext) => {
    const total = order.items.reduce((sum, item) => sum + item.quantity, 0);
        return (
            <>
            {/* Đơn hàng */}
            <div 
            className={`p-2 rounded-lg bg-white drop-shadow-2xl 
                ${order.status === 'COMPLETED' ? 'border-t-5 border-[#34C759]' : ''}
                ${order.status === 'CANCELLED' ? 'border-t-5 border-[#FF5F57]' : ''}`}
            >
                <div className="flex justify-between items-center">
                    <p className="font-vollkorn font-semibold text-[16px]">
                    Đơn bánh #{order.orderId}
                    </p>
                    <span
                    className={`rounded-full px-3 py-1 font-medium text-[10px] flex items-center
                    ${formatStatus(order.status).className}`}
                    >
                    {formatStatus(order.status).text}
                    </span>
                </div>

                <div className="flex items-center gap-2 font-light text-[#3D2008]/80 mt-0.5 text-[11px]">
                    <p> Đặt vào {formatDate(order.orderDate)} </p>
                    <div className="h-1 w-1 border rounded-full bg-[#3D2008]"/>
                    <p> Nhận vào {formatDate(order.receiveDate)} </p>
                    <div className="h-1 w-1 border rounded-full bg-[#3D2008]"/>
                    <p>{total} bánh</p>
                </div>

                <div className="pb-[2vh]">
                    <OrderStepper status={order.status} cancelReason= {order.cancelReason} cancelledAt={order.cancelledAt} />
                </div>          
            </div>

            {/* Giỏ hàng */}
            <div className="pb-[2vh] flex flex-col pt-[1vh] gap-[1vh]
            p-2 rounded-lg bg-white drop-shadow-2xl">
                <p className="font-medium text-[15px]"
                >Giỏ hàng</p>
                <OrderDetail orderId={order.orderId}/>
            </div>

            {/* Phương thức thanh toán */}
            <div className="p-2 rounded-lg bg-white drop-shadow-2xl mb-2">
                <div className="border-b border-[#3D2008]/25 pb-[2vh] flex justify-between items-center w-full pt-[1vh] gap-[1vh] text-[14px]">
                    <p className="font-medium">Phương thức thanh toán</p>
                    <p className="text-[#3D2008]/75 text-[13px]">{formatPaymentMethod(order.paymentMethod)}</p>
                </div>
                <div className="flex flex-col gap-[1vh]">
                    <div className=" pb-[2vh] flex justify-between items-center w-full pt-[1vh] gap-[1vh] text-[15px]">
                        <p className="font-medium">Phương thức nhận bánh</p>
                        <p className="text-[#3D2008]/75 text-[13px]">{fortmatShippingMethod(order.shippingMethod)}</p>
                    </div>
                <div className="flex flex-col gap-3 text-sm">
                    {order.address && (order.address.houseNumber || order.address.street || order.address.ward || order.address.district) && (
                        <div className="flex justify-between w-full">
                            <p>Địa điểm nhận bánh</p>
                            <p className="[text-decoration-skip-ink:none] underline text-[#3D2008]/75 w-1/2 text-[11px]"
                            >{order.address.houseNumber}, đường {order.address.street}, phường {order.address.ward}, Tp.{order.address.district}</p>
                        </div>
                    )}
                    <div className="flex justify-between w-full">
                        <p>Thời gian nhận bánh</p>
                        <p className="text-[#3D2008]/75 text-[13px]"
                        >Từ 7:00 đến 13:00</p>
                    </div>
                    <div className="flex justify-between w-full">
                        <p>Liên hệ để nhận bánh</p>
                        <p className="text-[#3D2008]/75 text-[13px]"
                        >(+84) 33 871 0915</p>
                    </div>
                    </div>
                </div>
            </div>
            </>
        );
    };

    const renderOrderCard = (order: OrderContext) => {
    const statusInfo = formatStatus(order.status);

    return (
        <div
          key={order.orderId}
          onClick={() => handleOrderRowClick(order.orderId)}
          className={`border border-[#FFFDF7] bg-[#FFFDF7] rounded-lg p-3 text-[#3D2008] drop-shadow-2xl
          cursor-pointer hover:bg-[#F5F0E6] transition-colors`}
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <p className="font-vollkorn font-semibold text-base">
                    Đơn hàng #{order.orderId}
                    </p>
                    <span className={`rounded-full px-3 py-1 font-medium flex items-center text-xs w-fit mt-2
                    ${statusInfo.className}`}
                    >
                        {statusInfo.text}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <p className={`${order.status === "CANCELLED" ? "text-[#3D2008]/50" : "text-[#3D2008]"} font-semibold text-lg`}>
                    {order.totalMoney.toLocaleString("vi-VN")}
                    </p>
                    <ChevronRight size={25} className="text-[#3D2008]" />
                </div>
            </div>


        </div>
    );
  };

  return (
    <Modal
      open={render}
      onClose={HandleClose}
      panelClassName={`rounded-2xl w-full max-h-[90vh] h-auto overflow-y-auto no-scrollbar no-scrollbar
      border border-[#FFFDF7] rounded-lg bg-[#FFFDF7] ${showOrderModal ? "max-w-[50vw]" : "max-w-[30vw]"}

      max-lg:!fixed max-lg:!inset-x-0 max-lg:!bottom-0 max-lg:!top-auto
      max-lg:!left-auto max-lg:!right-auto max-lg:!m-0
      max-lg:!w-full max-lg:!max-w-none
      ${selectedOrder
          ? "max-lg:h-auto max-lg:max-h-[80vh] overflow-y-auto no-scrollbar no-scrollbar"
          : !showOrderModal
              ? "max-lg:!h-[30vh] max-lg:!max-h-[30vh]"
              : "max-lg:!h-[60vh] max-lg:!max-h-[60vh]"
      }      
      max-lg:!rounded-t-3xl max-lg:!rounded-b-none
      max-lg:will-change-transform
      max-lg:[transform:translateY(var(--myorder-sheet-y,100%))]
      max-lg:[transition:transform_var(--myorder-sheet-duration,300ms)_cubic-bezier(0.32,0.72,0,1)]
      `}
    >
      {/* Drag handle */}
      <div
        className="hidden max-lg:flex justify-center items-center pt-2.5 pb-1.5 sticky top-0 z-10
        bg-[#FFFDF7] touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="w-18 h-1.5 rounded-full bg-[#3D2008]/30" />
      </div>

      {!showOrderModal ? (
        <div className="flex flex-col p-4 pb-[calc(24px+env(safe-area-inset-bottom))] gap-[2vh] text-[#3D2008]">
          <div>
            <p className="font-vollkorn font-semibold text-lg">
              Kiểm tra đơn hàng
            </p>
            <p className="text-sm">
              Vui lòng nhập số điện thoại bạn đã dùng khi đặt bánh
            </p>
          </div>
          <div>
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
              className="w-full p-4 border focus:outline-[#3D2008] rounded-lg text-sm"
              placeholder="Số điện thoại*"
            />
          </div>

          {error && (
            <p className="text-[#E90000] text-sm mt-1 flex items-center gap-1">
              <OctagonAlert size={18} /> {error}
            </p>
          )}

          <div className="flex">
            <button
              className="w-full border py-3 px-6 rounded-lg  text-[#FDF6E8] font-semibold text-sm
               bg-[#C01F1F] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors gap-2 disabled:opacity-60"
              type="button"
              disabled={loading}
              onClick={() => HandleFindOrder(value)}
            >
              {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
              {loading ? "Đang xử lý..." : "Kiểm tra đơn hàng"}
            </button>
          </div>
        </div>
      ) : selectedOrder ? (
        /* Trang chi tiết */
        <div className="p-4 pb-[calc(24px+env(safe-area-inset-bottom))] text-[#3D2008] flex flex-col gap-4">
          <button
            type="button"
            onClick={handleBackToList}
            className="flex items-center gap-1 font-semibold text-[#C01F1F] w-fit"
          >
            <ChevronLeft size={20} />
            <span className="text-sm [text-decoration-skip-ink:none] underline f">Tất cả đơn bánh</span>
          </button>


          {renderOrderDetailBody(selectedOrder)}
        </div>
      ) : (
        <div className="p-4 pb-[calc(24px+env(safe-area-inset-bottom))] text-[#3D2008] flex flex-col gap-4">
           <p className="font-vollkorn font-semibold text-[22px]"
          >Xin chào, đây là đơn hàng của bạn</p>

          <div className="flex gap-3">
              <div className="w-15 h-15 shrink-0 border border-[#E2DCD3] rounded-full flex items-center justify-center bg-[#E2DCD3]">
                  <UserRound size={32} />
              </div>
              {/* info */}
              <div className="flex flex-col text-sm">
                  <div className="flex gap-[4vw]">
                      <p> {pendingUser?.fullName}</p>
                      <p className="text-[#3D2008]/75">{formatPhone(pendingUser?.phone ?? "")}</p>
                  </div>

                  {pendingUser?.latestAddress && (
                    <p className="text-[#3D2008]/75">
                    {pendingUser.latestAddress.houseNumber}, đường {pendingUser.latestAddress.street}, phường {pendingUser.latestAddress.ward}, quận {pendingUser.latestAddress.district}
                    </p>
                  )}
              </div>
          </div>
          {orders.length === 0 && <p>Không có đơn hàng nào</p>}

          {activeOrders.length > 0 && (
          <div className="flex flex-col gap-2 border-b pb-[4vh] mt-2">
              <p className="font-medium text-sm"
              >Đơn bánh chưa nhận</p>
              {activeOrders.map(renderOrderCard)}
          </div>
          )}

          {historyOrders.length > 0 && (
          <div className="flex flex-col gap-2">
              <p className="font-medium text-sm mb-2"
              >Đơn bánh đã hoàn thành</p>
              {historyOrders.map(renderOrderCard)}
          </div>
          )}
        </div>
      )}
    </Modal>
  );
}
