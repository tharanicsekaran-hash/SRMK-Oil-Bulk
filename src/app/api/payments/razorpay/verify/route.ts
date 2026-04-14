import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderPayload,
    } = body as {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      orderPayload: {
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
        deliveryChargePaisa?: number;
      };
    };

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderPayload) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
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

    // Verify the payment signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      console.error("❌ Payment signature verification failed");
      return NextResponse.json(
        { error: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    // Verify payment with Razorpay API
    let paymentAmountPaisa = 0;
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (payment.status !== "authorized" && payment.status !== "captured") {
        return NextResponse.json(
          { error: `Payment not successful. Status: ${payment.status}` },
          { status: 400 }
        );
      }
      paymentAmountPaisa = Number(payment.amount);
    } catch (error) {
      console.error("❌ Razorpay payment fetch error:", error);
      return NextResponse.json(
        { error: "Failed to verify payment with Razorpay" },
        { status: 500 }
      );
    }

    // Validate payload and amount before creating database order
    if (!orderPayload.items?.length) {
      return NextResponse.json({ error: "No items in order payload" }, { status: 400 });
    }
    const subtotalPaisa = orderPayload.items.reduce((sum, item) => sum + item.pricePaisa * item.qty, 0);
    const expectedTotalPaisa = subtotalPaisa + (orderPayload.deliveryChargePaisa || 0);

    if (expectedTotalPaisa !== paymentAmountPaisa) {
      return NextResponse.json(
        { error: "Payment amount mismatch. Order not created." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Create paid order in database only after successful payment verification
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null,
        paymentStatus: "PAID",
        paymentMethod: "RAZORPAY",
        status: "CONFIRMED",
        totalPaisa: expectedTotalPaisa,
        customerName: orderPayload.customerName,
        customerPhone: orderPayload.customerPhone,
        addressLine1: orderPayload.addressLine1,
        addressLine2: orderPayload.addressLine2,
        city: orderPayload.city,
        state: orderPayload.state,
        postalCode: orderPayload.postalCode,
        lat: orderPayload.lat,
        lng: orderPayload.lng,
        notes: orderPayload.notes,
        items: {
          create: orderPayload.items.map((item) => ({
            productId: item.productId,
            productSlug: item.productSlug,
            productName: item.productName,
            unit: item.unit,
            quantity: item.qty,
            pricePaisa: item.pricePaisa,
          })),
        },
      },
    });

    console.log("✅ Payment verified and order created:", order.id);

    // Send email notification to admin (fire and forget)
    const notificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:4000"}/api/admin/notify-new-order`;
    fetch(notificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    })
      .then((res) => console.log("📧 Email notification response:", res.status))
      .catch((err) => console.error("❌ Failed to send admin notification:", err));

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

