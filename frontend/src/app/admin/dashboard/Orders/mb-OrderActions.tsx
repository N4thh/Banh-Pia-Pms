"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosClient } from "@/src/api/axios-client";
import MobileSheet from "../mobile/mb-MobileSheet";

type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

type OrderActionsProps = {
  orderId: number;
  status: OrderStatus;
  onSuccess: () => Promise<void>;
};

const CANCEL_REASONS = [
  { value: "CUSTOMER_REQUEST", label: "Khách hàng yêu cầu" },
  { value: "OUT_OF_STOCK", label: "Hết bánh" },
  { value: "DUPLICATE_ORDER", label: "Thanh toán bị lặp lại" },
  { value: "OTHER", label: "Khác" },
] as const;

export default function MobileOrderActions({
  orderId,
  status,
  onSuccess,
}: OrderActionsProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const closeCancel = () => {
    if (saving) return;
    setCancelOpen(false);
    setError("");
  };

  const closeComplete = () => {
    if (!saving) setCompleteOpen(false);
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      setError("Vui lòng chọn lý do hủy");
      return;
    }
    if (cancelReason === "OTHER" && !note.trim()) {
      setError("Vui lòng nhập lý do cụ thể");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await axiosClient.patch(`/booking/${orderId}/cancel`, {
        cancelReason,
        ...(cancelReason === "OTHER" && note.trim()
          ? { cancelReasonNote: note.trim() }
          : {}),
      });
      toast.success("Đã hủy đơn hàng");
      setCancelOpen(false);
      await onSuccess();
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Hủy đơn thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await axiosClient.patch(`/booking/${orderId}/completed`);
      toast.success("Hoàn tất đơn hàng thành công");
      setCompleteOpen(false);
      await onSuccess();
    } catch (reason: unknown) {
      toast.error(
        reason instanceof Error ? reason.message : "Hoàn tất đơn thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  const canCancel = status === "NEW" || status === "PROCESSING";
  const canComplete = status === "PROCESSING";

  if (!canCancel && !canComplete) return null;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 bg-white px-[5vw] py-4 shadow-[0_-4px_16px_rgba(61,32,8,0.08)]">
        <div className="mx-auto flex flex-col w-full max-w-md gap-3">
          {canComplete && (
            <button
              type="button"
              onClick={() => setCompleteOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold
              bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors text-[14px] disabled:opacity-50"
            >
              Hoàn tất đơn
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg mt-1 mb-5 text-sm font-semibold text-[#C01F1F]
              [text-decoration-skip-ink:none] underline"
            >
              <X size={18} />
              Hủy đơn
            </button>
          )}
        </div>
      </nav>

      {cancelOpen && (
        <MobileSheet
          open
          onClose={closeCancel}
          panelClassName="h-[72vh]"
        >
          <div className="flex items-center justify-between border-b border-[#3D2008]/15 pb-3">
            <h2 className="font-semibold">Hủy đơn hàng #{orderId}</h2>
            <button type="button" onClick={closeCancel} aria-label="Đóng">
              <X size={20} />
            </button>
          </div>
          <p className="mt-3 text-sm text-[#3D2008]/65">
            Chọn lý do hủy đơn và xác nhận lại thông tin.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {CANCEL_REASONS.map((reason) => {
              const selected = cancelReason === reason.value;
              return (
                <label
                  key={reason.value}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${selected ? "border-[#3D2008] bg-[#3D2008] text-[#FDF6E8]" : "border-[#3D2008]/20 bg-white"}`}
                >
                  <span className="text-sm">{reason.label}</span>
                  <input
                    type="radio"
                    name="mobileCancelReason"
                    checked={selected}
                    onChange={() => {
                      setCancelReason(reason.value);
                      setError("");
                    }}
                    className="h-4 w-4 accent-[#C01F1F]"
                  />
                </label>
              );
            })}
          </div>

          {cancelReason === "OTHER" && (
            <textarea
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setError("");
              }}
              placeholder="Nhập lý do hủy đơn..."
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border border-[#3D2008]/25 p-3 text-sm outline-none"
            />
          )}
          {error && <p className="mt-3 text-sm text-[#C01F1F]">{error}</p>}

          <button
            type="button"
            disabled={saving}
            onClick={handleCancel}
            className="mt-5 w-full rounded-lg bg-[#C01F1F] py-3 text-sm font-semibold text-[#FDF6E8] disabled:opacity-50"
          >
            {saving ? "Đang hủy..." : "Xác nhận hủy đơn"}
          </button>
        </MobileSheet>
      )}

      {completeOpen && (
        <MobileSheet
          open
          onClose={closeComplete}
          panelClassName="h-[35vh]"
        >
          <div className="flex items-center justify-between border-b border-[#3D2008]/15 pb-3">
            <h2 className="font-semibold">Hoàn tất đơn hàng #{orderId}</h2>
            <button type="button" onClick={closeComplete} aria-label="Đóng">
              <X size={20} />
            </button>
          </div>
          <p className="mt-4 text-sm text-[#3D2008]/65">
            Xác nhận đơn hàng này đã được giao hoặc khách đã nhận bánh.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={handleComplete}
            className="mt-6 w-full rounded-lg bg-[#C01F1F] py-3 text-sm font-semibold text-[#FDF6E8] disabled:opacity-50"
          >
            {saving ? "Đang hoàn tất..." : "Xác nhận hoàn tất đơn"}
          </button>
        </MobileSheet>
      )}
    </>
  );
}
