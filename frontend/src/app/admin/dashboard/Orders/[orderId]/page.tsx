"use client";

import { useParams } from "next/navigation";
import MobileOrderDetailPage from "../../Orders/mb-OrderDetailPage";

export default function AdminOrderDetailRoute() {
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);

  if (!Number.isInteger(orderId) || orderId <= 0) return null;
  return <MobileOrderDetailPage orderId={orderId} />;
}
