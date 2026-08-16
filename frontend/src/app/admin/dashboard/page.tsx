"use client";

import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { axiosClient } from "@/src/api/axios-client";
import { useRouter } from "next/navigation";
import { getAdminAccessToken, getAdminRefreshToken, clearAdminAuth } from "@/src/utils/adminAuth";
import DetailOrder from "./Orders/OrderForm"
import StatForm from "./Stats/StatForm";
import MobileAdminDashboard from "./mobile/mb-Dasboard";
import { CalendarDays, ChevronDown, LogOut, Minus, Plus, X } from "lucide-react";

registerLocale("vi", vi);

type AdminStats = {
  totalRevenue: number | string;
  totalOrders: number;
  completedToday: number;
  pendingOrders: number;
  range: "ALL" | "TODAY" | "WEEK" | "MONTH";
  totalQuantityCakesSold: number;
  totalToday: number;
  totalCakeToday: number;
  pendingToday: number;
  pendingCakeToday: number;
};

type SlotCake = {
  cakeId: number;
  cakeName: string;
  maxCapacity: number;
  currentBooked: number;
  bufferLimit: number;
};

type SlotDate = {
  date: string;
  cake: SlotCake;
  orderCount: number;
};

type WeekGroup = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  slots: SlotDate[];
};

const getTodayVN = (): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
};

const getMonday = (dateString: string): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
};

const addDays = (dateString: string, amount: number): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};

const formatDate = (dateString: string): string => {
  const [, month, day] = dateString.split("-");
  return `${day}/${month}`;
};

