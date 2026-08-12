"use client";

import { useEffect, useState } from "react";
import { axiosClient } from "@/src/api/axios-client";
import Modal from "@/src/components/Modal";
import {Check, ChevronLeft, Clock3, Dot, LoaderCircle, Package, ReceiptText, UserRound, X } from "lucide-react";
import OrderStepper from "../../../landing/MyOrder/OrderStepper";
import toast from "react-hot-toast";
import OrderCancel from "./OrderCancel";
import OrderCompleted from "./OrderCompleted";

type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

type OrderItem = {
  cakeId: number;
  name: string;
  quantity: number;
  eggCount: number;
  priceAtPurchase: number;
};

type PaymentLink = {
  qrCode: string;
  checkoutUrl: string;
  status: string;
  amountPaid: number;
  amountRemaining: number;
  createdAt: string;
  canceledAt: string | null;
} | null;

type OrderDetail = {
  id: number;
  totalMoney: number;
  status: OrderStatus;
  shippingMethod: string;
  paymentMethod: string;
  receiveDate: string;
  orderDate: string;
  note: string | null;
  cancelReason: string;
  cancelledAt: string;
  customer: {
    fullName: string;
    phone: string;
  };
  address: {
    houseNumber: string;
    street: string;
    ward: string;
    district: string;
  } | null;
  items: OrderItem[];
  paymentLink: PaymentLink;
};

