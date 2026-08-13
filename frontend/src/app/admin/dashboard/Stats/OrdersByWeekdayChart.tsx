"use client";

import ReactECharts from "echarts-for-react";

type WeekdayStat = {
  weekdayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  label: string;
  orders: number;
};

export default function OrdersByWeekdayChart({
  data,
}: {
  data: WeekdayStat[];
}) {
  const orderedData = [...data].sort(
    (a, b) => a.weekdayIndex - b.weekdayIndex,
  );

  const option = {
     textStyle: {
      fontFamily: "Be Vietnam Pro",
    },
    animationDuration: 500,
    grid: {
      top: 20,
      right: 15,
      bottom: 24,
      left: 0 ,
      containLabel: false,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const item = params[0];
        return `${item.name}<br/>Số đơn: <b>${item.value}</b>`;
      },
    },
    xAxis: {
      type: "value",
      min: 0,
      minInterval: 10,
      splitLine: { lineStyle: { color: "#C2973F", opacity: 0.1 } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: orderedData.map((item) => item.label),
      axisLine: { show: false },
      axisTick: { show: false },
      
      axisLabel: {
        align: "center",
        margin: 50,
        color: "#3D2008",
        fontSize: 13, 
      }
    },
    series: [
      {
        name: "Đơn hàng",
        type: "bar",
        barMaxWidth: 28,
        data: orderedData.map((item) => item.orders),
        itemStyle: {
          color: "#C2973F",
          borderRadius: [0, 6, 6, 0],
        },
        label: {
          position: "right",
          color: "#C2973F",
        },
      },
    ],
    graphic: [
      {
        type: "group",
        left: 24,
        top: 0,
        children: [
          {
            type: "circle",
            shape: {
              r: 5,
            },
            style: {
              fill: "#C2973F",
            },
          },
          {
            type: "text",
            left: 12,
            top: -7,
            style: {
              text: "Đơn hàng",
              fill: "#3D2008",
              fontSize: 12,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-[#3D2008]/10 bg-[#FFFDF7] p-4 shadow-xl">
      <h2 className="mb-2 text-base font-semibold">Doanh số đơn trong tuần</h2>
      <ReactECharts option={option} style={{ height: 320, width: "100%" }} />
    </div>
  );
}
