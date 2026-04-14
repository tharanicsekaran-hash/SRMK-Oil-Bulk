import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amountPaisa,
      customerName,
      customerPhone,
    } = body as {
      amountPaisa: number;
      customerName?: string;
      customerPhone?: string;
    };

    if (!amountPaisa) {
      return NextResponse.json(
        { error: "Amount is required" },
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

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaisa,
      currency: "INR",
      receipt: `checkout_${Date.now()}`,
      notes: {
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