const STATUS_COLOR: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-700",
  NEW: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  PROCESSING: "Đang xử lý",
  NEW: "Đã tiếp nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";

  const d = new Date(dateString);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}`;
};

const formatMoney = (n: number) =>
  Number(n).toLocaleString("vi-VN") + " đ";

type Props = {
  orderId: number | null;
  onClose: () => void;
};

export default function OrderDetailModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openCompleted, setOpenCompleted] = useState(false);

  //format
  function SaltedEggLabel(count: number) {
      if (count === 0) return "Không thêm trứng muối";
      return `${count} trứng muối`;
  }

  function formatPaymentStatus(status: string) {
      if (status === "PENDING") {
          return "Chờ thanh toán";
      } else if (status === "PAID") {
          return "Đã thanh toán";
      } else {
          return "Thanh toán thất bại";
      }
  }

  function formatPaymentStatusClassName(status: string) {
      if (status === "PENDING") {
          return "text-[#FFCC00]";
      } else if (status === "PAID") {
          return "text-[#34C759]";
      } else {
          return "text-[#FF5F57]";
      }
  }

  function formatPaymentStatusIcon(status: string) {
      if (status === "PENDING") {
          return <Clock3 className="w-3.5 h-3.5 text-[#FFCC00]" />;
      } else if (status === "PAID") {
          return <Check className="w-3.5 h-3.5 text-[#34C759]" />;
      } else {
          return <X className="w-3.5 h-3.5 text-[#FF5F57]" />;
      }
  }

  //fetch
  useEffect(() => {
    if (orderId == null) {
      setOrder(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchOrder = async () => {
      try {
        const res = await axiosClient.get(`/booking/${orderId}`);
        setOrder(res as unknown as OrderDetail);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Không thể tải đơn hàng";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (orderId == null) {
      setShowPanel(false);
      return;
    }

    setShowPanel(false);

    const frame = requestAnimationFrame(() => {
      setShowPanel(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [orderId]);

  const refetchOrder = async () => {
    if (orderId == null) return;
    try {
      const res = await axiosClient.get(`/booking/${orderId}`);
      setOrder(res as unknown as OrderDetail);
    } catch {
      toast.error("Không thể cập nhật thông tin đơn hàng");
    }
  };

  const handleOrderStatusUpdated = async () => {
    await refetchOrder();
  };

  const isOpen = orderId != null;
  const statusColor = STATUS_COLOR[order?.status ?? ""] || "bg-gray-100 text-gray-700";
  const statusLabel = STATUS_LABEL[order?.status ?? ""] || order?.status || "";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      containerClassName="items-start justify-end"
      panelClassName="w-[72%] flex flex-row h-[100vh] bg-white shadow-xl overflow-hidden"
    >
      {/* ===== LEFT PANEL ===== */}
      <div className={`w-7/10 h-full flex flex-col overflow-y-auto no-scrollbar transition-transform duration-400 ease-out ${showPanel ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center mb-4 text-[#3D2008] py-6 px-8 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center mr-2
            text-[#3D2008]/75 hover:text-[#C01F1F] transition-colors rounded-full bg-[#3D2008]/4"
          >
            <ChevronLeft size={25} />
          </button>

          <div className="flex flex-col ">
            <div className="flex">
              <p className="font-medium text-[#3D2008]
              text-[19px] sm:text-[20px] md:text-[21px] lg:text-[22px] xl:text-[23px] 2xl:text-[24px]">
                {order ? `Đơn hàng #${order.id}` : "Chi tiết đơn hàng"}
              </p>

              <p className="w-fit h-fit py-1 px-2 font-medium bg-[#8A226F]/25 border border-[#8A226F]/25 text-[#8A226F] ml-4
              text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
              >{order?.paymentMethod === "CASH" ? "Thanh toán khi nhận bánh" : "Chuyển khoản"}</p>
              
              <p className="w-fit h-fit py-1 px-2 font-medium bg-[#8A226F]/25 border border-[#8A226F]/25 text-[#8A226F] ml-2
              text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
              >{order?.shippingMethod === "DELIVERY" ? "Giao đến" : "Đến lấy"}</p>
            </div>
            <div className="flex font-light 
            text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
              <p>Đặt vào <span className="font-medium">{order ? `${formatDate(order.orderDate)}` : ""}</span></p>
              <Dot />
              <p>Nhận vào <span className="font-medium">{order ? `${formatDate(order.receiveDate)}` : ""}</span></p>
            </div>
          </div>
          
          <div className="flex absolute right-2 top-6 justify-end items-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-2 py-10 text-[#3D2008]">
            <LoaderCircle className="h-6 w-6 animate-spin" />
            <p>Đang tải đơn hàng...</p>
          </div>
        )}

        {error && (
          <p className="text-[#FF5F57] text-center py-4">{error}</p>
        )}

        {order && !loading && (
          <div className="flex flex-col gap-4 text-[#3D2008] pl-8 pr-2 pb-6">
            {/* OrderStepper progress */}
            <div className="flex flex-col rounded-2xl border border-[#3D2008]/25">
              <div className="bg-[#3D2008]/4 border-b border-[#3D2008]/25 pb-[2vh] rounded-t-2xl">
                <OrderStepper status={order.status} cancelReason= {order.cancelReason} cancelledAt={order.cancelledAt} />
              </div>
              <div className="flex justify-between items-center p-4 font-semibold
              text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                {(order.status === "PROCESSING" || order.status === "NEW") && (
                  <button onClick={() => setOpenCancel(true)}
                    className="flex gap-1 items-center
                    text-[#C01F1F] [text-decoration-skip-ink:none] underline">
                    <X size={20} />
                    Hủy đơn
                    <OrderCancel
                      orderId={openCancel ? order?.id : null}
                      onClose={() => setOpenCancel(false)}
                      onSuccess={handleOrderStatusUpdated}
                    />
                  </button>
                )} 

                {order.status === "PROCESSING" && (
                  <button onClick={() => setOpenCompleted(true)}      
                  className="px-6 py-4 lg:px-6 lg:py-3
                  border rounded-xl border-[#C01F1F] text-[#FDF6E8] bg-[#C01F1F] hover:bg-[#A61B1B] active:bg-[#8B1515] transition-colors">
                  Hoàn tất đơn
                  <OrderCompleted
                    orderId={openCompleted ? order?.id : null}
                    onClose={() => setOpenCompleted(false)}
                    onSuccess={handleOrderStatusUpdated}
                  />
                </button>
                )}
              </div>
            </div>

            <hr className="border-0 h-px bg-[#3D2008]/25" />

            <div className="bg-[#FFFDF7] text-[#3D2008] rounded-xl drop-shadow-2xl p-4">
              <p className="border-b border-[#3D2008]/25 pb-2 font-medium mb-3">
                Giỏ hàng ({order.items.length})
              </p>
              <div className="flex flex-col gap-2">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.cakeId}-${idx}`}
                    className="rounded-lg  flex justify-between items-center"
                  >
                    <div className="flex gap-2 lg:gap-[1vw] w-full">
                        {/* Picture */}
                        <div className="relative w-15 h-15 shrink-0">
                            <div className="w-full h-full rounded-lg bg-[#D9D9D9] border-4 border-[#FDF6E8]" />
                        </div>

                        <div className="flex justify-between items-center w-full text-[#3D2008]">
                          <div>
                              <h3 className="font-semibold font-vollkorn
                              text-[14px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]"
                              >Bánh Pía</h3>
                              <h4 className="text-[10px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                              >{SaltedEggLabel(item.eggCount)}</h4>
                          </div>
                          <div className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                          >x{item.quantity}</div>
                          <h4 className="font-medium text-[11px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                          {formatMoney(item.priceAtPurchase * item.quantity)}</h4>                      
                        </div>
                    </div>                     
                  </div>
                ))}
              </div>
            </div>

            {order.paymentLink && (
              <div className="bg-[#FFFDF7] rounded-xl drop-shadow-2xl p-4">
                <div className="flex justify-between border-b border-[#3D2008]/25 pb-1">
                  <p className="font-semibold">Thanh toán</p>
                  {/* Payment Status */}
                  {order.paymentMethod === "BANK_TRANSFER" && (
                    <div className="flex items-center gap-1">
                        {formatPaymentStatusIcon(order.paymentLink.status)}
                        <span
                            className={`font-medium text-[6px] sm:text-[7px] md:text-[8px] lg:text-[12px] xl:text-[12px] 2xl:text-[13px] ${formatPaymentStatusClassName(
                                order.paymentLink.status
                            )}`}
                        >
                            {formatPaymentStatus(order.paymentLink.status)}
                        </span>                     
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-sm pt-2">
                  <div className="flex flex-col gap-[2vh] pb-[2vh]
                    text-[12px] sm:text-[12px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                      <div className="flex justify-between">
                          <p>Tạm tính</p>
                          <p>{order.totalMoney.toLocaleString("vi-VN")} đ</p>
                      </div>
                      <div className="flex justify-between">
                          <p>Giảm giá</p>
                          <p> - </p>
                      </div>
                      <div className="flex justify-between">
                          <p> Phí giao hàng</p>
                          <p> - </p>
                      </div>    
                  </div>                    
                  <div className="flex justify-between font-semibold
                    text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
                    <p>Thành tiền</p>
                    <p>
                      {formatMoney(order.totalMoney)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
        
      {/* ===== RIGHT PANEL  ===== */}
      <div className={`w-3/10 h-full text-[#3D2008]  flex flex-col shrink-0 transition-transform duration-400 ease-out ${showPanel ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col gap-3 p-6">
          
          <div className="flex flex-col bg-[#FFFDF7] drop-shadow-2xl rounded-lg py-2 px-4">
            {/* Customer Info */}
            <div className="flex gap-2 pb-1 mb-2 border-b-[1.5px] border-[#3D2008]/25">
              <span className="h-full"> <UserRound size={20}/> </span>

              <div className="flex flex-col gap-1 ">
                <p className="font-medium
                  text-[11px] sm:text-[12px] md:text-[13px] lg:text-[13px] xl:text-[15px] 2xl:text-[16px]"
                >Thông tin khách hàng:</p>
                
                <div className="flex flex-col
                text-[10px] sm:text-[11px] md:text-[12px] lg:text-[12px] xl:text-[14px] 2xl:text-[15px]">
                  <span>{order ? `${order.customer.fullName}` : ``}</span>
                  <span>{order ? `${order.customer.phone}` : ``}</span>
                </div>
              </div>
            </div>
            {/* Shipping method */}
            <div className="flex gap-1 pb-1 mb-2 border-b-[1.5px] border-[#3D2008]/25">
              <span className="h-full"><Package size={20} /> </span>

              <div className="flex flex-col gap-1">
                <p className="font-medium
                  text-[11px] sm:text-[12px] md:text-[13px] lg:text-[12px] xl:text-[15px] 2xl:text-[16px]"
                >Phương thức nhận bánh:</p>

                <span className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[11px] xl:text-[14px] 2xl:text-[15px]"
                >{order?.shippingMethod === "DELIVERY" ? "Giao đến" : "Đến lấy"}</span>
              </div>
            </div>
            {/* Payment method */}
            <div className="flex pb-1 gap-1">
              <span className="h-full"><ReceiptText size={20} /> </span>

              <div className="flex flex-col gap-1 ">
                <p className="font-medium
                  text-[11px] sm:text-[12px] md:text-[13px] lg:text-[12px] xl:text-[15px] 2xl:text-[16px]"
                >Phương thức thanh toán:</p>

                <span className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[11px] xl:text-[14px] 2xl:text-[15px]"
                >{order?.paymentMethod === "CASH" ? "Thanh toán khi nhận bánh" : "Chuyển khoản"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-[#FFFDF7] drop-shadow-2xl rounded-lg py-2 px-4">
            <p className="font-medium
                text-[11px] sm:text-[12px] md:text-[13px] lg:text-[12px] xl:text-[15px] 2xl:text-[16px]"
              >Ghi chú cho đơn bánh:</p>
            <span className={`text-[10px] sm:text-[11px] md:text-[12px] lg:text-[11px] xl:text-[14px] 2xl:text-[15px]
            ${!order?.note ? "text-[#3D2008]/75" : ""}`}
            >{order?.note ? `${order?.note}` : "Không ghi chú"}</span>

          </div>
              
        </div>
        
      </div>  
    </Modal>
  );
}
