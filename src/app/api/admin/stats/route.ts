import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;

    if (userRole !== "ADMIN" && userRole !== "DELIVERY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get stats based on role
    let totalOrders, pendingDeliveries, deliveredOrders;

    if (userRole === "ADMIN") {
      // Admin sees all orders
      totalOrders = await prisma.order.count();
      pendingDeliveries = await prisma.order.count({
        where: {
          deliveryStatus: {
            in: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"],
          },
        },
      });
      deliveredOrders = await prisma.order.count({
        where: { deliveryStatus: "DELIVERED" },
      });
    } else {
      // Delivery user sees only their assigned orders
      const userId = session.user.id;
      totalOrders = await prisma.order.count({
        where: { assignedToId: userId },
      });
      pendingDeliveries = await prisma.order.count({
        where: {
          assignedToId: userId,
          deliveryStatus: {
            in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"],
          },
        },
      });
      deliveredOrders = await prisma.order.count({
        where: {
          assignedToId: userId,
          deliveryStatus: "DELIVERED",
        },
      });
    }

    // Active delivery agents count (admin only)
    const activeDeliveryAgents =
      userRole === "ADMIN"
        ? await prisma.user.count({
            where: {
              role: "DELIVERY",
              isActive: true,
            },
          })
        : 0;

    return NextResponse.json({
      totalOrders,
      pendingDeliveries,
      deliveredOrders,
      activeDeliveryAgents,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

