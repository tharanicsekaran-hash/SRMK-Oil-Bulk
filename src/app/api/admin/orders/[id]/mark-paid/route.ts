import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only ADMIN can mark orders as paid
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        deliveryStatus: true,
        paymentMethod: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate conditions
    if (order.paymentMethod !== "COD") {
      return NextResponse.json(
        { error: "Only COD orders can be manually marked as paid" },
        { status: 400 }
      );
    }

    if (order.deliveryStatus !== "DELIVERED") {
      return NextResponse.json(
        { error: "Order must be delivered before marking as paid" },
        { status: 400 }
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Order is already marked as paid" },
        { status: 400 }
      );
    }

    // Update payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
      },
    });

    console.log(`✅ COD order ${orderId} marked as PAID`);

    return NextResponse.json({
      success: true,
      message: "Payment status updated to PAID",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Mark paid error:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
