import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate total revenue from delivered orders
    const deliveredOrders = await prisma.order.findMany({
      where: {
        deliveryStatus: "DELIVERED",
      },
      select: {
        totalPaisa: true,
      },
    });

    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalPaisa, 0);

    // Calculate total products sold (items quantity from delivered orders)
    const deliveredOrdersWithItems = await prisma.order.findMany({
      where: {
        deliveryStatus: "DELIVERED",
      },
      include: {
        items: true,
      },
    });

    const productsSold = deliveredOrdersWithItems.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Count new customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Calculate growth (compare last 30 days to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousPeriodRevenue = await prisma.order.findMany({
      where: {
        deliveryStatus: "DELIVERED",
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
      select: {
        totalPaisa: true,
      },
    });

    const currentPeriodRevenue = await prisma.order.findMany({
      where: {
        deliveryStatus: "DELIVERED",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        totalPaisa: true,
      },
    });

    const prevRevenue = previousPeriodRevenue.reduce((sum, order) => sum + order.totalPaisa, 0);
    const currRevenue = currentPeriodRevenue.reduce((sum, order) => sum + order.totalPaisa, 0);

    let growthPercentage = 0;
    if (prevRevenue > 0) {
      growthPercentage = ((currRevenue - prevRevenue) / prevRevenue) * 100;
    } else if (currRevenue > 0) {
      growthPercentage = 100;
    }

    return NextResponse.json({
      totalRevenue,
      productsSold,
      newCustomers,
      growthPercentage: Math.round(growthPercentage * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
