"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, Clock3, Dot, Package, ReceiptText, UserRound, X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosClient } from "@/src/api/axios-client";
import OrderStepper from "@/src/app/landing/MyOrder/OrderStepper";
import MobileOrderActions from "./mb-OrderActions";
import { paymentLabel, shippingLabel} from "../mobile/mb-types";

type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

type OrderItem = {
  cakeId: number;
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
  items: OrderItem[];
  paymentLink: PaymentLink;
};

const statusLabel: Record<OrderStatus, string> = {
  NEW: "Đã tiếp nhận",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Đã nhận",
  CANCELLED: "Đã hủy",
};

const statusClass: Record<OrderStatus, string> = {
  NEW: "bg-[#0088FF]/25 text-[#0088FF]",
  PROCESSING:"bg-[#FFCC00]/25 text-[#FFCC00]",
  COMPLETED: "bg-[#34C759]/25 text-[#34C759]",
  CANCELLED: "bg-[#FF5F57]/25 text-[#FF5F57]",
};
  function formatPaymentStatusClassName(status: string) {
      if (status === "PENDING") {
          return "text-[#FFCC00]";
      } else if (status === "PAID") {
          return "text-[#34C759]";
      } else {
          return "text-[#FF5F57]";
      }
  }

type Props = {
  orderId: number;
};

export default function MobileOrderDetailPage({ orderId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const context = searchParams.toString();

  //format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const d = new Date(dateString);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");

    return `${day}/${month}`;
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
  const load = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/booking/${orderId}`);
      setOrder(response as unknown as OrderDetail);
    } catch {
      toast.error("Không thể tải chi tiết đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [orderId]);

  const handleBack = () => {
    router.push(`/admin/dashboard${context ? `?${context}` : ""}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFFDF7] p-6 text-center text-sm text-[#3D2008]">
        Đang tải đơn hàng...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#FFFDF7] p-6">
        <button type="button" onClick={handleBack}>
          Quay lại
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF7] pb-30 text-[#3D2008]">
      <div className="mx-auto w-[90vw] max-w-md py-5">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-[15px] font-medium"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3D2008]/4">
            <ChevronLeft size={25} />
          </span>
          Quay lại
        </button>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col item">
            <h1 className="text-lg font-semibold pl-1">Đơn hàng #{order.id}</h1>

            <div className="flex gap-1 font-medium text-[11px]">
              <span className="rounded bg-[#8A226F]/10 px-2 py-1 text-[#8A226F] ">
                {paymentLabel(order.paymentMethod)}
              </span>
              <span className="rounded bg-[#8A226F]/10 px-2 py-1 text-[#8A226F]">
                {shippingLabel(order.shippingMethod)}
              </span>
            </div>

            <div className="flex font-light items-center pl-1 text-[13px]">
              <p>Đặt vào <span className="font-medium">{order ? `${formatDate(order.orderDate)}` : ""}</span></p>
              <Dot />
              <p>Nhận vào <span className="font-medium">{order ? `${formatDate(order.receiveDate)}` : ""}</span></p>
            </div>
          </div>

          <span className={`rounded-full px-2 py-1 text-xs ${statusClass[order.status]}`}>
            {statusLabel[order.status]}
          </span>
        </div>

        <section className="mt-4 rounded-2xl drop-shadow-xl bg-white p-4">
          <div className="flex gap-2">
            <UserRound />
            <span>
              <p className="font-medium text-[15px]">  Thông tin khách hàng</p>
              <p className="mt-2 text-sm">{order.customer.fullName}</p>
              <p className="text-sm text-[#3D2008]">{order.customer.phone}</p>
            </span>
          </div>

          <div className="flex gap-2 mt-3 border-t border-[#3D2008]/15 pt-3 text-sm">
            <Package />
            <span>
              <p className="font-medium text-[15px]">Phương thức nhận bánh</p>
              <p className="mt-1 text-sm">{order.shippingMethod === "DELIVERY" ? "Giao đến" : "Đến lấy"}</p>
            </span>
          </div>
          
          <div className="flex gap-2 mt-3 border-t border-[#3D2008]/15 pt-3 text-sm">
            <ReceiptText />
            <span>
              <p className="font-medium text-[15px]">Phương thức thanh toán</p>
              <p className="mt-1 text-sm"> {order.paymentMethod === "CASH" ? "Thanh toán khi nhận bánh" : "Chuyển khoản"} </p>
            </span>
          </div>  
        </section>

        <section className="mt-4 rounded-2xl drop-shadow-xl bg-white p-4">
          <p className="font-medium text-[15px]">Ghi chú cho đơn bánh</p>
          {order.note ? (
            <p className="mt-2 text-[#3D2008]/65">{order.note}</p>
          ) : (<p className="mt-2 text-[#3D2008]/65">không có ghi chú</p>)}
        </section>

        <section className="mt-4 rounded-2xl drop-shadow-xl bg-white p-4">
          <OrderStepper
            status={order.status}
            cancelReason={order.cancelReason}
            cancelledAt={order.cancelledAt}
          />
        </section>

        <section className="mt-4 rounded-2xl drop-shadow-xl bg-white p-4">
          <h2 className="font-semibold">Giỏ hàng ({order.items.length})</h2>
          {order.items.map((item, index) => (
            <div
              key={`${item.cakeId}-${item.eggCount}-${index}`}
              className="mt-3 flex justify-between border-t border-[#3D2008]/10 pt-3 text-sm"
            >              
              <div className="flex gap-3 items-center w-full">
                <div className="relative w-15 h-15 shrink-0">
                  <div className="w-full h-full rounded-lg bg-[#D9D9D9] border-4 border-[#FDF6E8]" />
                </div>

                <div className="flex justify-between w-full">
                  <span className="w-full">
                    <p>Bánh Pía</p>
                    <div>
                      <div className="flex justify-between w-full font-light text-[#3D2008]/75"
                        >{item.eggCount ? `${item.eggCount} trứng muối` : "Không thêm trứng"} 
                        <p>x{item.quantity}</p>
                        <p className="text-[#3D2008] font-medium">{(item.priceAtPurchase * item.quantity).toLocaleString("vi-VN")} đ</p>
                      </div>
                    </div>
                  </span>
                  
                </div>
              </div>

            </div>
          ))}         
        </section>
          
        <section className="mt-4 rounded-2xl drop-shadow-xl bg-white p-4">
          <div className="mt-4 flex justify-between border-b border-[#3D2008]/20 pb-3 font-semibold">
            <span className="text-[16px]">Thanh toán</span>
              {/* Payment Status */}
              {order.paymentLink &&  order.paymentMethod === "BANK_TRANSFER" && (
                <div className="flex items-center gap-1 ">
                    {formatPaymentStatusIcon(order.paymentLink.status)}
                    <span
                        className={`font-medium text-[12px] ${formatPaymentStatusClassName(
                            order.paymentLink.status
                        )}`}
                    >
                        {formatPaymentStatus(order.paymentLink.status)}
                    </span>                     
                </div>
              )}
          </div>

          <div className="flex flex-col gap-1.5 text-sm pt-2">
            <div className="flex flex-col gap-[2vh] pb-[2vh] border-b border-[#3D2008]/20 text-[15px]">
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
            <div className="flex justify-between font-semibold text-[16 px]">
              <p>Thành tiền</p>
              <p>{order.totalMoney.toLocaleString("vi-VN")} đ</p>
            </div>
          </div> 
        </section>
      </div>

      <MobileOrderActions
        orderId={order.id}
        status={order.status}
        onSuccess={load}
      />
    </main>
  );
}
