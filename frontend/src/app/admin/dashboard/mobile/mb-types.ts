export type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export type AdminStats = {
  totalRevenue: number | string;
  totalOrders: number;
  totalQuantityCakesSold: number;
  totalToday: number;
  totalCakeToday: number;
  pendingToday: number;
  pendingCakeToday: number;
};

export type SlotCake = {
  cakeId: number;
  cakeName: string;
  maxCapacity: number;
  currentBooked: number;
  bufferLimit: number;
};

export type SlotDate = { date: string; cake: SlotCake; orderCount: number };

export type WeekGroup = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  slots: SlotDate[];
};

export type OrderItem = {
  cakeId?: number;
  name?: string;
  quantity: number;
  eggCount: number;
  priceAtPurchase: number;
};

export type OrderSummary = {
  orderId: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingMethod: string;
  items: OrderItem[];
};

export type SlotDetail = {
  totalMax: number;
  totalBooked: number;
  cakes: { id: number; maxCapacity: number; currentBooked: number }[];
};

export const STATUS_ORDER: OrderStatus[] = [
  "NEW",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  NEW: { label: "Đã tiếp nhận", className: "bg-[#0088FF]/15 text-[#0074DB]" },
  PROCESSING: {
    label: "Đang xử lý",
    className: "bg-[#FFCC00]/20 text-[#9A7100]",
  },
  COMPLETED: { label: "Đã nhận", className: "bg-[#34C759]/15 text-[#178A36]" },
  CANCELLED: { label: "Đã hủy", className: "bg-[#FF5F57]/15 text-[#C73832]" },
};

export const formatShortDate = (date: string | Date) => {
  if (typeof date === "string") {
    const [, month, day] = date.split("-");
    return `${Number(day)}/${month.padStart(2, "0")}`;
  }

  return `${date.getUTCDate()}/${String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
};

export const formatShortDateWeek = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);

  const weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  const weekday = weekdays[new Date(year, month - 1, day).getDay()];

  return `${weekday}, Ngày ${day} tháng ${month < 10 ? `0${month}` : `${month}`} `;
};

export const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const calculateTotal = (items: OrderItem[]) =>
  items.reduce(
    (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
    0,
  );

export const paymentLabel = (method: string) =>
  method === "CASH" ? "Thanh toán khi nhận bánh" : "Chuyển khoản";

export const shippingLabel = (method: string) =>
  method === "DELIVERY" ? "Giao đến" : "Đến lấy";
