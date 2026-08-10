"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { axiosClient } from "@/src/api/axios-client";
import { CalendarDays, Minus, PencilLine, Plus } from "lucide-react";
import Modal from "@/src/components/Modal";


interface OrderItem {
    cakeId: number;
    cakeName: string;
    quantity: number;
    priceAtPurchase: number;
    eggCount: number;
}

interface Order {
  id: number;
  totalMoney: number;
  status: string;
  items: OrderItem[];
}

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
  const [order, setOrder] = useState<Order | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [saving, setSaving] = useState(false);

  const selectedCake = useMemo(
    () => detail?.cakes.find((c) => c.id === cakeId) ?? null,
    [detail, cakeId]
  );

  const minCapacity = selectedCake?.currentBooked ?? 1;

  //format
  const formatDate = (dateString: string) => {
    const [, month, day] = dateString.split("-");
    return `Ngày ${Number(day)} Tháng ${Number(month)}`;
  }

  const formatDayOfWeek = (date: string | Date) => {
      const d = new Date(date);
      const weekdays = [
          "Chủ nhật",
          "Thứ Hai",
          "Thứ Ba",
          "Thứ Tư",
          "Thứ Năm",
          "Thứ Sáu",
          "Thứ Bảy",
      ];

      return weekdays[d.getDay()];
  }

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
    <div className="w-[68%] ml-5  rounded-2xl border-[#3D2008]/25 px-4 max-h-150 overflow-y-auto no-scrollbar">
      {loading && (
        <p className="text-[#3D2008]/60 mt-4 text-center
        text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
          Đang tải chi tiết slot...
        </p>
      )}

      {error && (
        <p className="text-[#FF5F57] mt-4 text-center
        text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
          {error}
        </p>
      )}

      {detail && !loading && (
        <div className=" flex flex-col gap-4">
          <div className="flex justify-between">
            <p className="font-semibold flex gap-3
            text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]">
               <CalendarDays /> {formatDayOfWeek(slotDate)}, {formatDate(slotDate)}
            </p>
            <div className="flex justify-end gap-2">
              <p> Số lượng bánh: {detail.totalBooked}/{detail.totalMax}</p>
              <button onClick={handleOpenEdit}>
                <PencilLine size={20}/>
              </button>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-2">
              {detail.cakes.map((c) => (
                <div key={c.id} className="border rounded-lg p-3 flex justify-between">
                  <p className="font-medium
                  text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
                    {c.kind}
                  </p>
                  <p className="text-[#3D2008]/75
                  text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                    Còn trống: {c.remaining}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        panelClassName="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex flex-col gap-4 text-[#3D2008]">
          <div>
            <p className="font-semibold text-[15px] sm:text-[16px] md:text-[17px]">
              {formatDayOfWeek(slotDate)}, {formatDate(slotDate)}
            </p>
          </div>

          <p className="text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
            Vui lòng đặt giới hạn bánh sẽ bán trong ngày
          </p>

          <div className="flex justify-between items-center">
            <p className="font-medium
            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">Số lượng bánh</p>
            <div className="flex items-center justify-center gap-2 border rounded-2xl px-1 py-1 w-fit border-[#3D2008]">
                <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) => Math.max(minCapacity, prev - 1))
                    }
                    disabled={saving}
                    className="transition-all duration-150 hover:scale-90 bg-[#3D2008] rounded-full text-[#FDF6E8]
                    h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:hover:scale-100">
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
                      if (raw === "") {
                        setQuantity(minCapacity);
                        return;
                      }
                      const parsed = Number(raw);
                      setQuantity(Number.isFinite(parsed) ? parsed : minCapacity);
                    }}
                    onBlur={(event) => {
                      const parsed = Number(event.target.value);
                      if (!Number.isFinite(parsed) || parsed < minCapacity) {
                        setQuantity(minCapacity);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        ["e", "E", "+", "-", ".", ","].includes(event.key)
                      ) {
                        event.preventDefault();
                      }
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
                    h-6 w-6 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:hover:scale-100"
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
            text-[12px] sm:text-[13px] md:text-[14px] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

        </div>
      </Modal>
    </div>
  );
}