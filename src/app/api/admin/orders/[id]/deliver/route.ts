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

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DELIVERY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // If delivery user, ensure they can only mark their own orders as delivered
    if (session.user.role === "DELIVERY") {
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order || order.assignedToId !== session.user.id) {
        return NextResponse.json(
          { error: "You can only mark your assigned orders as delivered" },
          { status: 403 }
        );
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        deliveryStatus: "DELIVERED",
        status: "DELIVERED",
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Mark delivered error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to mark order as delivered" },
      { status: 500 }
    );
  }
}

