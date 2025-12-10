import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "DELIVERY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get metrics
    const totalOrders = await prisma.order.count();
    
    const pendingDeliveries = await prisma.order.count({
      where: {
        deliveryStatus: {
          in: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"],
        },
      },
    });

    const deliveredOrders = await prisma.order.count({
      where: {
        deliveryStatus: "DELIVERED",
      },
    });

    const activeDeliveryAgents = await prisma.user.count({
      where: {
        role: "DELIVERY",
        isActive: true,
      },
    });

    return NextResponse.json({
      totalOrders,
      pendingDeliveries,
      deliveredOrders,
      activeDeliveryAgents,
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
