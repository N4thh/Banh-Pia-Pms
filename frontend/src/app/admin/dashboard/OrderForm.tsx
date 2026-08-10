"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { axiosClient } from "@/src/api/axios-client";
import { CalendarDays, Dot, Minus, PencilLine, Plus } from "lucide-react";
import Modal from "@/src/components/Modal";
import OrderDetailModal from "./OrderDetailModal";

type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";
type OrderItemSummary = {
    quantity: number;
    eggCount: number;
    priceAtPurchase: number;
};

type OrderSummary = {
  orderId: number;
  customerName: string;
  phone: string;
  items: OrderItemSummary[];
  status: OrderStatus;
  orderDate: string;
  receiveDate: string;
  paymentMethod: string;
  shippingMethod: string;
};

type OrdersBySlotResponse = {
  orders: OrderSummary[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
};

type SlotCake = {
  id: number;
  kind: string;
  maxCapacity: number;
  currentBooked: number;
  remaining: number;
};

type SlotDetail = {
  date: string;
  totalMax: number;
  totalBooked: number;
  cakes: SlotCake[];
};

type Props = {
  onBack: () => void;
  slotDate: string;
  cakeId: number;
  cakeName: string;
};

export default function DetailOrder({ onBack, slotDate, cakeId, cakeName }: Props) {
  const [detail, setDetail] = useState<SlotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [saving, setSaving] = useState(false);

  // Order
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Order detail modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const selectedCake = useMemo(
    () => detail?.cakes.find((c) => c.id === cakeId) ?? null,
    [detail, cakeId]
  );

  const minCapacity = selectedCake?.currentBooked ?? 1;

  // format
  const formatDate = (dateString: string) => {
    const [, month, day] = dateString.split("-");
    return `Ngày ${Number(day)} Tháng ${Number(month)}`;
  };
  

  const formatDayOfWeek = (date: string | Date) => {
    const d = new Date(date);
    const weekdays = [
      "Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư",
      "Thứ Năm", "Thứ Sáu", "Thứ Bảy",
    ];
    return weekdays[d.getDay()];
  };
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

  const calculateTotalPurchase = (items: OrderItemSummary[]): number => {
    return items.reduce((total, item) => total + item.priceAtPurchase * item.quantity, 0); 
  };

  const groupedOrders = useMemo(() => {
    const map = new Map<OrderStatus, OrderSummary[]>();
    const order: OrderStatus[] = ["PROCESSING", "NEW", "COMPLETED", "CANCELLED"];
    for (const status of order) {
      const group = orders.filter((o) => o.status === status);
      if (group.length > 0) map.set(status, group);
    }
    return map;
  }, [orders]);
  // fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);

    const fetchDetail = async () => {
      try {
        const params = new URLSearchParams();
        params.set("date", slotDate);
        params.set("cakeId", String(cakeId));
        const res = await axiosClient.get(`/availability/slots?${params.toString()}`);
        if (!cancelled) setDetail(res as unknown as SlotDetail);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Không thể tải thông tin slot";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    fetchOrder(1);
    return () => { cancelled = true; };
  }, [slotDate, cakeId]);

  const handleOpenEdit = () => {
    if (!selectedCake) {
      toast.error("Chưa có dữ liệu slot, vui lòng đợi");
      return;
    }
    setQuantity(selectedCake.maxCapacity);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    if (saving) return;
    setOpenEdit(false);
  };

  const fetchOrder = async (page: number) => {
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      params.set("date", slotDate);
      params.set("cakeId", String(cakeId));
      params.set("page", String(page));

      const res = await axiosClient.get(
        `/admin/orders-by-slot?${params.toString()}`
      );
      const data = res as unknown as OrdersBySlotResponse;
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err: unknown) {
      console.log(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // handle
  const handleSave = async () => {
    if (!selectedCake) return;
    if (!Number.isInteger(quantity) || quantity < minCapacity) {
      toast.error(`Số lượng phải ≥ ${minCapacity} (số bánh đã được đặt)`);
      return;
    }
    try {
      setSaving(true);
      await axiosClient.patch("/availability/edit", {
        date: slotDate,
        cakeId,
        newMaxCapacity: quantity,
      });
      toast.success("Cập nhật số lượng bánh thành công");
      setOpenEdit(false);
      // refetch
      const params = new URLSearchParams();
      params.set("date", slotDate);
      params.set("cakeId", String(cakeId));
      const res = await axiosClient.get(`/availability/slots?${params.toString()}`);
      setDetail(res as unknown as SlotDetail);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Cập nhật thất bại, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-[74%] ml-5 rounded-2xl px-4 max-h-150 overflow-y-auto no-scrollbar">
      {loading && (
        <p className="text-[#3D2008]/60 mt-4 text-center text-[14px]">
          Đang tải chi tiết slot...
        </p>
      )}

      {error && (
        <p className="text-[#FF5F57] mt-4 text-center text-[14px]">
          {error}
        </p>
      )}

      {detail && !loading && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <p className="font-semibold flex gap-3 text-[18px]">
              <CalendarDays /> {formatDayOfWeek(slotDate)}, {formatDate(slotDate)}
            </p>
            <div className="flex justify-end gap-2 items-center">
              <p>Số lượng bánh: {detail.totalBooked}/{detail.totalMax}</p>
              <button type="button" onClick={handleOpenEdit}>
                <PencilLine size={20} />
              </button>
            </div>
          </div>

          <div>
            {loadingOrders ? (
              <div>Đang tải đơn...</div>
            ) : orders.length === 0 ? (
              <div>Không có đơn hàng</div>
            ) : (
                <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar max-h-120">
                {Array.from(groupedOrders.entries()).map(([status, group]) => {
                  const statusInfo = formatOrderStatus(status);
                  return (
                    <div key={status}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                        <span className="text-xs text-[#3D2008]/50">({group.length})</span>
                      </div>
                      <div className="border-b-2 border-dashed border-[#3D2008]/25 mb-3" />
                      <div className="flex flex-wrap gap-3">
                      {group.map((o) => (
                        <div key={o.orderId} className="border rounded-xl border-[#3D2008]/25 px-4 py-6 w-[22vw] h-fit">
                          <div className="flex flex-col gap-2" >
                      <div className="flex justify-between">
                        <p className="w-fit py-1 px-2 font-medium bg-[#8A226F]/25 border border-[#8A226F]/25 text-[#8A226F]  
                        text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]"
                        >{o.paymentMethod === "CASH" ? "Thanh toán khi nhận bánh" : "Chuyển Khoản" }</p>
                        <div>
                          {(() => {
                              const statusInfo = formatOrderStatus(o.status);
                              return (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                                      {statusInfo.text}
                                  </span>
                              );
                          })()}
                        </div>
                      </div>
                      
                      <p className="w-fit py-1 px-2 font-medium bg-[#8A226F]/25 border border-[#8A226F]/25 text-[#8A226F]  
                      text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]"
                      >{o.shippingMethod === "DELIVERY" ? "Giao đến" : "Đến lấy" }</p>
                      <p className=" text-[#3D2008]/75 mt-1
                      text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">Đơn bánh #{o.orderId} </p>
                      
                      {/* Giỏ hàng */}
                      <p className="text-[#3D200] font-medium mt-2
                      text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]"
                      >Giỏ hàng:</p>

                      <div className="border-b-2 border-dashed border-[#3D2008]/65">
                        {o.items.map((item, idx) => (
                            <p key={idx} className="flex justify-between items-center text-[#3D2008] mb-1
                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
                                <span>Bánh Pía</span>
                                <span className="flex"> <Dot size={25}/> {item.eggCount > 0 ? `${item.eggCount} trứng muối` : "0 trứng muối"} </span>
                                <span>x{item.quantity}</span>
                            </p>
                        ))}
                      </div>

                      {/* Thanh toan */}
                      <p className="flex justify-between text-[#3D2008]/75
                      text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                        >Thanh toán 
                        <span className="text-[#007AFF] font-medium
                        text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]"
                        >{calculateTotalPurchase(o.items).toLocaleString('vi-VN')} đ</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(o.orderId)}
                      className="w-full py-2 mt-2 border rounded-lg text-[#C01F1F] border-[#C01F1F] font-semibold
                      text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]"
                    > Chi tiết
                      </button>
                        </div>
                      ))}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => fetchOrder(page)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-[#C01F1F] text-[#FDF6E8]"
                            : "bg-white border border-[#3D2008]/25 text-[#3D2008] hover:bg-[#FDF6E8]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        panelClassName="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex flex-col gap-4 text-[#3D2008]">
          <p className="font-semibold text-[17px]">
            {formatDayOfWeek(slotDate)}, {formatDate(slotDate)}
          </p>

          <p className="text-[14px]">
            Vui lòng đặt giới hạn bánh sẽ bán trong ngày
          </p>

          <div className="flex justify-between items-center">
            <p className="font-medium text-[14px]">Số lượng bánh</p>
            <div className="flex items-center justify-center gap-2 border rounded-2xl px-1 py-1 w-fit border-[#3D2008]">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(minCapacity, prev - 1))}
                disabled={saving}
                className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-[#FDF6E8]
                h-6 w-6 flex justify-center items-center disabled:opacity-50"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={minCapacity}
                step={1}
                value={Number.isFinite(quantity) ? quantity : ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "") { setQuantity(minCapacity); return; }
                  const parsed = Number(raw);
                  setQuantity(Number.isFinite(parsed) ? parsed : minCapacity);
                }}
                onBlur={(event) => {
                  const parsed = Number(event.target.value);
                  if (!Number.isFinite(parsed) || parsed < minCapacity) setQuantity(minCapacity);
                }}
                onKeyDown={(event) => {
                  if (["e", "E", "+", "-", ".", ","].includes(event.key)) event.preventDefault();
                }}
                disabled={saving}
                className="font-medium text-[#3D2008] min-w-5 max-w-10 w-6 text-center bg-transparent outline-none
                  text-[clamp(13px,1.1vw,16px)]
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                disabled={saving}
                className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-[#FDF6E8]
                  h-6 w-6 flex justify-center items-center disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 mt-4 w-fit rounded-lg font-semibold bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors
              text-[14px] disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
