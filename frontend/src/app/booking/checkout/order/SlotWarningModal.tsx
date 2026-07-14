"use client";

import Modal from "@/src/components/Modal";

export interface SlotViolation {
    kind: string;
    productName: string;
    ordered: number;
    remaining: number;
    enough: boolean;
}

type SlotWarningModalProps = {
    open: boolean;
    date: string; 
    violations: SlotViolation[];
    onClose: () => void;
    onGoBack: () => void; 
};

export default function SlotWarningModal({
    open,
    date,
    violations,
    onClose,
    onGoBack,
}: SlotWarningModalProps) {

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeOnOverlayClick={false}
            panelClassName="rounded-2xl w-full max-w-[85vw] sm:max-w-[65vw] md:max-w-[50vw] max-h-[90vh] overflow-y-auto bg-[#FFFDF7] shadow-2xl p-6 sm:p-8"
        >
            <div className="flex flex-col gap-5 text-[#3D2008]">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <h2 className="font-vollkorn font-semibold leading-snug
                        text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px]">
                        Cửa hàng chưa đủ số lượng bánh cho ngày {date}
                    </h2>
                </div>

                {/* Subtitle */}
                <p className="leading-relaxed
                    text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px]">
                    Hiện tại loại bánh bạn chọn không còn đủ số lượng:
                </p>

                {/* Violations list */}
                <div className="flex flex-col gap-3">
                    {violations.map((v) => (
                        <div
                            key={v.kind}
                            className={`flex items-start gap-3 rounded-xl p-4 border
                                ${v.enough
                                    ? "bg-green-50"
                                    : "bg-[#C01F1F]/5 "
                                }`}
                        >
                            <div className="mt-0.5 shrink-0">

                            </div>
                            <p className="leading-relaxed
                                text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px]">
                                {v.productName}:{" "}
                                {v.enough ? (
                                    <span className="font-medium text-green-700">
                                        Đủ số lượng bạn chọn
                                    </span>
                                ) : (
                                    <span className="font-medium">
                                      Hiện <span className=" text-[#C01F1F]">chỉ còn {v.remaining} bánh</span>
                                    </span>
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Guidance */}
                <div className="bg-[#3D2008]/5 rounded-xl p-4">
                    <p className="font-semibold mb-2
                        text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px]">
                        Để tiếp tục mua hàng, bạn vui lòng:
                    </p>
                    <ul className="list-disc list-inside space-y-1 leading-relaxed
                        text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]">
                        {violations
                            .filter((v) => !v.enough)
                            .map((v) => (
                                <li key={v.kind}>
                                    Giảm bớt số lượng bánh {v.productName.toLowerCase()}
                                </li>
                            ))}
                        <li>Hoặc chọn một ngày nhận bánh khác giúp chúng tôi</li>
                    </ul>
                </div>
                <h2 className="font-semibold leading-snug
                    text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px]">
                    Pía Cô Loan xin lỗi vì sự bất tiện này
                </h2>               
                <div className="flex flex-col gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onGoBack}
                        className="w-full py-3.5 px-6 rounded-xl font-semibold border border-[#C01F1F]
                            text-white bg-[#C01F1F]
                            text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px]
                            hover:bg-[#A61B1B] active:bg-[#8B1515] transition-colors"
                    >
                        Sửa số lượng bánh
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3.5 px-6 rounded-xl font-semibold
                            border-2 border-[#3D2008] text-[#3D2008] bg-transparent
                            text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px]
                            hover:bg-[#3D2008]/5 active:bg-[#3D2008]/10 transition-colors"
                    >
                        Chọn ngày khác
                    </button>
                </div>
            </div>
        </Modal>
    );
}
