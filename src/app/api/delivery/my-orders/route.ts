import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET orders assigned to current delivery user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "DELIVERY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        assignedToId: session.user.id,
        deliveryStatus: {
          not: "DELIVERED",
        },
      },
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
            unit: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

