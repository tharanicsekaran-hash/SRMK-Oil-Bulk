import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT update delivery status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;

    if (userRole !== "ADMIN" && userRole !== "DELIVERY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { deliveryStatus } = await request.json();

    if (!deliveryStatus) {
      return NextResponse.json(
        { error: "Delivery status is required" },
        { status: 400 }
      );
    }

    // If delivery user, verify they are assigned to this order
    if (userRole === "DELIVERY") {
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (order?.assignedToId !== session.user.id) {
        return NextResponse.json(
          { error: "You are not assigned to this order" },
          { status: 403 }
        );
      }
    }

    // Update delivery status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { deliveryStatus },
    });

    // Auto-update order status based on delivery status
    if (deliveryStatus === "DELIVERED") {
      await prisma.order.update({
        where: { id },
        data: { status: "DELIVERED" },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update delivery status error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}

