import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create order
export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      paymentMethod = "COD",
    } = body as {
      items: { productId?: string; productSlug?: string; productName: string; unit: string; pricePaisa: number; qty: number }[];
      customerName?: string;
      customerPhone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      lat?: number;
      lng?: number;
      notes?: string;
      paymentMethod?: "COD" | "RAZORPAY";
    };

    if (!items?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const totalPaisa = items.reduce((s, i) => s + i.pricePaisa * i.qty, 0);

    // Get session to link order to user if logged in
    const session = await getServerSession(authOptions);

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null,
        status: "PENDING",
        paymentMethod,
        totalPaisa,
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
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            productSlug: i.productSlug,
            productName: i.productName,
            unit: i.unit,
            quantity: i.qty,
            pricePaisa: i.pricePaisa,
          })),
        },
      },
      include: { items: true },
    });

    console.log("✅ Order created successfully:", order.id);

    // Send email notification to admin (fire and forget - don't wait for response)
    const notificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:4000"}/api/admin/notify-new-order`;
    console.log("📧 Triggering email notification to:", notificationUrl);
    
    fetch(notificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    })
      .then((res) => console.log("📧 Email notification response:", res.status))
      .catch((err) => console.error("❌ Failed to send admin notification:", err));

    return NextResponse.json({ ok: true, order });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
