'use client';

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    panelClassName?: string;
    closeOnOverlayClick?: boolean;
};

export default function Modal({
    open,
    onClose,
    children,
    panelClassName = "",
    closeOnOverlayClick = true,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open) return null;

    if (typeof window === "undefined") return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
                if (closeOnOverlayClick) onClose();
            }}
        >
            <div
                className={panelClassName}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}