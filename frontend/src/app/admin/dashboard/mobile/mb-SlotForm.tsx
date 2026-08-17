"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, Minus, Plus, X } from "lucide-react";
import MobileSheet from "./mb-MobileSheet";
import { toDateInput } from "./mb-types";

type SlotFormProps = {
  title: string;
  onClose: () => void;
  onSave: (date: string, quantity: number) => Promise<boolean>;
  error: string | null;
};

export default function SlotForm({
  title,
  onClose,
  onSave,
  error,
}: SlotFormProps) {
  const [date, setDate] = useState(new Date());
  const [quantity, setQuantity] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const saved = await onSave(toDateInput(date), quantity);
    setSaving(false);
    if (saved) onClose();
  };

  return (
    <MobileSheet open onClose={onClose}
    panelClassName ="h-[43vh]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[16px]">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <div className="flex justify-between items-center gap-2 rounded-lg border border-[#3D2008]/20 bg-white px-3 py-4">
          <DatePicker
            selected={date}
            onChange={(value: Date | null) => value && setDate(value)}
            locale="vi"
            dateFormat="dd/MM/yyyy"
            className="w-full flex bg-white outline-none"
          /> 
          <CalendarDays size={20} />          
        </div>

        <span className="text-[16px] font-semibold">Thêm số lượng bánh sẽ bán trong ngày</span>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Số lượng bánh</span>
          <div className="flex items-center gap-3 rounded-full border border-[#3D2008] px-1 py-1 font-medium">
            <button
              type="button"
              disabled={quantity <= 1 || saving}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8]"
            >
              <Minus size={20} />
            </button>
            <input
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value) || 1))
              }
              className="w-8 bg-transparent text-center outline-none"
              inputMode="numeric"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => setQuantity((value) => value + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8]"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[#C01F1F]">{error}</p>}

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="rounded-lg bg-[#C01F1F] px-4 py-3 font-semibold text-[#FDF6E8] disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Thêm ngày"}
        </button>
      </div>
    </MobileSheet>
  );
}
