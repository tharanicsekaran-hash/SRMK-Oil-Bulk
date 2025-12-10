import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET delivery history for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "DELIVERY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        assignedToId: session.user.id,
        deliveryStatus: "DELIVERED",
      },
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
          },
        },
      },
      orderBy: { deliveredAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get delivery history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

