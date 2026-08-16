"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, Dot, Minus, PencilLine, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { axiosClient } from "@/src/api/axios-client";
import MobileSheet from "./mb-MobileSheet";
import { motion } from "framer-motion";
import {
  calculateTotal,
  formatShortDateWeek,
  paymentLabel,
  shippingLabel,
  STATUS_META,
  STATUS_ORDER,
  OrderStatus,
  OrderSummary,
  SlotDate,
  SlotDetail,
} from "./mb-types";

type OrderListProps = {
  slot: SlotDate;
  refreshKey: number;
  initialStatus?: OrderStatus | null;
};

export default function OrderList({
  slot,
  refreshKey,
  initialStatus,
}: OrderListProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus>(
    initialStatus && STATUS_ORDER.includes(initialStatus) ? initialStatus : "NEW",
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [slotDetail, setSlotDetail] = useState<SlotDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: slot.date,
        cakeId: String(slot.cake.cakeId),
        page: "1",
      });
      const result = (await axiosClient.get(
        `/admin/orders-by-slot?${params}`,
      )) as { orders: OrderSummary[] };
      setOrders(result.orders);

      const info = (await axiosClient.get(
        `/availability/slots?date=${slot.date}&cakeId=${slot.cake.cakeId}`,
      )) as SlotDetail;
      setSlotDetail(info);
    } catch {
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [slot.date, slot.cake.cakeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load, refreshKey]);

  const selectedCake = slotDetail?.cakes.find(
    (cake) => cake.id === slot.cake.cakeId,
  );

  const saveQuantity = async () => {
    if (!selectedCake || quantity < selectedCake.currentBooked) return;
    setSaving(true);
    try {
      await axiosClient.patch("/availability/edit", {
        date: slot.date,
        cakeId: slot.cake.cakeId,
        newMaxCapacity: quantity,
      });
      toast.success("Cập nhật số lượng bánh thành công");
      setEditing(false);
      await load();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders.filter((order) => order.status === status);

  return (
    <section className="mt-6">
      <h2 className="font-semibold text-[22px]">Đơn bánh</h2>
      <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 mt-1 text-[14px] text-[#3D2008] font-semibold">
            <CalendarDays size={18} /> {formatShortDateWeek(slot.date)}
          </p>
        <button
          type="button"
          onClick={() => {
            setQuantity(selectedCake?.maxCapacity ?? 0);
            setEditing(true);
          }}
          className="flex items-center gap-2 text-[16px] font-medium"
        >
          {slotDetail
            ? `${slotDetail.totalBooked}/${slotDetail.totalMax}`
            : "Sửa số lượng"}
          <PencilLine size={15} />
        </button>
      </div>

      <div className="mt-4 flex w-full rounded-4xl bg-[#3D2008]/8 px-2 py-1">
        {STATUS_ORDER.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setStatus(item)}
            className="relative flex-auto rounded-4xl px-3 py-2 text-[13px] font-medium whitespace-nowrap text-center z-10"
          >
            {status === item && (
              <motion.div
                layoutId="status-indicator"
                className="absolute inset-0 rounded-4xl bg-[#C01F1F] -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={status === item ? "text-[#FDF6E8]" : "text-[#3D2008]/55"}>
              {STATUS_META[item].label}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[#3D2008]/60">
          Đang tải đơn...
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filteredOrders.map((order) => {
            const isExpanded = expanded === order.orderId;
            return (
              <article
                key={order.orderId}
                className="border rounded-2xl border-[#3D2008]/20 bg-white p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isExpanded ? null : order.orderId)
                  }
                  className="flex w-full items-center justify-between"
                >
                  <span className="font-medium text-[16px]">Đơn bánh #{order.orderId}</span>
                  <ChevronDown
                    size={18}
                    className={isExpanded ? "rotate-180" : ""}
                  />
                </button>

                <div className="mt-3 flex justify-between gap-2 text-xs">
                  <div className="flex gap-1 font-medium text-[11px]">
                    <span className="rounded bg-[#8A226F]/10 px-2 py-1 text-[#8A226F] ">
                      {paymentLabel(order.paymentMethod)}
                    </span>
                    <span className="rounded bg-[#8A226F]/10 px-2 py-1 text-[#8A226F]">
                      {shippingLabel(order.shippingMethod)}
                    </span>
                  </div>
             
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${STATUS_META[order.status].className}`}
                  >
                    {STATUS_META[order.status].label}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-4  border-[#3D2008]/25">
                    <p className="font-medium text-[16px]">Giỏ hàng:</p>
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="mt-2 flex justify-between text-[15px]"
                      >
                        <span className="flex justify-between">Bánh Pía </span>
                        <span className="flex items-center"> <Dot/> {item.eggCount ? `${item.eggCount} trứng muối` : ""}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t-[1.5px] border-dashed border-[#3D2008]/25 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3D2008]/75 text-[15px]">Thanh toán</span>
                    <strong className="text-[#007AFF] font-medium text-lg">
                      {calculateTotal(order.items).toLocaleString("vi-VN")} đ
                    </strong>
                  </div>
                  {isExpanded && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/dashboard/Orders/${order.orderId}?tab=orders&date=${slot.date}&cakeId=${slot.cake.cakeId}&status=${status}`,
                        )
                      }
                      className="mt-3 w-full rounded-lg border border-[#C01F1F] py-2 text-sm font-semibold text-[#C01F1F]"
                    >
                      Chi tiết
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {filteredOrders.length === 0 && (
            <p className="py-8 text-center text-sm text-[#3D2008]/60">
              Không có đơn hàng
            </p>
          )}
        </div>
      )}

      {editing && (
        <MobileSheet open onClose={() => !saving && setEditing(false)}
        panelClassName ="h-[33vh]">
          <p className="flex items-center gap-2 mt-1 text-[#3D2008] font-semibold text-[16px]">
             {formatShortDateWeek(slot.date)}
          </p>
          <p className="mt-2 text-sm">
            Vui lòng đặt giới hạn bánh sẽ bán trong ngày
          </p>
          <div className="mt-5 flex items-center justify-between">
            <span>Số lượng bánh</span>
            <div className="flex items-center gap-2 rounded-full border border-[#3D2008] p-1 font-medium">
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(selectedCake?.currentBooked ?? 0, value - 1),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8]"
              >
                <Minus size={20} />
              </button>
              <input
                className="w-8 bg-transparent text-center outline-none"
                value={quantity}
                onChange={(event) =>
                  setQuantity(Number(event.target.value) || 0)
                }
              />
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8]"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveQuantity}
            className="mt-6 w-full rounded-lg py-3 font-semibold 
            bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors text-[14px] disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </MobileSheet>
      )}
    </section>
  );
}
