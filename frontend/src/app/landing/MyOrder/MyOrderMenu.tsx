import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { ChevronDown, LoaderCircle, OctagonAlert, UserRound } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import OrderStepper from "./OrderStepper";
import OrderDetail from "./OrderDetail"

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

export default function MyOrderMenu({ open, onClose }: CartMenuProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderContext[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set()); 

  const [pendingUser, setPendingUser] = useState<{
    id: string;
    fullName: string;
    phone: string;
    latestAddress: Address | null;
  } | null>(null);
  
  /* Toggle */
  const toggleOrderStepper = (orderId: number) => { 
    setExpandedOrders((prev) => { 
        const next = new Set(prev); 
        if(next.has(orderId)) { 
          next.delete(orderId); 
        }
        else { 
          next.add(orderId);
        }
        return next;
    });
  };

  /* Format */
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

  function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  const formatOrderStatus = (status: string) => {
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
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={HandleClose}
      panelClassName={`rounded-2xl w-full max-h-[90vh] h-auto overflow-y-auto no-scrollbar
      border border-[#FFFDF7] rounded-lg bg-[#FFFDF7] ${showOrderModal ? "max-w-[50vw]" : "max-w-[30vw]"}`}
    >
      {!showOrderModal ? (
        <div className="flex flex-col p-4 gap-[2vh] text-[#3D2008]">
          <div>
            <p className="font-vollkorn font-semibold text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]">
              Kiểm tra đơn hàng
            </p>
            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
              Vui lòng nhập số điện thoại bạn đã dùng khi đặt bánh
            </p>
          </div>
          <div>
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
              className="w-full p-2 border focus:outline-[#3D2008] rounded"
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
              className="mr-auto inset-0 border py-3 px-6 rounded-lg
              text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]
              text-[#FDF6E8] font-semibold bg-[#C01F1F] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors
              flex items-center gap-2 disabled:opacity-60"
              type="button"
              disabled={loading}
              onClick={() => HandleFindOrder(value)}
            >
              {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
              {loading ? "Đang xử lý..." : "Kiểm tra đơn hàng"}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-[#3D2008] flex flex-col gap-4">
            <p className="font-vollkorn font-semibold text-[16px]"
            >Xin chào, đây là đơn hàng của bạn</p>

            <div className="flex gap-[1vw]">
                <div className="w-12 h-12 border border-[#E2DCD3] rounded-full flex items-center justify-center bg-[#E2DCD3]">
                    <UserRound />
                </div>
                {/* info */}
                <div className="flex flex-col
                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
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

        {(() => {
            const sortedOrders = [...orders].sort(
            (a, b) => statusPriority[a.status] - statusPriority[b.status]
            );
            const activeOrders = sortedOrders.filter((o) =>
                o.status === "NEW" || o.status === "PROCESSING"
            );

            const historyOrders = sortedOrders.filter((o) =>
                 o.status === "CANCELLED" || o.status === "COMPLETED"
            );

            const renderOrder = (order: OrderContext) => {
                const statusInfo = formatOrderStatus(order.status);
                const isExpanded = expandedOrders.has(order.orderId); 
                const total = order.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                    <div key={order.orderId} className="border border-[#FFFDF7] bg-[#FFFDF7] drop-shadow-2xl rounded-lg p-3 text-[#3D2008]">
                        <div className="flex justify-between items-center">
                            <p className="font-vollkorn font-semibold
                            text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">
                            Đơn bánh #{order.orderId}
                            </p>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 font-medium flex items-center
                              text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] 2xl:text-[11px]
                              ${statusInfo.className}`}
                            >
                              {statusInfo.text}
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleOrderStepper(order.orderId)}
                              className="p-1 hover:bg-[#E2DCD3] rounded-full transition-colors flex items-center justify-center"
                            >
                              <ChevronDown
                                size={16}
                                className={`transition-transform duration-300 ${
                                  isExpanded ? "rotate-180" : "rotate-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                       
                        <div className="flex items-center gap-[0.5vw] font-light text-[#3D2008]/80 mt-[2vh]
                        text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]"
                        >
                          <p> Đặt vào {formatDate(order.orderDate)} </p>
                          <div className="h-1 w-1 border rounded-full bg-[#3D2008]"/>
                          <p> Nhận vào {formatDate(order.receiveDate)} </p>
                          <div className="h-1 w-1 border rounded-full bg-[#3D2008]"/>

                           <div>
                          <p>{total} bánh</p>
             
                          </div>
                        </div>

                          {/* Info Detail */}
                          <div
                           className={`overflow-hidden transition-all duration-300 flex flex-col ${
                              isExpanded ? "max-h-250 opacity-100 mt-3" : "max-h-0 opacity-0"
                            }`}>
                            {/* Progess */}
                             <div className="border-b pb-[2vh]">
                               <OrderStepper status={order.status} cancelReason= {order.cancelReason} cancelledAt={order.cancelledAt} />
                             </div>
                             {/* OrderInfo */}
                             <div className="border-b border-[#3D2008]/25 pb-[2vh] flex flex-col pt-[1vh] gap-[1vh]">
                                <p className="font-medium
                                text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                                >Giỏ hàng</p>

                                <OrderDetail orderId={order.orderId}/>
                             </div>

                             {/* PaymentInfo */}
                              <div className="border-b border-[#3D2008]/25 pb-[2vh] flex justify-between items-center w-full pt-[1vh] gap-[1vh]
                              text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                                  <p className="font-medium">Phương thức thanh toán</p>
                                  <p className="text-[#3D2008]/75">{formatPaymentMethod(order.paymentMethod)}</p>
                              </div>

                              <div className="flex flex-col gap-[1vh]">
                                <div className=" pb-[2vh] flex justify-between items-center w-full pt-[1vh] gap-[1vh]
                                text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                                    <p className="font-medium">Phương thức nhận bánh</p>
                                    <p className="text-[#3D2008]/75">{fortmatShippingMethod(order.shippingMethod)}</p>
                                </div>

                                <div className="flex flex-col gap-[0.5vh]
                                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                                  {order.address && (order.address.houseNumber || order.address.street || order.address.ward || order.address.district) && (
                                    <div className="flex justify-between w-full">
                                        <p>Địa điểm nhận bánh</p>
                                        <p className="[text-decoration-skip-ink:none] underline text-[#3D2008]/75 w-1/2"
                                        >{order.address.houseNumber}, đường {order.address.street}, phường {order.address.ward}, Tp.{order.address.district}</p>
                                    </div>
                                  )}

                                  <div className="flex justify-between w-full">
                                      <p>Thời gian nhận bánh</p>
                                      <p className="text-[#3D2008]/75"
                                      >Từ 7:00 đến 13:00</p>
                                  </div>

                                  <div className="flex justify-between w-full">
                                      <p>Liên hệ để nhận bánh</p>
                                      <p className="text-[#3D2008]/75 "
                                      >(+84) 33 871 0915</p>
                                  </div>
                                </div>
                              </div>
                          </div>
                                                                
                    </div>
                );
            };

            return (
            <>
                {activeOrders.length > 0 && (
                <div className="flex flex-col gap-2 border-b pb-[4vh]">
                    <p className="font-medium
                    text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                    >Đơn bánh chưa nhận</p>
                    {activeOrders.map(renderOrder)}
                </div>
                )}

                {historyOrders.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="font-medium
                    text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                    >Đơn bánh đã hoàn thành</p>
                    {historyOrders.map(renderOrder)}
                </div>
                )}

                {orders.length === 0 && <p>Không có đơn hàng nào</p>}
            </>
            );
        })()}

        </div>
      )}
    </Modal>
  );
}