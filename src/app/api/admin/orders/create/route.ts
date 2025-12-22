import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OrderItemInput = {
  productId: string;
  productName: string;
  unit: string;
  pricePaisa: number;
  qty: number;
};

// POST - Create order (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      items,
      customerName,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      lat,
      lng,
      notes,
      paymentMethod,
      paymentStatus,
      deliveryStatus,
      deliveryChargePaisa,
    } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }
    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Customer details required" }, { status: 400 });
    }
    if (!addressLine1 || !city || !postalCode) {
      return NextResponse.json({ error: "Delivery address required" }, { status: 400 });
    }

    // Calculate total
    const totalPaisa = items.reduce(
      (sum: number, item: OrderItemInput) => sum + item.pricePaisa * item.qty,
      0
    ) + (deliveryChargePaisa || 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state: state || "",
        postalCode,
        lat: lat || null,
        lng: lng || null,
        totalPaisa,
        notes: notes || null,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentStatus || "PENDING",
        status: "PENDING",
        deliveryStatus: deliveryStatus || "PENDING",
        items: {
          create: items.map((item: OrderItemInput) => ({
            productId: item.productId,
            productSlug: "", // Optional, can be fetched if needed
            productName: item.productName,
            unit: item.unit,
            quantity: item.qty,
            pricePaisa: item.pricePaisa,
          })),
        },
      },
      include: { items: true },
    });

    console.log("✅ Admin created order:", order.id);

    // Send email notification to admin (fire and forget)
    fetch(`${process.env.NEXTAUTH_URL || "http://localhost:4000"}/api/admin/notify-new-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    }).catch((err) => console.error("Failed to send admin notification:", err));

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("❌ Admin create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

