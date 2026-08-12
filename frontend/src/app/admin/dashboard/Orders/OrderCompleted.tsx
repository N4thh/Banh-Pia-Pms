"use client";

import { axiosClient } from "@/src/api/axios-client";
import Modal from "@/src/components/Modal";
import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  orderId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function OrderCompleted({ orderId, onClose, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const handleCompleted = async () => {
      if (orderId == null) return;

      setError("");
      if (saving) return;
      setSaving(true);

      try {
        await axiosClient.patch(`/booking/${orderId}/completed`);
        toast.success("Hoàn tất đơn hàng thành công");
        onSuccess?.();
        onClose();

      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Hoàn tất đơn thất bại";
        toast.error(message);
      } finally {
        setSaving(false);
      }
    };

  const isOpen = orderId != null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      panelClassName="rounded-2xl w-full max-w-[65vw] sm:max-w-[35vw] md:max-w-[30vw] max-h-[90vh] overflow-y-auto no-scrollbar bg-[#FFFDF7] shadow-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col gap-5 text-[#3D2008]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng popup hủy đơn"
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center
            text-[#3D2008] transition-colors hover:text-[#C01F1F]"
        >
          <X size={22} strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold
            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[15px] xl:text-[15px] 2xl:text-[16px]">
            Xác nhận hoàn tất đơn hàng #{orderId}
          </h2>
          <p className="text-[#3D2008]/70
          text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
            Vui lòng xác nhận lại thông tin trước khi hoàn tất đơn
          </p>
        </div>

        {/* Actions */}
        <div className="w-fit gap-3">
          <button
            type="button"
            onClick={() => handleCompleted()}          
            className="w-full py-3.5 px-6 rounded-xl font-semibold border 
            text-[#FDF6E8] border-[#C01F1F] bg-[#C01F1F] hover:bg-[#A61B1B] active:bg-[#8B1515] transition-colors
            text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Đang hoàn tất..." : "Xác nhận hoàn tất đơn"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