const groupSlotsByWeek = (slots: SlotDate[], today: string): WeekGroup[] => {
  const futureSlots = slots.filter((slot) => slot.date >= today);
  const weekMap = new Map<string, SlotDate[]>();

  for (const slot of futureSlots) {
    const weekStart = getMonday(slot.date);
    const currentSlots = weekMap.get(weekStart) ?? [];
    weekMap.set(weekStart, [...currentSlots, slot]);
  }

    return [...weekMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStart, weekSlots], index) => ({
            weekNumber: index + 1,
            weekStart,
            weekEnd: addDays(weekStart, 6),
            slots: weekSlots.map((s) => ({
            date: s.date,
            cake: s.cake,
            orderCount: s.orderCount,
        })).sort((a, b) => a.date.localeCompare(b.date)),
    }));
};

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [weeks, setWeeks] = useState<WeekGroup[]>([]);
    const [openWeekNumber, setOpenWeekNumber] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<SlotDate | null>(null);
    const [slotDetail, setSlotDetail] = useState<{ date: string; totalMax: number; totalBooked: number; cakes: { id: number; kind: string; remaining: number }[] } | null>(null);
    const [slotLoading, setSlotLoading] = useState(false);
    const [slotError, setSlotError] = useState<string | null>(null);
    const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [slotModalDate, setSlotModalDate] = useState("");
    const [slotModalCapacity, setSlotModalCapacity] = useState(0);
    const [slotModalSaving, setSlotModalSaving] = useState(false);

    const MIN_SLOT_CAPACITY = 1;
    
    useEffect(() => {
        const at_key = getAdminAccessToken();
        if (!at_key) {
            router.replace("/admin/login");
            return;
        }
        setCheckingAuth(false);
    }, [router]);

    //format
    const formatDayOfWeek = (date: string | Date) => { 
        const d = new Date(date); 
        const weekdays = [
            "Chủ nhật",
            "Thứ Hai",
            "Thứ Ba",
            "Thứ Tư",
            "Thứ Năm",
            "Thứ Sáu",
            "Thứ Bảy",
        ];

        return weekdays[d.getDay()];
    }

    const fetchStats = async (showLoadingSpinner = true) => {
        try {
            if (showLoadingSpinner) setLoading(true);
            setError(null);

            const response = await axiosClient.get<AdminStats>(
                "/admin/stats?range=ALL"
            );

            setStats(response as unknown as AdminStats);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Không thể tải thống kê";
            setError(message);
        } finally {
            if (showLoadingSpinner) setLoading(false);
        }
    };
    const fetchCalendar = async () => {
        try {
            const slots = await axiosClient.get<SlotDate[]>(
                "/availability/admin/calendar"
            );
            const today = getTodayVN();
            const grouped = groupSlotsByWeek(
                slots as unknown as SlotDate[],
                today,
            );
            setWeeks(grouped);
            if (grouped.length > 0) {
                setOpenWeekNumber(grouped[0].weekNumber);
            }
        } catch {
            // im lặng nếu chưa có slot, sẽ hiện thông báo trong UI
        }
    };

    useEffect(() => {
        fetchStats();
        fetchCalendar();
    }, []);

    useEffect(() => {
        const POLL_INTERVAL = 120_000;
        let timer: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            if (timer) return;
            timer = setInterval(() => {
                fetchStats(false);
                fetchCalendar();
            }, POLL_INTERVAL);
        };

        const stopPolling = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        };

        startPolling();

        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                fetchStats(false);
                fetchCalendar();
                setOrdersRefreshKey((key) => key + 1);
                startPolling();
            } else {
                stopPolling();
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    const handleLogout = async () => {
        try {
            const at = getAdminAccessToken();
            const rt = getAdminRefreshToken();
            if (at) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${at}`,
                    },
                    body: JSON.stringify({ refreshToken: rt }),
                });
            }
        } catch {
            // Vẫn đăng xuất ngay cả khi API gọi lỗi
        } finally {
            clearAdminAuth();
            router.replace("/admin/login");
        }
    };

    if (checkingAuth) return null;

    const toggleWeek = (weekNumber: number) => {
        setOpenWeekNumber((prev) => (prev === weekNumber ? null : weekNumber));
    };

    const openSlotModal = () => {
        setSlotModalDate(getTodayVN());
        setSlotModalCapacity(10);
        setIsSlotModalOpen(true);
    };

    const createSlot = async (date: string, capacity: number) => {
        if (!date || !Number.isInteger(capacity) || capacity < MIN_SLOT_CAPACITY) {
            return false;
        }

        try {
            setSlotModalSaving(true);
            setSlotError(null);
            await axiosClient.post("/availability/setup", {
                cakeId: 2,
                dates: [date],
                maxCapacity: capacity,
            });
            await fetchCalendar();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể thêm slot";
            setSlotError(message);
            return false;
        } finally {
            setSlotModalSaving(false);
        }
    };

    const handleSlotModalSave = async () => {
        const saved = await createSlot(slotModalDate, slotModalCapacity);
        if (saved) setIsSlotModalOpen(false);
    };

    const handleSlotClick = async (slot: SlotDate) => {
        setSelectedSlot(slot);
        setSlotDetail(null);
        setSlotError(null);
        setSlotLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("date", slot.date);
            params.set("cakeId", String(slot.cake.cakeId));
            const res = await axiosClient.get(`/availability/slots?${params.toString()}`);
            setSlotDetail(res as unknown as { date: string; totalMax: number; totalBooked: number; cakes: { id: number; kind: string; remaining: number }[] });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể tải thông tin slot";
            setSlotError(message);
        } finally {
            setSlotLoading(false);
        }
    };

    const handleClickPage1 = () => {
        setCurrentPage(1);
    };

    const handleClickPage2 = () => {
        setCurrentPage(2);
    };

    return (
        <>
            {/* Mobile */}
            <div className="md:hidden">
                {loading && (
                    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] text-[#3D2008]/60 text-sm">
                        Đang tải thống kê...
                    </div>
                )}
                {!loading && error && (
                    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] text-[#FF5F57] text-sm">
                        {error}
                    </div>
                )}
                {!loading && !error && (
                    <MobileAdminDashboard
                        onLogout={handleLogout}
                        stats={stats}
                        weeks={weeks}
                        selectedSlot={selectedSlot}
                        openWeekNumber={openWeekNumber}
                        onToggleWeek={toggleWeek}
                        onSelectSlot={handleSlotClick}
                        onCreateSlot={createSlot}
                        slotError={slotError}
                        ordersRefreshKey={ordersRefreshKey}
                    />
                )}
            </div>

            {/* Desktop */}
            <div className="hidden md:block min-h-screen bg-[#FFFDF7]">
                {loading && (
                    <div className="min-h-screen flex items-center justify-center text-[#3D2008]/60 text-sm">
                        Đang tải thống kê...
                    </div>
                )}
                {!loading && error && (
                    <div className="min-h-screen flex items-center justify-center text-[#FF5F57] text-sm">
                        {error}
                    </div>
                )}
                {!loading && !error && stats && (
                    <div className="flex justify-center p-5">
                        <div className="max-w-340 w-full h-full text-[#3D2008]">
                {/* Header */}
                <div className="w-full h-[20vh] flex justify-between gap-5">
                    {/* left */}
                    <div className="border border-[#FFFDF7] rounded-xl flex justify-between items-center bg-[#FFFDF7] drop-shadow-2xl w-1/2 pl-5">
                        <div className="w-1/2 flex flex-col">
                            <p className="text-[#3D2008]/75
                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                            >Tổng doanh thu</p>

                            <p className="font-semibold
                            text-[19px] sm:text-[20px] md:text-[21px] lg:text-[22px] xl:text-[23px] 2xl:text-[24px]"
                            >{Number(stats.totalRevenue).toLocaleString("vi-VN")} đ</p>

                            <p className="text-[#3D2008]/75
                            text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                            >Từ đơn đã xử lý</p>
                        </div>

                        <div className="w-[1.5px] h-[60%] bg-[#3D2008] mr-5" />

                        <div className="w-1/2 flex flex-col">
                            <p className="text-[#3D2008]/75
                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                            >Tổng đơn đã nhận</p>

                            <p className="font-semibold
                            text-[19px] sm:text-[20px] md:text-[21px] lg:text-[22px] xl:text-[23px] 2xl:text-[24px]"
                            >{stats.totalOrders} đơn</p>

                            <p className="text-[#3D2008]/75
                            text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                            >{stats.totalQuantityCakesSold} bánh</p>
                        </div>
                    </div>
                    {/* right */}
                    <div className="border border-[#FFFDF7] rounded-xl flex justify-between items-center bg-[#FFFDF7] drop-shadow-2xl w-1/2 pl-5">
                        <div className="w-1/2 flex flex-col">
                            <p className="text-[#3D2008]/75
                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                            >Đơn trong ngày đã nhận</p>

                            <p className="font-semibold
                            text-[19px] sm:text-[20px] md:text-[21px] lg:text-[22px] xl:text-[23px] 2xl:text-[24px]"
                            >{stats.totalToday} đơn</p>

                            <p className="text-[#3D2008]/75
                            text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                            > {stats.totalCakeToday} bánh</p>
                        </div>

                        <div className="w-[1.5px] h-[60%] bg-[#3D2008] mr-5" />

                        <div className="w-1/2 flex flex-col">
                            <p className="text-[#3D2008]/75
                            text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px]"
                            >Đơn trong ngày chưa xử lý</p>

                            <p className="font-semibold
                            text-[19px] sm:text-[20px] md:text-[21px] lg:text-[22px] xl:text-[23px] 2xl:text-[24px]"
                            >{stats.pendingToday} đơn</p>

                            <p className="text-[#3D2008]/75
                            text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]"
                            >{stats.pendingCakeToday} bánh</p>
                        </div>
                    </div>
                </div>

                {/* content */}
                <div className="w-full flex flex-col mt-10 bg-[#FFFDF7]">
                    {/* header */}
                    <div className="h-fit w-full border-b-2 border-[#3D2008] flex items-center justify-between">
                        <div className="flex">
                            <button onClick={handleClickPage1}
                            className={`px-4 py-2 border border-b-0 rounded-md font-semibold transition-colors duration-200 
                            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]
                            ${currentPage === 1 ? "bg-[#3D2008] text-[#FDF6E8]" : "" }`}
                            >Đơn Bánh
                            </button>

                            <button onClick={handleClickPage2}
                            className={`px-4 py-2 border border-b-0 rounded-md font-semibold transition-colors duration-200
                            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]
                            ${currentPage === 2 ? "bg-[#3D2008] text-[#FDF6E8]" : "" }`}
                            >Thống kê
                            </button>
                        </div>

                        <button onClick={handleLogout}
                        className="flex items-center gap-1.5 px-2 py-0.5 border border-red-400 text-red-500 rounded-md font-semibold transition-colors duration-200 hover:bg-red-50
                        text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]"
                        >
                            <LogOut size={12} />
                            <span className="hidden sm:inline">Đăng xuất</span>
                        </button>
                    </div>

                    {/* Page 1 */}
                    {currentPage === 1 ? (
                        <div className="w-full mt-5 flex">
                            {/* left canlendar */}
                            <div className="w-[25%] max-h-150 border rounded-2xl border-[#3D2008]/25 p-4 overflow-y-auto no-scrollbar">
                                <div className="flex items-center justify-between border-b-2 border-[#3D2008] pb-2">
                                    <p className="font-semibold text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">Lịch</p>
                                </div>

                                {weeks.length === 0 && (
                                    <p className="text-[#3D2008]/60 mt-4 text-center
                                    text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">Chưa có slot sắp tới</p>
                                )}

                                <div className="flex flex-col gap-2 mt-3">
                                    {weeks.map((week) => {
                                        const isOpen = openWeekNumber === week.weekNumber;
                                        return (
                                            <div key={week.weekStart} className="border-b rounded-lg border-[#3D2008]/25">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleWeek(week.weekNumber)}
                                                    className="w-full flex justify-between items-center px-3 py-2 font-light text-left
                                                    text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]"
                                                >
                                                    <span>Tuần {week.weekNumber}</span>
                                                    <span className="text-[#3D2008]">
                                                        {formatDate(week.weekStart)} đến {formatDate(week.weekEnd)}
                                                    </span>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`transition-transform duration-300 ${
                                                        isOpen ? "rotate-180" : "rotate-0"
                                                        }`}
                                                    />
                                                </button>

                                                {isOpen && (
                                                    <div className="flex flex-col gap-1 px-3 py-2 border-t border-[#3D2008]/25">
                                                        {week.slots.map((slot) => {
                                                            const isSelected = selectedSlot?.date === slot.date && selectedSlot?.cake.cakeId === slot.cake.cakeId;
                                                            return(
                                                                <button
                                                                    type="button"
                                                                    key={`${slot.date}-${slot.cake.cakeId}`}
                                                                    onClick={() => handleSlotClick(slot)}
                                                                    className={`flex flex-col px-2 py-2 rounded-lg text-left transition-colors duration-200 border-2
                                                                    ${isSelected ? "bg-[#3D2008] text-[#FDF6E8] border-[#FDF6E8] ring-1 ring-[#3D2008]"
                                                                        : "bg-white border-[#3D2008]/25 hover:border-[#3D2008]"}`}
                                                                >
                                                                    <div className="flex justify-between
                                                                    text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                                                                        <span className="font-medium">
                                                                            {formatDayOfWeek(slot.date)}
                                                                        </span>

                                                                        <span>
                                                                            {slot.orderCount} đơn
                                                                        </span>
                                                                    </div>

                                                                    <div className={`flex justify-between items-end font-light ${isSelected ? "text-[#FDF6E8]/75" : "text-[#3D2008]/75"}
                                                                    text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]`}>
                                                                        <span>{formatDate(slot.date)}</span>

                                                                        <span>
                                                                            {slot.cake.currentBooked} bánh
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Add slot button */}
                                <div className="flex w-full items-center gap-1">
                                    <button
                                        type="button"
                                        title="Chọn ngày để thêm slot"
                                        onClick={openSlotModal}
                                        className="w-full flex items-center justify-center gap-1 rounded-lg px-6 py-3 mt-5 font-semibold
                                        bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors text-[14px] disabled:opacity-50"
                                    >
                                        <Plus size={18} /> Thêm ngày
                                    </button>
                                </div>                
                            </div>

                            {/* right detail order */}
                            {selectedSlot ? (
                                <DetailOrder
                                    slotDate={selectedSlot.date}
                                    cakeId={selectedSlot.cake.cakeId}
                                    cakeName={selectedSlot.cake.cakeName}
                                    onBack={() => setSelectedSlot(null)}
                                    refreshKey={ordersRefreshKey}
                                />
                            ) : (
                                <div className="w-[74%] ml-5 rounded-2xl  p-4 max-h-150 flex items-center justify-center">
                                    <p className="text-[#3D2008]/60 text-center
                                    text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                                        Chọn 1 ngày trong lịch để xem chi tiết
                                    </p>
                                </div>
                            )}
                        </div>
                    ): ""}

                    {/* Add slot */}
                    {isSlotModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="w-full max-w-sm rounded-2xl bg-[#FFFDF7] p-6 text-[#3D2008] shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold
                                    text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">Thêm ngày trong tuần</h2>
                                    <button type="button" onClick={() => setIsSlotModalOpen(false)} className="rounded-md p-1 hover:bg-[#3D2008]/10">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mt-2 space-y-4">
                                    <label className="flex flex-col gap-1 text-sm">
                                        <div className="flex items-center gap-2 rounded-lg border border-[#3D2008]/20 bg-white px-3 py-2">                                        
                                            <DatePicker
                                                selected={slotModalDate ? new Date(`${slotModalDate}T00:00:00`) : null}
                                                onChange={(date: Date | null) => {
                                                    if (!date) {
                                                        setSlotModalDate("");
                                                        return;
                                                    }

                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, "0");
                                                    const day = String(date.getDate()).padStart(2, "0");
                                                    setSlotModalDate(`${year}-${month}-${day}`);
                                                }}
                                                locale="vi"
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Chọn ngày"
                                                className="w-full bg-transparent outline-none"
                                                wrapperClassName="w-full"
                                                calendarClassName="vietnamese-calendar"
                                                showPopperArrow={false}
                                            />
                                            <CalendarDays size={17} />
                                        </div>
                                    </label>

                                    <label className="flex flex-col gap-1 text-sm">
                                        <span className="font-medium 
                                        text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">Thêm số lượng bánh sẽ bán trong ngày</span>
                                        <div className="flex justify-between mt-3">
                                            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]">Số lượng bánh</p>
                                            <div className="flex w-fit items-center justify-center rounded-2xl border border-[#3D2008] px-1 py-1">
                                                <button
                                                    type="button"
                                                    aria-label="Giảm số lượng bánh"
                                                    onClick={() => setSlotModalCapacity((prev) => Math.max(MIN_SLOT_CAPACITY, prev - 1))}
                                                    disabled={slotModalSaving || slotModalCapacity <= MIN_SLOT_CAPACITY}
                                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8] transition-all duration-150 hover:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Minus size={20} />
                                                </button>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    min={MIN_SLOT_CAPACITY}
                                                    step={1}
                                                    value={slotModalCapacity}
                                                    onChange={(event) => {
                                                        const parsed = Number(event.target.value);
                                                        if (Number.isFinite(parsed)) setSlotModalCapacity(Math.max(MIN_SLOT_CAPACITY, Math.trunc(parsed)));
                                                    }}
                                                    onBlur={() => setSlotModalCapacity((prev) => Math.max(MIN_SLOT_CAPACITY, Math.trunc(prev)))}
                                                    onKeyDown={(event) => {
                                                        if (["e", "E", "+", "-", ".", ","].includes(event.key)) event.preventDefault();
                                                    }}
                                                    disabled={slotModalSaving}
                                                    aria-label="Số lượng bánh"
                                                    className="w-8 bg-transparent text-center font-medium text-[#3D2008] outline-none [appearance:textfield] text-[clamp(13px,1.1vw,16px)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Tăng số lượng bánh"
                                                    onClick={() => setSlotModalCapacity((prev) => prev + 1)}
                                                    disabled={slotModalSaving}
                                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3D2008] text-[#FDF6E8] transition-all duration-150 hover:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        disabled={slotModalSaving || !slotModalDate || !Number.isInteger(slotModalCapacity) || slotModalCapacity < MIN_SLOT_CAPACITY}
                                        onClick={handleSlotModalSave}
                                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm disabled:cursor-not-allowed 
                                        bg-[#C01F1F] text-[#FDF6E8] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors disabled:opacity-50
                                        font-semibold text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px]"
                                    >
                                        {slotModalSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Page 2 */}
                    {currentPage === 2 && (
                        <div className="w-full mt-5 pt-5">
                            <StatForm />
                        </div>
                    )}
                </div>

                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
