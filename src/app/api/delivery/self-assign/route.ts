import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "DELIVERY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    // Check if order exists and is unassigned
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.assignedToId) {
      return NextResponse.json({ error: "Order already assigned" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        assignedToId: session.user.id,
        deliveryStatus: "ASSIGNED",
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Self assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
