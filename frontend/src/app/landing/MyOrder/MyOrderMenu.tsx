import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { LoaderCircle, OctagonAlert, UserRound } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

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

interface OrderContext {
  orderId: number;
  totalMoney: number;
  status: string;
  orderDate: string;
  receiveDate: string;
  address: Address | null;
  items: OrderItem[];
}

export default function MyOrderMenu({ open, onClose }: CartMenuProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderContext[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<{
    id: string;
    fullName: string;
    phone: string;
    latestAddress: Address | null;
  } | null>(null);


  const formatPhone = (phone: string) => {
    const international = phone.replace(/^0/, "(+84)");

    return international.replace(/(\(\+84\))(\d{3})(\d{3})(\d{3})/,
    "$1 $2 $3 $4"
    );
  };

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
                className: "bg-[#E5C980]/25 text-[#C2973F]",
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

      if (!user?.latestAddress) {
        setError("Không tìm thấy thông tin đơn hàng cho số điện thoại này");
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
      panelClassName={`rounded-2xl w-full max-h-[90vh] h-auto overflow-y-auto
      border border-[#FFFDF7] rounded-lg bg-[#FFFDF7] ${showOrderModal ? "max-w-[40vw]" : "max-w-[30vw]"}`}
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
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
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
                    
                    <p className="text-[#3D2008]/75">
                    {pendingUser?.latestAddress?.houseNumber}, đường {pendingUser?.latestAddress?.street}, phường {pendingUser?.latestAddress?.ward}, quận {pendingUser?.latestAddress?.district} </p>
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
                const statusInfo = formatStatus(order.status);

                return (
                    <div key={order.orderId} className="border border-[#FFFDF7] bg-[#FFFDF7] drop-shadow-2xl rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <p className="font-vollkorn font-semibold
                            text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">
                            Đơn hàng #{order.orderId}
                            </p>

                            <span
                            className={`rounded-full px-3 py-1 font-medium
                            text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] 2xl:text-[11px]
                            ${statusInfo.className}`}
                            >
                            {statusInfo.text}
                            </span>
                        </div>

                        <p className="text-sm mt-2">
                            Tổng tiền: {order.totalMoney.toLocaleString("vi-VN")}đ
                        </p>

                        <div className="text-sm mt-1">
                            {order.items.map((item, idx) => (
                            <p key={idx}>Số lượng: {item.quantity}</p>
                            ))}
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