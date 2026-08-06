"use client";

import { useEffect, useState } from "react";
import { axiosClient } from "@/src/api/axios-client";

type SlotCake = {
  cakeId: number;
  cakeName: string;
  maxCapacity: number;
  currentBooked: number;
};

type SlotDetail = {
  date: string;
  totalMax: number;
  totalBooked: number;
  cakes: { id: number; kind: string; remaining: number }[];
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

  const formatDate = (dateString: string) => {
    const [, month, day] = dateString.split("-");
    return `${day}/${month}`;
  };

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

  return (
    <div className="w-[68%] ml-5 border rounded-2xl border-[#3D2008]/25 p-4 max-h-150 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b-2 border-[#3D2008] pb-2">
        <button
          type="button"
          onClick={onBack}
          className="text-[#C01F1F] font-medium underline
          text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
        >
          ← Quay lại
        </button>
        <p className="font-semibold
        text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">
          Chi tiết slot
        </p>
      </div>

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
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <p className="text-[#3D2008]/75
            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">Ngày</p>
            <p className="font-semibold
            text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]">
              {formatDate(slotDate)} - {cakeName}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-[#3D2008]/75
              text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">Tổng sức chứa</p>
              <p className="font-semibold
              text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]">
                {detail.totalMax}
              </p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-[#3D2008]/75
              text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">Đã đặt</p>
              <p className="font-semibold
              text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]">
                {detail.totalBooked}
              </p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-[#3D2008]/75
              text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">Còn trống</p>
              <p className="font-semibold
              text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px]">
                {detail.totalMax - detail.totalBooked}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2
            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]">
              Bánh trong ngày
            </h3>
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
    </div>
  );
}
