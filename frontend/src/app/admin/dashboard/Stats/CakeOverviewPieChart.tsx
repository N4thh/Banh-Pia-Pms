"use client";

import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CakeBreakDown = {
  totalCakes: number;
  totalOrders: number;
  byEggCount: Record<string, number>;
  byKind: Record<string, number>;
  byCakeIdEggCount: Record<string, Record<string, number>>;
};

type DailyStat = {
  date: string;
  weekdayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  orders: number;
};

const SAU_RIENG_CAKE_ID = 2;
const WEEKDAY_LABELS = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];
const PALETTE = ["#00C3D0", "#34C759", "#FFCC00", "#FF8D28"];

export default function CakeOverviewPieChart({
  cakeBreakdownByDate,
  daily,
}: {
  cakeBreakdownByDate: Record<string, CakeBreakDown>;
  daily: DailyStat[];
}) {
  const [selectedWeekday, setSelectedWeekday] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  const selectedDayData = useMemo(() => {
    const eggCountMap: Record<string, number> = { "0": 0, "1": 0, "2": 0, "3": 0 };
    let totalOrders = 0;

    // daily chứa các ngày của tất cả tuần đã chọn.
    // Vì vậy cùng weekdayIndex sẽ tự cộng dồn Thứ 2 tuần 1 + Thứ 2 tuần 2.
    for (const day of daily) {
      if (day.weekdayIndex !== selectedWeekday) continue;
      totalOrders += day.orders;

      const breakdown = cakeBreakdownByDate[day.date];
      const sauRiengEggCounts = breakdown?.byCakeIdEggCount[String(SAU_RIENG_CAKE_ID)] ?? {};
      for (const eggCount of Object.keys(eggCountMap)) {
        eggCountMap[eggCount] += sauRiengEggCounts[eggCount] ?? 0;
      }
    }

    return {
      eggCountMap,
      totalOrders,
      totalCakes: Object.values(eggCountMap).reduce((sum, quantity) => sum + quantity, 0),
    };
  }, [cakeBreakdownByDate, daily, selectedWeekday]);

  const data = Object.entries(selectedDayData.eggCountMap).map(([eggCount, value]) => ({
    name: `${eggCount} trứng muối`,
    value,
  }));

  const option = {
     textStyle: {
      fontFamily: "Be Vietnam Pro",
    },
    animationDuration: 500,
    tooltip: {
      trigger: "item",
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}<br/>Số bánh: <b>${params.value}</b><br/>Tỷ lệ: <b>${params.percent}%</b>`,
    },
    legend: {
      bottom: 0,
      icon: "circle",
      itemGap: 20,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#3D2008", fontSize: 13},
      formatter: (name: string) => {
        const item = data.find((entry) => entry.name === name);
        const percent = selectedDayData.totalCakes > 0 && item
          ? Math.round((item.value / selectedDayData.totalCakes) * 100)
          : 0;
        return `${name}\n${percent}%`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "72%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#FFFDF7", borderWidth: 2 },
        label: { show: false, formatter: "{b}\n{d}%", fontSize: 12, color: "#3D2008" },
        data,
        color: PALETTE,
        labelLine: {
          show: false,
        }
      },
    ],
    
    graphic: [
      {
        type: "text",
        left: "center",
        top: "40%",
        style: {
          text: `${String(selectedDayData.totalCakes)} bánh`,
          fill: "#3D2008",
          fontWeight: "bold",
          fontSize: 20,
          textAlign: "center",
        },
      },
      {
        type: "text",
        left: "center",
        top: "48%",
        style: {
          text: `${selectedDayData.totalOrders} đơn`,
          fill: "#3D2008",
          fontSize: 12,
          textAlign: "center",
        },
      },
    ],
  };

  return (
    <div className="h-full rounded-2xl border border-[#3D2008]/10 bg-[#FFFDF7] p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={selectedWeekday === 1}
          onClick={() => setSelectedWeekday((day) => (day - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
          className="rounded-md px-2 py-1 text-lg disabled:cursor-not-allowed disabled:opacity-25 hover:bg-[#3D2008]/10"
        >
          <ChevronLeft />
        </button>
        <div className="text-center">
          <p className="text-[#3D2008] font-medium
          text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]"
          >{WEEKDAY_LABELS[selectedWeekday - 1]}</p>
        </div>
        <button
          type="button"
          aria-label="Ngày tiếp theo"
          disabled={selectedWeekday === 7}
          onClick={() => setSelectedWeekday((day) => (day + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
          className="rounded-md px-2 py-1 text-lg disabled:cursor-not-allowed disabled:opacity-25 hover:bg-[#3D2008]/10"
        >
          <ChevronRight />
        </button>
      </div>
      <ReactECharts option={option} style={{ height: 370, width: "100%" }} />
    </div>
  );
}
