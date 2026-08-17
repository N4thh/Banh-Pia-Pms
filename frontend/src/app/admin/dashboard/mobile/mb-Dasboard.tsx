"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ChartNoAxesColumn, LogOut, Plus, ReceiptText, X } from "lucide-react";
import { vi } from "date-fns/locale";
import { registerLocale } from "react-datepicker";
import StatForm from "../Stats/StatForm";
import StatsCalendar, { StatsWeekSelection } from "../Stats/StatsCalendar";
import CalendarContent from "./mb-CalendarContent";
import KpiPair from "./mb-KpiPair";
import MobileSheet from "./mb-MobileSheet";
import OrderList from "./mb-OrderList";
import SlotForm from "./mb-SlotForm";
import {
  AdminStats,
  formatShortDate,
  OrderStatus,
  SlotDate,
  WeekGroup,
} from "./mb-types";

registerLocale("vi", vi);

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
  const restoredSlotKey = useRef<string | null>(null);
  const restoreSlotKey =
    restoreDate && Number.isInteger(restoreCakeId)
      ? `${restoreDate}-${restoreCakeId}`
      : null;

  //format:
  const formatDate = (dateString: string) => {
    const [, month, day] = dateString.split("-");
    return `${day}/${month}`;
  };
  
  useEffect(() => {
    if (!restoreSlotKey || restoredSlotKey.current === restoreSlotKey) return;

    const slot = props.weeks
      .flatMap((week) => week.slots)
      .find(
        (item) =>
          item.date === restoreDate && item.cake.cakeId === restoreCakeId,
      );

    if (!slot) return;

    // A URL context should restore once after returning from order detail.
    // Subsequent manual calendar selections must not be overwritten by that URL.
    restoredSlotKey.current = restoreSlotKey;
    if (
      props.selectedSlot?.date !== slot.date ||
      props.selectedSlot?.cake.cakeId !== slot.cake.cakeId
    ) {
      props.onSelectSlot(slot);
    }
  }, [
    props.weeks,
    props.selectedSlot,
    props.onSelectSlot,
    restoreDate,
    restoreCakeId,
    restoreSlotKey,
  ]);

  const orderWeekLabel = useMemo(() => {
    const slots = props.weeks
      .flatMap((week) => week.slots)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (!slots.length) return { number: 0, range: "Chưa có slot" };

    const start = slots[0].date;
    const selected = props.selectedSlot?.date ?? start;
    const startDate = new Date(`${start}T00:00:00Z`);
    const selectedDate = new Date(`${selected}T00:00:00Z`);
    const offset = Math.max(
      0,
      Math.floor((selectedDate.getTime() - startDate.getTime()) / 86400000),
    );
    const number = Math.floor(offset / 7) + 1;
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + number * 7 - 1);

    return {
      number,
      range: `${formatShortDate(start)} đến ${formatShortDate(end)}`,
    };
  }, [props.weeks, props.selectedSlot]);

  const totalRevenue =
    Number(props.stats?.totalRevenue ?? 0).toLocaleString("vi-VN") + " đ";
  const totalOrders = String(props.stats?.totalOrders ?? 0) + " đơn";
  const totalCakes = String(props.stats?.totalQuantityCakesSold ?? 0) + " bánh";
  const receivedToday = String(props.stats?.totalToday ?? 0) + " đơn";
  const receivedCakesToday =
    String(props.stats?.totalCakeToday ?? 0) + " bánh";
  const pendingToday = String(props.stats?.pendingToday ?? 0) + " đơn";
  const pendingCakesToday =
    String(props.stats?.pendingCakeToday ?? 0) + " bánh";
  const statsRangeLabel = statsSelection
    ? `${statsSelection.weeks} tuần\n ${formatDate(statsSelection.startDate)} đến ${formatDate(statsSelection.endDate)}`
    : "Chọn tuần thống kê";

  return (
    <main className="min-h-screen bg-[#FFFDF7] pb-24 text-[#3D2008]">
      <div className="mx-auto w-[90vw] max-w-md pt-5">
        <header>
          <div className="flex items-center justify-between">
            <p className="text- font-semibold">Pía cô Loan</p>
            <button
              type="button"
              onClick={props.onLogout}
              aria-label="Đăng xuất"
              className="p-2 text-[#C01F1F] hover:text-[#D62424] active:bg-[#A61B1B] transition-colors disabled:opacity-50"
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
            <section className="mt-6 flex flex-col gap-2">
              <div className="flex flex-col rounded-2xl bg-[#3D2008] py-3 px-4">
                <button
                  type="button"
                  onClick={() => setCalendarOpen(true)}
                  className="flex w-full justify-between p-2 text-left text-sm text-[#FDF6E8]"
                >
                  <span className="font-semibold text-[22px]">Lịch</span>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-[16px]">Tuần {orderWeekLabel.number}</span>
                    <span className="text-xs" >{orderWeekLabel.range}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg  py-3 text-sm font-semibold
                  bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors text-[14px] disabled:opacity-50"
                >
                  <Plus size={17} />
                  Thêm ngày
                </button>
              </div>
            </section>

            {props.selectedSlot ? (
              <OrderList
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
        ) : ( /* Trang Thống kê */
          <section className="mt-6">
            {/* Calendar button */}
            <button
              type="button"
              onClick={() => setStatsCalendarOpen(true)}
              className="flex w-full justify-between items-center rounded-lg bg-[#3D2008] text-[#FDF6E8] px-4 py-3 text-left text-sm"
            >
              <span className="font-semibold text-[22px]">Lịch</span>
              <span>{statsRangeLabel}</span>
            </button>

            <h2 className="mt-6 font-semibold text-[22px]">Thống kê</h2>
            <p className="flex gap-1 items-center mt-1 text-sm font-medium text-[#3D2008]">
              <CalendarDays /> {statsRangeLabel}
            </p>

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

      <nav className="fixed bottom-3 left-1/2 w-[90vw] -translate-x-1/2 rounded-2xl bg-transparent backdrop-blur-[2px]">
        <div className="mx-auto flex w-[90vw] max-w-md">
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm ${tab === "orders" ? "text-[#C01F1F]" : "text-[#3D2008]/50"}`}
          >
            <span className="flex flex-col items-center gap-0.5" ><ReceiptText size={20} /> Đơn bánh</span>
           
          </button>
          <button
            type="button"
            onClick={() => setTab("stats")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm ${tab === "stats" ? "text-[#C01F1F]" : "text-[#3D2008]/50"}`}
          >
            <span className="flex flex-col items-center gap-0.5 mt-2" ><ChartNoAxesColumn size={20} className="border-2 rounded-xs" /> Thống kê</span>
          </button>
        </div>
      </nav>

      <MobileSheet open={calendarOpen} onClose={() => setCalendarOpen(false)}
        panelClassName="h-[70vh]">
        <div className="flex items-center justify-between border-b-2 border-[#3D2008] pb-3">
          <h2 className="font-semibold text-[22px]">Lịch</h2>
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
            weeks={props.weeks}
            selectedSlot={props.selectedSlot}
            openWeekNumber={props.openWeekNumber}
            onToggleWeek={props.onToggleWeek}
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
            className="w-full! shadow-none"
          />
        </div>
      </MobileSheet>

      {addOpen && (
        <SlotForm
          title="Thêm ngày trong tuần"
          onClose={() => setAddOpen(false)}
          onSave={props.onCreateSlot}
          error={props.slotError}
        />
      )}
    </main>
  );
}
