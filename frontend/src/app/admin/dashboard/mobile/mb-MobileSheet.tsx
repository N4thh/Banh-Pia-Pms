"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/src/components/Modal";

const DRAG_CLOSE_THRESHOLD = 160;

type MobileSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
};

export default function MobileSheet({
  open,
  onClose,
  children,
  panelClassName = "h-[88vh]",
}: MobileSheetProps) {
  const [render, setRender] = useState(open);
  const [visible, setVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const deltaY = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    setDragY(0);
    const timer = window.setTimeout(() => setRender(false), 250);
    return () => clearTimeout(timer);
  }, [open]);

  if (!render) return null;

  return (
    <Modal
      open={render}
      onClose={onClose}
      panelClassName={`fixed inset-x-0 bottom-0 m-0 flex max-h-[82vh] w-full max-w-none flex-col rounded-t-2xl rounded-b-none bg-[#FFFDF7] text-[#3D2008] shadow-2xl ${panelClassName}`}
      panelStyle={{
        transform: visible ? `translateY(${dragY}px)` : "translateY(100%)",
        transition: isDragging
          ? "none"
          : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <div
        className="flex justify-center py-3 touch-none"
        onPointerDown={(event) => {
          dragging.current = true;
          setIsDragging(true);
          startY.current = event.clientY;
          deltaY.current = 0;
          setDragY(0);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          deltaY.current = Math.max(0, event.clientY - startY.current);
          setDragY(deltaY.current);
        }}
        onPointerUp={(event) => {
          if (!dragging.current) return;
          dragging.current = false;
          setIsDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);

          if (deltaY.current > DRAG_CLOSE_THRESHOLD) {
            onClose();
          } else {
            deltaY.current = 0;
            setDragY(0);
          }
        }}
        onPointerCancel={() => {
          if (!dragging.current) return;
          dragging.current = false;
          setIsDragging(false);
          deltaY.current = 0;
          setDragY(0);
        }}
      >
        <span className="h-1.5 w-18 rounded-full bg-[#3D2008]/25" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-[5vw] pb-[calc(24px+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </Modal>
  );
}
