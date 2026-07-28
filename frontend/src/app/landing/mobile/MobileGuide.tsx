"use client";

import { useState } from "react";

const ITEMS = [
  {
    title: "Chọn Ngày Nhận Bánh",
    content: [
      "Để đảm bảo chất lượng, mỗi ngày chúng tôi chỉ nhận 50 đơn bánh.",
      "Thời gian nhận bánh từ ngày 01/09 đến ngày 31/10.",
    ],
  },
  {
    title: "Chọn Phương Thức Nhận Bánh",
    content: [
      "Đến lấy tại nhà: nhận bánh theo ngày đã đặt trước.",
      "Giao hàng: chúng tôi sẽ giao đến địa chỉ bạn cung cấp (phí giao tính theo khu vực).",
    ],
  },
  {
    title: "Chọn Phương Thức Thanh Toán",
    content: [
      "Chuyển khoản: thanh toán qua ngân hàng và nhận thông tin chuyển khoản sau khi đặt.",
      "Tiền mặt: thanh toán khi nhận hàng hoặc khi đơn vị vận chuyển giao hàng.",
    ],
  },
];

export default function MobileGuide() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-[960px] px-5 py-10">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#F7EACC]">Hướng dẫn</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#FDF6E8] sm:text-4xl">Đặt bánh dễ dàng, nhận ngay niềm vui</h2>
      </div>

      <div className="space-y-3 rounded-[32px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
        {ITEMS.map((item, index) => {
          const active = index === activeIndex;
          return (
            <div key={item.title} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => setActiveIndex(active ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-white"
              >
                <span className="text-base font-semibold">{item.title}</span>
                <span className="text-xl">{active ? "−" : "+"}</span>
              </button>
              <div
                className={`transition-[max-height] duration-300 overflow-hidden px-4 ${active ? "pb-4" : "pb-0"}`}
                style={{ maxHeight: active ? "240px" : "0px" }}
              >
                <ul className="space-y-2 text-sm leading-6 text-[#F7EACC]/90">
                  {item.content.map((line) => (
                    <li key={line} className="list-disc pl-5">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
