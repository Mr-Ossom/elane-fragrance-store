import { NextResponse } from "next/server";
import { getOrderByReference, getOrderByNumberAndPhone } from "@/lib/data-access/store";

// Lookup an order either by an unguessable payment reference token
// (used by the confirmation page) or by order number + matching phone
// (used by the public guest tracking page).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const number = searchParams.get("number");
  const phone = searchParams.get("phone");

  if (reference) {
    const order = await getOrderByReference(reference);
    if (!order) return NextResponse.json({ order: null });
    return NextResponse.json({ order: publicOrder(order) });
  }

  if (number && phone) {
    const order = await getOrderByNumberAndPhone(number, phone);
    if (!order) return NextResponse.json({ order: null });
    return NextResponse.json({ order: publicOrder(order) });
  }

  return NextResponse.json({ order: null });
}

function publicOrder(order: import("@/types").Order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    customer: {
      phone: order.customer.phone,
      city: order.customer.city,
      region: order.customer.region,
    },
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    paymentReference: order.paymentReference,
    createdAt: order.createdAt,
  };
}