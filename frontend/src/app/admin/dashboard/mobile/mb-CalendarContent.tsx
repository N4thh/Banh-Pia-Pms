import { ChevronDown, Plus } from "lucide-react";
import { formatShortDate, SlotDate, WeekGroup } from "./mb-types";

type CalendarContentProps = {
  weeks: WeekGroup[];
  selectedSlot: SlotDate | null;
  openWeekNumber: number | null;
  onToggleWeek: (weekNumber: number) => void;
  onSelectSlot: (slot: SlotDate) => void;
  onAdd: () => void;
};

export default function CalendarContent({
  weeks,
  selectedSlot,
  openWeekNumber,
  onToggleWeek,
  onSelectSlot,
  onAdd,
}: CalendarContentProps) {
  return (
    <div className="flex flex-col gap-2">
      {weeks.length === 0 && (
        <p className="py-8 text-center text-sm text-[#3D2008]/60">
          Chưa có slot sắp tới
        </p>
      )}

      {weeks.map((week) => {
        const isOpen = openWeekNumber === week.weekNumber;

        return (
          <div key={week.weekStart} className="border-b border-[#3D2008]/20">
            <button
              type="button"
              onClick={() => onToggleWeek(week.weekNumber)}
              className="flex w-full items-center justify-between py-3 text-left text-sm"
            >
              <span className="font-semibold">Tuần {week.weekNumber}</span>
              <span>
                {formatShortDate(week.weekStart)} đến {formatShortDate(week.weekEnd)}
              </span>
              <ChevronDown size={18} className={isOpen ? "rotate-180" : ""} />
            </button>

            {isOpen && (
              <div className="flex flex-col gap-2 pb-3">
                {week.slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.date === slot.date &&
                    selectedSlot.cake.cakeId === slot.cake.cakeId;

                  return (
                    <button
                      key={`${slot.date}-${slot.cake.cakeId}`}
                      type="button"
                      onClick={() => onSelectSlot(slot)}
                      className={`rounded-lg border p-3 text-left ${isSelected ? "border-[#3D2008] bg-[#3D2008] text-[#FDF6E8]" : "border-[#3D2008]/20 bg-white"}`}
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
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3  font-semibold 
        bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors text-[14px] disabled:opacity-50"
      >
        <Plus size={18} />
        Thêm ngày
      </button>
    </div>
  );
}
