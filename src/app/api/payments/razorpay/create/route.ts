import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amountPaisa,
      orderId, // Our database order ID
      customerName,
      customerPhone,
    } = body as {
      amountPaisa: number;
      orderId: string;
      customerName?: string;
      customerPhone?: string;
    };

    if (!amountPaisa || !orderId) {
      return NextResponse.json(
        { error: "Amount and order ID are required" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Razorpay only when credentials are available
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Verify order exists in our database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.paymentMethod !== "RAZORPAY") {
      return NextResponse.json(
        { error: "Order is not configured for Razorpay payment" },
        { status: 400 }
      );
    }

    // Convert paisa to rupees (Razorpay expects amount in smallest currency unit, which is paisa for INR)
    const amountInPaisa = amountPaisa;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaisa, // Amount in paisa
      currency: "INR",
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        customerName: customerName || "",
        customerPhone: customerPhone || "",
      },
    });

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

