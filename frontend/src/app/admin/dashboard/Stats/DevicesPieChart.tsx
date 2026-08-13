"use client";

import ReactECharts from "echarts-for-react";

type Devices = { mobile: number; desktop: number; other: number; total: number };

export default function DevicesPieChart({ devices }: { devices: Devices }) {
  const data = [
    { name: "Mobile", value: devices.mobile },
    { name: "Web/Desktop", value: devices.desktop },
    { name: "Khác", value: devices.other },
  ];

  const option = {
     textStyle: {
      fontFamily: "Be Vietnam Pro",
    },
    tooltip: {
      trigger: "item",
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}<br/>Lượt truy cập: <b>${params.value}</b><br/>Tỷ lệ: <b>${params.percent}%</b>`,
    },
    legend: {
      bottom: 20,
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: {
        color: "#3D2008",
        fontSize: 13,
        lineHeight: 18,
      },
      formatter: (name: string) => {
        const item = data.find((entry) => entry.name === name);
        const percent = devices.total > 0 && item
          ? Math.round((item.value / devices.total) * 100)
          : 0;
        return `${name}\n${percent}%`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "72%"],
        center: ["50%", "44%"],
        itemStyle: { borderRadius: 6, borderColor: "#FFFDF7", borderWidth: 2 },
        label: { show: false, formatter: "{b}\n{d}%", color: "#3D2008" },
        data,
        color: ["#C2973F", "#3D2008", "#3D200826"],
        labelLine: {
          show: false,
        }
      },
    ],
    graphic: [{
      type: "text",
      left: "center",
      top: "38%",
      style: { text: String(devices.total), fill: "#3D2008", fontSize: 22, fontWeight: "bold", textAlign: "center" },
    }, {
      type: "text",
      left: "center",
      top: "46%",
      style: { text: "Thiết bị", fill: "#3D2008", fontSize: 15, textAlign: "center" },
    }],
  };

  return (
    <div className="rounded-2xl border border-[#3D2008]/10 bg-[#FFFDF7] shadow-xl">
      <h2 className="text-base font-semibold p-4">Thiết bị truy cập trong tuần </h2>
      <div>
        <ReactECharts option={option} style={{ height: 350, width: "100%" }}
        className="-mt-10" />
      </div>
    </div>
  );
}
