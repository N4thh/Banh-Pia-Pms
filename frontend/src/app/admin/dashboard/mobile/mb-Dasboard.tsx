"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import { ChevronDown, LogOut, Minus, PencilLine, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosClient } from "@/src/api/axios-client";
import Modal from "@/src/components/Modal";
import StatForm from "../Stats/StatForm";
import StatsCalendar, { StatsWeekSelection } from "../Stats/StatsCalendar";

registerLocale("vi", vi);

type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";
type AdminStats = {
  totalRevenue: number | string;
  totalOrders: number;
  totalQuantityCakesSold: number;
  totalToday: number;
  totalCakeToday: number;
  pendingToday: number;
  pendingCakeToday: number;
};
type SlotCake = {
  cakeId: number;
  cakeName: string;
  maxCapacity: number;
  currentBooked: number;
  bufferLimit: number;
};
type SlotDate = { date: string; cake: SlotCake; orderCount: number };
type WeekGroup = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  slots: SlotDate[];
};
type OrderItem = {
  cakeId?: number;
  name?: string;
  quantity: number;
  eggCount: number;
  priceAtPurchase: number;
};
type OrderSummary = {
  orderId: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingMethod: string;
  items: OrderItem[];
};
type SlotDetail = {
  totalMax: number;
  totalBooked: number;
  cakes: { id: number; maxCapacity: number; currentBooked: number }[];
};

type Props = {
  onLogout: () => void;
  stats: AdminStats | null;
  weeks: WeekGroup[];
  selectedSlot: SlotDate | null;
  openWeekNumber: number | null;
  onToggleWeek: (weekNumber: number) => void;
  onSelectSlot: (slot: SlotDate) => void;
  onCreateSlot: (date: string, capacity: number) => Promise<boolean>;
  slotError: string | null;
  ordersRefreshKey: number;
};

const STATUS_ORDER: OrderStatus[] = [
  "NEW",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];
