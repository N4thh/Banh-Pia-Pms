"use client";

import { useEffect, useState } from "react";
import { axiosClient } from "@/src/api/axios-client";
import Modal from "@/src/components/Modal";
import { LoaderCircle, X } from "lucide-react";

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
  status: string;
  shippingMethod: string;
  paymentMethod: string;
  receiveDate: string;
  orderDate: string;
  note: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
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
  NEW: "Chờ xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

  const isOpen = orderId != null;
  const statusColor = STATUS_COLOR[order?.status ?? ""] || "bg-gray-100 text-gray-700";
  const statusLabel = STATUS_LABEL[order?.status ?? ""] || order?.status || "";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      containerClassName="items-start justify-end"
      panelClassName="flex flex-col w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[40vw] h-[95vh] bg-white rounded-2xl shadow-xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-[#3D2008] text-lg">
          {order ? `Đơn hàng #${order.id}` : "Chi tiết đơn hàng"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-[#3D2008]/75 hover:text-[#C01F1F] transition-colors"
        >
          <X size={20} />
        </button>
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
        <div className="flex flex-col gap-4 text-[#3D2008]">
          {/* Status badge */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#3D2008]/75">
              Mã đơn: <span className="font-semibold text-[#3D2008]">#{order.id}</span>
            </p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Customer info */}
          <div className="border rounded-xl p-4">
            <p className="border-b border-[#3D2008]/25 pb-2 font-medium mb-3">
              Thông tin khách hàng
            </p>
            <div className="flex flex-col gap-1.5 text-sm">
              <p>
                <span className="text-[#3D2008]/75">Họ tên: </span>
                <span className="font-medium">{order.customer.fullName}</span>
              </p>
              <p>
                <span className="text-[#3D2008]/75">SĐT: </span>
                <span className="font-medium">{order.customer.phone}</span>
              </p>
              {order.address && (
                <p>
                  <span className="text-[#3D2008]/75">Địa chỉ: </span>
                  <span className="font-medium">
                    {order.address.houseNumber}, Đường {order.address.street}, Phường {order.address.ward}, Quận {order.address.district}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Time + payment */}
          <div className="border rounded-xl p-4">
            <p className="border-b border-[#3D2008]/25 pb-2 font-medium mb-3">
              Thời gian & thanh toán
            </p>
            <div className="flex flex-col gap-1.5 text-sm">
              <p>
                <span className="text-[#3D2008]/75">Ngày đặt: </span>
                <span className="font-medium">{formatDate(order.orderDate)}</span>
              </p>
              <p>
                <span className="text-[#3D2008]/75">Ngày nhận: </span>
                <span className="font-medium">{formatDate(order.receiveDate)}</span>
              </p>
              <p>
                <span className="text-[#3D2008]/75">Thanh toán: </span>
                <span className="font-medium">
                  {order.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : "Tiền mặt khi nhận"}
                </span>
              </p>
              <p>
                <span className="text-[#3D2008]/75">Nhận hàng: </span>
                <span className="font-medium">
                  {order.shippingMethod === "DELIVERY" ? "Giao tận nơi" : "Tự đến lấy"}
                </span>
              </p>
              {order.cancelledAt && (
                <p className="text-[#FF5F57]">
                  <span className="text-[#3D2008]/75">Hủy lúc: </span>
                  <span className="font-medium">{formatDate(order.cancelledAt)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="border rounded-xl p-4">
            <p className="border-b border-[#3D2008]/25 pb-2 font-medium mb-3">
              Bánh trong đơn ({order.items.length})
            </p>
            <div className="flex flex-col gap-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.cakeId}-${idx}`}
                  className="border rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                  <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[#3D2008]/75">
                      {item.quantity} bánh, {item.eggCount} trứng muối
                    </p>
                  </div>
                  <p className="font-medium text-sm">
                    {formatMoney(item.priceAtPurchase * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border rounded-xl p-4 flex justify-between items-center">
            <p className="font-medium">Tổng tiền</p>
            <p className="font-semibold text-lg text-[#C01F1F]">
              {formatMoney(order.totalMoney)}
            </p>
          </div>

          {/* Payment link */}
          {order.paymentLink && (
            <div className="border rounded-xl p-4">
              <p className="border-b border-[#3D2008]/25 pb-2 font-medium mb-3">
                Thanh toán
              </p>
              <div className="flex flex-col gap-1.5 text-sm">
                <p>
                  <span className="text-[#3D2008]/75">Đã thanh toán: </span>
                  <span className="font-medium">
                    {formatMoney(order.paymentLink.amountPaid)}
                  </span>
                </p>
                <p>
                  <span className="text-[#3D2008]/75">Còn lại: </span>
                  <span className="font-medium">
                    {formatMoney(order.paymentLink.amountRemaining)}
                  </span>
                </p>
                <p>
                  <span className="text-[#3D2008]/75">Trạng thái: </span>
                  <span className="font-medium">{order.paymentLink.status}</span>
                </p>
              </div>
            </div>
          )}

          {/* Note */}
          {order.note && (
            <div className="border rounded-xl p-4">
              <p className="border-b border-[#3D2008]/25 pb-2 font-medium mb-3">Ghi chú</p>
              <p className="text-sm">{order.note}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
