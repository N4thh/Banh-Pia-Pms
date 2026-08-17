"use client";

import { useEffect, useState } from "react";
import { axiosClient } from "@/src/api/axios-client";
import { Check } from "lucide-react";
import {
  addDays,
  getMonday,
  getWeekNumberFromAnchor,
} from "@/src/utils/calendarWeeks";

export type StatsWeekSelection = {
  startDate: string;
  endDate: string;
  weeks: number;
};

export type StatsCalendarWeek = StatsWeekSelection & { weekNumber: number };

type SlotCalendarItem = {
  date: string;
};

const getTodayVN = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());

const formatDate = (dateString: string) => {
  const [, month, day] = dateString.split("-");
  return `${day}/${month}`;
};

function buildCompletedWeeks(items: SlotCalendarItem[], today: string): StatsCalendarWeek[] {
  const dates = [...new Set(items.map((item) => item.date))].sort();
  if (dates.length === 0) return [];

  const result: StatsCalendarWeek[] = [];
  const firstWeekStart = getMonday(dates[0]);
  let currentStart = firstWeekStart;

  while (currentStart <= today) {
    const currentEnd = addDays(currentStart, 6);
    const fullWeek = Array.from({ length: 7 }, (_, offset) =>
      addDays(currentStart, offset),
    ).every((date) => dates.includes(date));

    if (currentEnd <= today && fullWeek) {
      result.push({
        weekNumber: getWeekNumberFromAnchor(firstWeekStart, currentStart),
        startDate: currentStart,
        endDate: currentEnd,
        weeks: 1,
      });
    }

    currentStart = addDays(currentStart, 7);
  }

  return result;
}

export default function StatsCalendar({
  selectedWeeks,
  onSelect,
  singleSelect = false,
  onWeekSelected,
  className = "",
}: {
  selectedWeeks?: StatsWeekSelection;
  onSelect: (selection: StatsWeekSelection | null) => void;
  singleSelect?: boolean;
  onWeekSelected?: (week: StatsCalendarWeek | null) => void;
  className?: string;
}) {
  const [weeks, setWeeks] = useState<StatsCalendarWeek[]>([]);
  const [selectedWeekNumbers, setSelectedWeekNumbers] = useState<number[]>([]);

  useEffect(() => {
    let active = true;

    const loadCalendar = async () => {
      try {
        const response = await axiosClient.get<SlotCalendarItem[]>(
          "/availability/admin/stats-calendar",
        );
        const items = response as unknown as SlotCalendarItem[];
        if (active) setWeeks(buildCompletedWeeks(items, getTodayVN()));
      } catch {
        if (active) setWeeks([]);
      }
    };

    void loadCalendar();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedWeeks || weeks.length === 0) return;
    setSelectedWeekNumbers(
      weeks
        .filter(
          (week) =>
            week.startDate >= selectedWeeks.startDate &&
            week.endDate <= selectedWeeks.endDate,
        )
        .map((week) => week.weekNumber),
    );
  }, [selectedWeeks, weeks]);

  const toggleWeek = (week: StatsCalendarWeek) => {
    if (singleSelect) {
      setSelectedWeekNumbers([week.weekNumber]);
      onSelect(week);
      onWeekSelected?.(week);
      return;
    }

    const next = selectedWeekNumbers.includes(week.weekNumber)
      ? selectedWeekNumbers.filter((number) => number !== week.weekNumber)
      : [...selectedWeekNumbers, week.weekNumber];

    if (next.length === 0) {
      setSelectedWeekNumbers([]);
      onSelect(null);
      onWeekSelected?.(null);
      return;
    }

    const sorted = [...next].sort((a, b) => a - b);
    const isConsecutive = sorted.every(
      (number, index) => index === 0 || number === sorted[index - 1] + 1,
    );
    if (!isConsecutive) return;

    const selected = sorted
      .map((number) => weeks.find((item) => item.weekNumber === number))
      .filter((item): item is StatsCalendarWeek => Boolean(item));

    setSelectedWeekNumbers(sorted);
    const selection = {
      startDate: selected[0].startDate,
      endDate: selected[selected.length - 1].endDate,
      weeks: selected.length,
    };
    onSelect(selection);
    onWeekSelected?.(selected.length === 1 ? selected[0] : null);
  };

  return (
    <aside className={`w-full shrink-0 rounded-xl border border-[#3D2008]/15 bg-white p-4 shadow-xl lg:w-72 ${className}`}>
      <p className="mb-3 border-b-2 border-[#3D2008] pb-2 font-semibold">
        Lịch thống kê
      </p>
      {weeks.length === 0 ? (
        <p className="text-sm text-[#3D2008]/60">
          Chưa có tuần đã hoàn thành
        </p>
      ) : (
        <div className="flex flex-col gap-2 font-light
        text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px]">
          {weeks.map((week) => {
            const checked = selectedWeekNumbers.includes(week.weekNumber);
            return (
              <button
                key={week.startDate}
                type="button"
                onClick={() => toggleWeek(week)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-3 text-left transition-colors ${
                  checked
                    ? "border-[#3D2008] bg-[#3D2008] text-[#FDF6E8]"
                    : "border-[#3D2008]/20 bg-white hover:border-[#3D2008]"
                }`}
              >
                <span className="font-medium">Tuần {week.weekNumber}</span>
                <span>
                  {formatDate(week.startDate)} đến {formatDate(week.endDate)}
                </span>
                <span
                  aria-label={checked ? "Đã chọn" : "Chưa chọn"}
                  className={`flex h-3 w-3 shrink-0 items-center justify-center rounded border  ${
                    checked ? "border-[#FDF6E8]" : "border-[#3D2008]/40"
                  }`}
                >
                  {checked ? (<Check/> ) : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