const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  NEW: { label: "Đã tiếp nhận", className: "bg-[#0088FF]/15 text-[#0074DB]" },
  PROCESSING: {
    label: "Đang xử lý",
    className: "bg-[#FFCC00]/20 text-[#9A7100]",
  },
  COMPLETED: { label: "Đã nhận", className: "bg-[#34C759]/15 text-[#178A36]" },
  CANCELLED: { label: "Đã hủy", className: "bg-[#FF5F57]/15 text-[#C73832]" },
};
const formatShortDate = (date: string) => {
  const [, month, day] = date.split("-");
  return `${Number(day)}/${Number(month)}`;
};
const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const calculateTotal = (items: OrderItem[]) =>
  items.reduce(
    (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
    0,
  );
const paymentLabel = (method: string) =>
  method === "CASH" ? "Thanh toán khi nhận bánh" : "Chuyển khoản";
const shippingLabel = (method: string) =>
  method === "DELIVERY" ? "Giao đến" : "Đến lấy";

function MobileSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [render, setRender] = useState(open);
  const [visible, setVisible] = useState(false);
  const startY = useRef(0);
  const deltaY = useRef(0);
  const dragging = useRef(false);
  useEffect(() => {
    if (open) {
      setRender(true);
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setRender(false), 250);
    return () => clearTimeout(timer);
  }, [open]);
  if (!render) return null;
  return (
    <Modal
      open={render}
      onClose={onClose}
      panelClassName={`fixed inset-x-0 bottom-0 m-0 flex h-[88vh] w-full max-w-none flex-col rounded-t-2xl rounded-b-none bg-[#FFFDF7] text-[#3D2008] shadow-2xl transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div
        className="flex justify-center py-3 touch-none"
        onPointerDown={(event) => {
          dragging.current = true;
          startY.current = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          deltaY.current = Math.max(0, event.clientY - startY.current);
        }}
        onPointerUp={() => {
          dragging.current = false;
          if (deltaY.current > 140) onClose();
          deltaY.current = 0;
        }}
      >
        <span className="h-1.5 w-14 rounded-full bg-[#3D2008]/25" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-[5vw] pb-6">
        {children}
      </div>
    </Modal>
  );
}

function CalendarContent({
  weeks,
  selectedSlot,
  openWeekNumber,
  onToggleWeek,
  onSelectSlot,
  onAdd,
}: Pick<
  Props,
  "weeks" | "selectedSlot" | "openWeekNumber" | "onToggleWeek" | "onSelectSlot"
> & { onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      {weeks.length === 0 && (
        <p className="py-8 text-center text-sm text-[#3D2008]/60">
          Chưa có slot sắp tới
        </p>
      )}
      {weeks.map((week) => (
        <div key={week.weekStart} className="border-b border-[#3D2008]/20">
          <button
            type="button"
            onClick={() => onToggleWeek(week.weekNumber)}
            className="flex w-full items-center justify-between py-3 text-left text-sm"
          >
            <span className="font-semibold">Tuần {week.weekNumber}</span>
            <span>
              {formatShortDate(week.weekStart)} -{" "}
              {formatShortDate(week.weekEnd)}
            </span>
            <ChevronDown
              size={18}
              className={openWeekNumber === week.weekNumber ? "rotate-180" : ""}
            />
          </button>
          {openWeekNumber === week.weekNumber && (
            <div className="flex flex-col gap-2 pb-3">
              {week.slots.map((slot) => {
                const active =
                  selectedSlot?.date === slot.date &&
                  selectedSlot.cake.cakeId === slot.cake.cakeId;
                return (
                  <button
                    key={`${slot.date}-${slot.cake.cakeId}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`rounded-lg border p-3 text-left ${active ? "border-[#3D2008] bg-[#3D2008] text-[#FDF6E8]" : "border-[#3D2008]/20 bg-white"}`}
                  >
                    <div className="flex justify-between font-medium">
                      <span>
                        {new Date(`${slot.date}T00:00:00`).toLocaleDateString(
                          "vi-VN",
                          { weekday: "long" },
                        )}
                      </span>
                      <span>{slot.orderCount} đơn</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs opacity-75">
                      <span>{formatShortDate(slot.date)}</span>
                      <span>{slot.cake.currentBooked} bánh</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#C01F1F] px-4 py-3 font-semibold text-[#FDF6E8]"
      >
        <Plus size={18} />
        Thêm slot mới
      </button>
    </div>
  );
}

