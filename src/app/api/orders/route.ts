import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Create order
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

    const order = await prisma.order.create({
      data: {
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

    return NextResponse.json({ ok: true, order });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
