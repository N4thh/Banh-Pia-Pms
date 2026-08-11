"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/src/components/Modal";
import { axiosClient } from "@/src/api/axios-client";
import { X } from "lucide-react";

type Props = {
  orderId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const CANCEL_REASONS = [
  { value: "CUSTOMER_REQUEST", label: "Khách hàng yêu cầu" },
  { value: "OUT_OF_STOCK", label: "Hết bánh" },
  { value: "DUPLICATE_ORDER", label: "Thanh toán bị lặp lại" },
  { value: "OTHER", label: "Khác" },
] as const;

export default function OrderCancel({ orderId, onClose, onSuccess }: Props) {
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async (reason: string | null, noteValue: string) => {
    if (orderId == null) return;

    if (!reason) {
      setError("Vui lòng chọn lý do hủy");
      return;
    }
    if (reason === "OTHER" && !noteValue.trim()) {
      setError("Vui lòng nhập lý do cụ thể");
      return;
    }

    setError("");
    if (saving) return;
    setSaving(true);
    try {
      await axiosClient.patch(`/booking/${orderId}/cancel`, {
        cancelReason: reason,
        ...(reason === "OTHER" && noteValue.trim()
          ? { cancelReasonNote: noteValue.trim() }
          : {}),
      });
      toast.success("Đã hủy đơn hàng");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Hủy đơn thất bại";
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
      <div className="relative flex flex-col gap-5 text-[#3D2008]">
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
            Hủy đơn hàng #{orderId}
          </h2>
          <p className="text-[#3D2008]/70
          text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">
            Vui lòng chọn lý do hủy đơn và xác nhận lại thông tin trước khi hủy
          </p>
        </div>

        {/* Reasons */}
        <div className="grid grid-cols-1 gap-3">
          {CANCEL_REASONS.map((reason) => {
            const selected = cancelReason === reason.value;
            return (
              <label
                key={reason.value}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border-2 p-4 lg:p-2 2xl:p-4 transition-colors duration-200
                  ${selected
                    ? "bg-[#3D2008] text-[#FDF6E8] border-[#FDF6E8] ring-1 ring-[#3D2008]"
                    : "bg-white border-[#3D2008]/25"}
                `}
              >
                <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]">
                  {reason.label}
                </p>
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason.value}
                  checked={selected}
                  onChange={() => {
                    setCancelReason(reason.value);
                    setError("");
                  }}
                  className="h-5 w-5 cursor-pointer accent-[#C01F1F]"
                />
              </label>
            );
          })}

          {cancelReason === "OTHER" && (
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError("");
              }}
              placeholder="Nhập lý do hủy đơn..."
              rows={3}
              className="w-full rounded-lg border border-[#3D2008]/25 p-3 outline-none focus:border-[#3D2008]
              resize-none overflow-y-auto no-scrollbar 
                text-[13px] sm:text-[14px] md:text-[15px]"
            />
          )}

          {error && (
            <p className="text-[#C01F1F] text-[12px] sm:text-[13px] md:text-[14px]">
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="w-fit gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleCancel(cancelReason, note)}
            className="w-full py-3.5 px-6 rounded-xl font-semibold border 
              text-[#FDF6E8] border-[#C01F1F] bg-[#C01F1F] hover:bg-[#A61B1B] active:bg-[#8B1515] transition-colors
              text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Đang hủy..." : "Xác nhận hủy đơn bánh"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
