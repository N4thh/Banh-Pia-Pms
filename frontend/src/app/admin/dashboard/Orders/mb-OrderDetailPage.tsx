"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Dot, Package, ReceiptText, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { axiosClient } from "@/src/api/axios-client";
import OrderStepper from "@/src/app/landing/MyOrder/OrderStepper";
import OrderCancel from "./OrderCancel";
import OrderCompleted from "./OrderCompleted";
import { formatShortDate, paymentLabel, shippingLabel} from "../mobile/mb-types";

type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

type OrderItem = {
  cakeId: number;
  quantity: number;
  eggCount: number;
  priceAtPurchase: number;
};

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
};

const statusLabel: Record<OrderStatus, string> = {
  NEW: "Đã tiếp nhận",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Đã nhận",
  CANCELLED: "Đã hủy",
};

const statusClass: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

type Props = {
  orderId: number;
};

export default function MobileOrderDetailPage({ orderId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const context = searchParams.toString();

  //format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const d = new Date(dateString);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");

    return `${day}/${month}`;
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
    <main className="min-h-screen bg-[#FFFDF7] pb-8 text-[#3D2008]">
      <div className="mx-auto w-[90vw] max-w-md py-5">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-sm font-medium"
        >
          <ChevronLeft size={18} />
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

          {(order.status === "NEW" || order.status === "PROCESSING") && (
            <div className="mt-4 flex items-center justify-between border-t border-[#3D2008]/15 pt-3">
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="text-sm font-semibold text-[#C01F1F]"
              >
                Hủy đơn
              </button>
              {order.status === "PROCESSING" && (
                <button
                  type="button"
                  onClick={() => setCompleteOpen(true)}
                  className="rounded-lg bg-[#C01F1F] px-3 py-2 text-sm font-semibold text-[#FDF6E8]"
                >
                  Hoàn tất đơn
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mt-4 rounded-2xl drop-shadow-xl bg-white p-4">
          <h2 className="font-semibold">Giỏ hàng ({order.items.length})</h2>
          {order.items.map((item, index) => (
            <div
              key={`${item.cakeId}-${item.eggCount}-${index}`}
              className="mt-3 flex justify-between border-t border-[#3D2008]/10 pt-3 text-sm"
            >
              <span>
                Bánh Pía
                <br />
                <small>
                  {item.eggCount ? `${item.eggCount} trứng muối` : "Không thêm trứng"} x{item.quantity}
                </small>
              </span>
              <strong>{(item.priceAtPurchase * item.quantity).toLocaleString("vi-VN")} đ</strong>
            </div>
          ))}

          <div className="mt-4 flex justify-between border-t border-[#3D2008]/20 pt-3 font-semibold">
            <span>Thành tiền</span>
            <span>{Number(order.totalMoney).toLocaleString("vi-VN")} đ</span>
          </div>
        </section>
      </div>

      <OrderCancel
        orderId={cancelOpen ? order.id : null}
        onClose={() => setCancelOpen(false)}
        onSuccess={load}
      />
      <OrderCompleted
        orderId={completeOpen ? order.id : null}
        onClose={() => setCompleteOpen(false)}
        onSuccess={load}
      />
    </main>
  );
}