function SlotForm({
  title,
  onClose,
  onSave,
  error,
}: {
  title: string;
  onClose: () => void;
  onSave: (date: string, quantity: number) => Promise<boolean>;
  error: string | null;
}) {
  const [date, setDate] = useState(new Date());
  const [quantity, setQuantity] = useState(10);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const saved = await onSave(toDateInput(date), quantity);
    setSaving(false);
    if (saved) onClose();
  };
  return (
    <MobileSheet open onClose={onClose}>
      <div className="flex items-center justify-between border-b border-[#3D2008]/15 pb-3">
        <h2 className="font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>
      </div>
      <div className="mt-5 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Ngày bán
          <DatePicker
            selected={date}
            onChange={(value: Date | null) => value && setDate(value)}
            locale="vi"
            dateFormat="dd/MM/yyyy"
            className="w-full rounded-lg border border-[#3D2008]/25 bg-white px-3 py-3 outline-none"
          />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Số lượng bánh</span>
          <div className="flex items-center gap-3 rounded-full border border-[#3D2008] px-1 py-1">
            <button
              type="button"
              disabled={quantity <= 1 || saving}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8]"
            >
              <Minus size={16} />
            </button>
            <input
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value) || 1))
              }
              className="w-10 bg-transparent text-center outline-none"
              inputMode="numeric"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => setQuantity((value) => value + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-[#C01F1F]">{error}</p>}
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-lg bg-[#C01F1F] px-4 py-3 font-semibold text-[#FDF6E8] disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </MobileSheet>
  );
}

function MobileOrders({
  slot,
  refreshKey,
  initialStatus,
}: {
  slot: SlotDate;
  refreshKey: number;
  initialStatus?: OrderStatus | null;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus>("NEW");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [slotDetail, setSlotDetail] = useState<SlotDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [saving, setSaving] = useState(false);
  const load = async () => {
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
  };
  useEffect(() => {
    if (initialStatus && STATUS_ORDER.includes(initialStatus))
      setStatus(initialStatus);
  }, [initialStatus]);
  useEffect(() => {
    void load();
  }, [slot.date, slot.cake.cakeId, refreshKey]);
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
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Đơn bánh</h2>
          <p className="mt-1 text-sm text-[#3D2008]/65">
            {formatShortDate(slot.date)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setQuantity(selectedCake?.maxCapacity ?? 0);
            setEditing(true);
          }}
          className="flex items-center gap-1 text-sm font-medium"
        >
          <PencilLine size={17} />
          {slotDetail
            ? `${slotDetail.totalBooked}/${slotDetail.totalMax}`
            : "Sửa số lượng"}
        </button>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto border-b border-[#3D2008]/15 pb-2 no-scrollbar">
        {STATUS_ORDER.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setStatus(item)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${status === item ? "bg-[#3D2008] text-[#FDF6E8]" : "bg-[#3D2008]/8 text-[#3D2008]/55"}`}
          >
            {STATUS_META[item].label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="py-10 text-center text-sm text-[#3D2008]/60">
          Đang tải đơn...
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders
            .filter((order) => order.status === status)
            .map((order) => {
              const isExpanded = expanded === order.orderId;
              return (
                <article
                  key={order.orderId}
                  className="border border-[#3D2008]/20 bg-white p-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(isExpanded ? null : order.orderId)
                    }
                    className="flex w-full items-center justify-between"
                  >
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_META[order.status].className}`}
                    >
                      {STATUS_META[order.status].label}
                    </span>
                    <ChevronDown
                      size={18}
                      className={isExpanded ? "rotate-180" : ""}
                    />
                  </button>
                  <div className="mt-3 flex justify-between gap-2 text-xs">
                    <div className="flex flex-wrap gap-1">
                      <span className="rounded bg-[#8A226F]/10 px-2 py-1 text-[#8A226F]">
                        {paymentLabel(order.paymentMethod)}
                      </span>
                      <span className="rounded bg-[#8A226F]/10 px-2 py-1 text-[#8A226F]">
                        {shippingLabel(order.shippingMethod)}
                      </span>
                    </div>
                    <span className="shrink-0">
                      {STATUS_META[order.status].label}
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 border-t border-dashed border-[#3D2008]/25 pt-3">
                      <p className="font-medium">Giỏ hàng</p>
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="mt-2 flex justify-between text-sm"
                        >
                          <span>
                            Bánh Pía{" "}
                            {item.eggCount ? `(${item.eggCount} trứng)` : ""} x
                            {item.quantity}
                          </span>
                          <span>
                            {(
                              item.priceAtPurchase * item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            đ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 border-t border-dashed border-[#3D2008]/25 pt-3">
                    <div className="flex justify-between text-sm">
                      <span>Thanh toán</span>
                      <strong className="text-[#007AFF]">
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
          {orders.filter((order) => order.status === status).length === 0 && (
            <p className="py-8 text-center text-sm text-[#3D2008]/60">
              Không có đơn hàng
            </p>
          )}
        </div>
      )}
      {editing && (
        <MobileSheet open onClose={() => !saving && setEditing(false)}>
          <h2 className="font-semibold">Sửa số lượng bánh</h2>
          <p className="mt-2 text-sm">
            Số lượng không thể thấp hơn số bánh đã đặt (
            {selectedCake?.currentBooked ?? 0}).
          </p>
          <div className="mt-5 flex items-center justify-between">
            <span>Số lượng bánh</span>
            <div className="flex items-center gap-3 rounded-full border border-[#3D2008] p-1">
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(selectedCake?.currentBooked ?? 0, value - 1),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8]"
              >
                <Minus size={16} />
              </button>
              <input
                className="w-10 bg-transparent text-center outline-none"
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
                <Plus size={16} />
              </button>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveQuantity}
            className="mt-6 w-full rounded-lg bg-[#C01F1F] py-3 font-semibold text-[#FDF6E8]"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </MobileSheet>
      )}
    </section>
  );
}

function KpiPair({
  left,
  right,
}: {
  left: [string, string, string];
  right: [string, string, string];
}) {
  const renderMetric = ([label, value, detail]: [string, string, string]) => (
    <div className="min-w-0 flex-1">
      <p className="text-xs text-[#3D2008]/65">{label}</p>
      <p className="mt-1 truncate text-base font-semibold">{value}</p>
      <p className="mt-1 text-[11px] text-[#3D2008]/60">{detail}</p>
    </div>
  );

  return (
    <div className="flex w-full gap-3 border border-[#3D2008]/15 bg-white p-4 shadow-sm">
      {renderMetric(left)}
      <div className="w-px bg-[#3D2008]/15" />
      {renderMetric(right)}
    </div>
  );
}

export default function MobileAdminDashboard(props: Props) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"orders" | "stats">(
    searchParams.get("tab") === "stats" ? "stats" : "orders",
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [statsCalendarOpen, setStatsCalendarOpen] = useState(false);
  const [statsSelection, setStatsSelection] = useState<
    StatsWeekSelection | undefined
  >();
  const [addOpen, setAddOpen] = useState(false);
  const restoreDate = searchParams.get("date");
  const restoreCakeId = Number(searchParams.get("cakeId"));
  const restoreStatus = searchParams.get("status");
  useEffect(() => {
    if (!restoreDate || !Number.isInteger(restoreCakeId)) return;
    const slot = props.weeks
      .flatMap((week) => week.slots)
      .find(
        (item) =>
          item.date === restoreDate && item.cake.cakeId === restoreCakeId,
      );
    if (
      slot &&
      (props.selectedSlot?.date !== slot.date ||
        props.selectedSlot.cake.cakeId !== slot.cake.cakeId)
    )
      props.onSelectSlot(slot);
  }, [
    props.weeks,
    props.selectedSlot,
    props.onSelectSlot,
    restoreDate,
    restoreCakeId,
  ]);
  const weekLabel = useMemo(() => {
    const slots = props.weeks
      .flatMap((week) => week.slots)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!slots.length) return "Chưa có slot";
    const start = slots[0].date;
    const selected = props.selectedSlot?.date ?? start;
    const startDate = new Date(`${start}T00:00:00Z`);
    const selectedDate = new Date(`${selected}T00:00:00Z`);
    const offset = Math.max(
      0,
      Math.floor((selectedDate.getTime() - startDate.getTime()) / 86400000),
    );
    const week = Math.floor(offset / 7) + 1;
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + week * 7 - 1);
    return `Hiện: Tuần ${week} - ${formatShortDate(start)} - ${end.getUTCDate()}/${end.getUTCMonth() + 1}`;
  }, [props.weeks, props.selectedSlot]);

  const totalRevenue =
    Number(props.stats?.totalRevenue ?? 0).toLocaleString("vi-VN") + " đ";
  const totalOrders = String(props.stats?.totalOrders ?? 0) + " đơn";
  const totalCakes = String(props.stats?.totalQuantityCakesSold ?? 0) + " bánh";
  const receivedToday = String(props.stats?.totalToday ?? 0) + " đơn";
  const receivedCakesToday = String(props.stats?.totalCakeToday ?? 0) + " bánh";
  const pendingToday = String(props.stats?.pendingToday ?? 0) + " đơn";
  const pendingCakesToday =
    String(props.stats?.pendingCakeToday ?? 0) + " bánh";
  const statsRangeLabel = statsSelection
    ? `${statsSelection.weeks} tuần - ${formatShortDate(statsSelection.startDate)} - ${formatShortDate(statsSelection.endDate)}`
    : "Chọn tuần thống kê";

  return (
    <main className="min-h-screen bg-[#FFFDF7] pb-24 text-[#3D2008]">
      <div className="mx-auto w-[90vw] max-w-md pt-5">
        <header>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Dashboard</p>
            <button
              type="button"
              onClick={props.onLogout}
              aria-label="Đăng xuất"
              className="p-2 text-[#C01F1F]"
            >
              <LogOut size={19} />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <KpiPair
              left={["Tổng doanh thu", totalRevenue, "Từ đơn đã xử lý"]}
              right={["Tổng đơn đã nhận", totalOrders, totalCakes]}
            />
            <KpiPair
              left={[
                "Đơn trong ngày đã nhận",
                receivedToday,
                receivedCakesToday,
              ]}
              right={[
                "Đơn trong ngày chưa xử lý",
                pendingToday,
                pendingCakesToday,
              ]}
            />
          </div>
        </header>
        {tab === "orders" ? (
          <>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="flex w-full justify-between border border-[#3D2008]/20 bg-white px-4 py-3 text-left text-sm"
              >
                <span className="font-semibold">Lịch</span>
                <span className="text-[#3D2008]/65">{weekLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C01F1F] py-3 text-sm font-semibold text-[#FDF6E8]"
              >
                <Plus size={17} />
                Thêm slot mới
              </button>
            </div>
            {props.selectedSlot ? (
              <MobileOrders
                slot={props.selectedSlot}
                refreshKey={props.ordersRefreshKey}
                initialStatus={restoreStatus as OrderStatus | null}
              />
            ) : (
              <p className="py-14 text-center text-sm text-[#3D2008]/60">
                Chọn một ngày trong lịch để xem đơn bánh
              </p>
            )}
          </>
        ) : (
          <section className="mt-6">
            <button
              type="button"
              onClick={() => setStatsCalendarOpen(true)}
              className="flex w-full justify-between border border-[#3D2008]/20 bg-white px-4 py-3 text-left text-sm"
            >
              <span className="font-semibold">Lịch</span>
              <span className="text-[#3D2008]/65">{statsRangeLabel}</span>
            </button>
            <h2 className="mt-6 font-semibold">Thống kê</h2>
            <p className="mt-1 text-sm text-[#3D2008]/65">{statsRangeLabel}</p>
            {statsSelection ? (
              <div className="mt-4">
                <StatForm mobile selectedWeeks={statsSelection} />
              </div>
            ) : (
              <p className="py-14 text-center text-sm text-[#3D2008]/60">
                Chọn một tuần đã hoàn thành để xem thống kê
              </p>
            )}
          </section>
        )}
      </div>
      <nav className="fixed inset-x-0 bottom-0 border-t border-[#3D2008]/15 bg-white">
        <div className="mx-auto flex w-[90vw] max-w-md">
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold ${tab === "orders" ? "text-[#C01F1F]" : "text-[#3D2008]/50"}`}
          >
            <span className="h-4 w-4" />
            Đơn bánh
          </button>
          <button
            type="button"
            onClick={() => setTab("stats")}
            className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold ${tab === "stats" ? "text-[#C01F1F]" : "text-[#3D2008]/50"}`}
          >
            <span className="h-4 w-4" />
            Thống kê
          </button>
        </div>
      </nav>
      <MobileSheet open={calendarOpen} onClose={() => setCalendarOpen(false)}>
        <div className="flex items-center justify-between border-b border-[#3D2008]/15 pb-3">
          <h2 className="font-semibold">Lịch</h2>
          <button
            type="button"
            onClick={() => setCalendarOpen(false)}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-3">
          <CalendarContent
            {...props}
            onSelectSlot={(slot) => {
              props.onSelectSlot(slot);
              setCalendarOpen(false);
            }}
            onAdd={() => {
              setCalendarOpen(false);
              setAddOpen(true);
            }}
          />
        </div>
      </MobileSheet>
      <MobileSheet
        open={statsCalendarOpen}
        onClose={() => setStatsCalendarOpen(false)}
      >
        <div className="flex items-center justify-between border-b border-[#3D2008]/15 pb-3">
          <h2 className="font-semibold">Lịch thống kê</h2>
          <button
            type="button"
            onClick={() => setStatsCalendarOpen(false)}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-3">
          <StatsCalendar
            selectedWeeks={statsSelection}
            onSelect={(selection) => setStatsSelection(selection ?? undefined)}
            className="!w-full !shadow-none"
          />
        </div>
      </MobileSheet>
      {addOpen && (
        <SlotForm
          title="Thêm slot mới"
          onClose={() => setAddOpen(false)}
          onSave={props.onCreateSlot}
          error={props.slotError}
        />
      )}
    </main>
  );
}
