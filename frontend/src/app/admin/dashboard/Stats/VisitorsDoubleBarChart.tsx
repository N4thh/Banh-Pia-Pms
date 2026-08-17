"use client";

import ReactECharts from "echarts-for-react";

type DailyVisitorStat = {
  weekdayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  newVisitors: number;
  returningVisitors: number;
  visits: number;
  orders: number;
};

const LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export default function VisitorsDoubleBarChart({ data }: { data: DailyVisitorStat[] }) {
  const byDay = new Map(data.map((item) => [item.weekdayIndex, item]));
  const newValues = Array.from({ length: 7 }, (_, index) => byDay.get((index + 1) as DailyVisitorStat["weekdayIndex"])?.newVisitors ?? 0);
  const returningValues = Array.from({ length: 7 }, (_, index) => byDay.get((index + 1) as DailyVisitorStat["weekdayIndex"])?.returningVisitors ?? 0);
  // Conversion rate = số đơn COMPLETED / tổng lượt truy cập * 100.
  const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const average = Math.round((totalVisits / 7) * 10) / 10;
  const conversionRate = totalVisits > 0
    ? Math.round((totalOrders / totalVisits) * 1000) / 10
    : 0;
  const peakIndex = newValues.map((value, index) => value + returningValues[index]).indexOf(Math.max(...newValues.map((value, index) => value + returningValues[index])));

  const option = {
     textStyle: {
      fontFamily: "Be Vietnam Pro",
    },
    animationDuration: 500,
    grid: { top: 28, right: 10, bottom: 0, left: 30, containLabel: true },
    tooltip: { 
      trigger: "axis", 
      axisPointer: { 
        type: "shadow"
      } 
    },
    legend: {
      top: 0,
      right: 0,
      icon: "circle",
      itemGap: 20,
      itemWidth: 6,
      itemHeight: 6, 
      textStyle: { 
        color: "#3D2008" 
      } 
    },
    xAxis: { 
      type: "category", 
      data: LABELS,
      axisLabel: {
        fontSize: 13,
      },
    },
    yAxis: { 
      type: "value", 
      min: 0,
      minInterval:  5,
      name: "Đơn vị: Người",
      nameTextStyle: {
        fontSize: 13,
        fontFamily: "Be Vietnam Pro",
      },
      axisLabel: {
        fontSize: 15, 
      },
      splitLine: { 
        lineStyle: { 
          color: "#3D2008", 
          opacity: 0.1 
        } 
      } 
    },
    series: [
      { name: "Khách hàng mới", type: "bar", barMaxWidth: 22, data: newValues, itemStyle: { color: "#C2973F", borderRadius: [5, 5, 0, 0] } },
      { name: "Khách hàng cũ", type: "bar", barMaxWidth: 22, data: returningValues, itemStyle: { color: "#7A5230", borderRadius: [5, 5, 0, 0] } },
    ],
  };

  return (
    <div className="rounded-2xl border border-[#3D2008]/10 bg-[#FFFDF7] p-4 shadow-xl">
      <div className="mb-2">
        <h2 className="text-base font-medium">Lượng khách truy cập trong tuần</h2>
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="min-w-150">
          <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs text-[#3D2008]">
        <span className="flex flex-col items-center gap-0.5 lg:gap-1
          text-[11px] 2xl:text-[13px]">Tổng 
          <span className="font-medium text-[14px] 2xl:text-[16px]"
            >{totalVisits} người
          </span>
        </span>
        <span className="flex flex-col items-center gap-0.5 lg:gap-1
         text-[11px] 2xl:text-[13px]">TB/ngày 
          <span className="font-medium text-[14px] 2xl:text-[16px]">{average}

          </span>
        </span>
        <span className="flex flex-col items-center gap-0.5 lg:gap-1
          text-[11px] 2xl:text-[13px]">Sôi động nhất
          <span className="font-medium text-[14px] 2xl:text-[16px]"
            >{LABELS[peakIndex]}
          </span>
        </span>
        <span className="flex flex-col items-center gap-0.5 lg:gap-1
          text-[11px] 2xl:text-[13px]">Tỷ lệ chuyển đổi 
          <span className="font-medium text-[14px] 2xl:text-[16px]"
            >{conversionRate}%
          </span>
        </span>
      </div>
    </div>
  );
}
