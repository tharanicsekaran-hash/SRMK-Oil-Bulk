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

    // Get filter parameter from URL (week, month, year, all)
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    // Calculate date range based on filter
    let startDate: Date | undefined;
    const now = new Date();

    switch (filter) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
      default:
        startDate = undefined; // No filter, all time
        break;
    }

    // Base where clause for date filtering
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    // Calculate COLLECTED revenue (all delivered orders = money in hand)
    // In this business: COD delivery = cash collected immediately
    const collectedOrders = await prisma.order.findMany({
      where: {
        deliveryStatus: "DELIVERED",
        ...dateFilter,
      },
      select: {
        totalPaisa: true,
      },
    });

    const collectedRevenue = collectedOrders.reduce((sum, order) => sum + order.totalPaisa, 0);

    // COD to collect = COD orders waiting for delivery (pending COD)
    const pendingCodOrders = await prisma.order.findMany({
      where: {
        paymentMethod: "COD",
        deliveryStatus: {
          not: "DELIVERED",
        },
        ...dateFilter,
      },
      select: {
        totalPaisa: true,
      },
    });

    const codToCollectRevenue = pendingCodOrders.reduce((sum, order) => sum + order.totalPaisa, 0);
    const codToCollectCount = pendingCodOrders.length;

    // Calculate total products sold (items quantity from delivered orders)
    const deliveredOrdersWithItems = await prisma.order.findMany({
      where: {
        deliveryStatus: "DELIVERED",
        ...dateFilter,
      },
      include: {
        items: true,
      },
    });

    const productsSold = deliveredOrdersWithItems.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Calculate expected total (collected + COD to collect)
    const expectedTotal = collectedRevenue + codToCollectRevenue;

    // Count new customers
    const newCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        ...dateFilter,
      },
    });

    // Calculate growth for the selected period
    let growthPercentage = 0;
    
    if (filter !== "all") {
      // Calculate previous period dates
      let prevStartDate: Date | undefined;
      const prevEndDate = startDate;

      switch (filter) {
        case "week":
          prevStartDate = new Date(startDate!);
          prevStartDate.setDate(prevStartDate.getDate() - 7);
          break;
        case "month":
          prevStartDate = new Date(startDate!);
          prevStartDate.setMonth(prevStartDate.getMonth() - 1);
          break;
        case "year":
          prevStartDate = new Date(startDate!);
          prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
          break;
      }

      if (prevStartDate && prevEndDate) {
        // Previous period revenue (delivered orders)
        const previousPeriodOrders = await prisma.order.findMany({
          where: {
            deliveryStatus: "DELIVERED",
            createdAt: {
              gte: prevStartDate,
              lt: prevEndDate,
            },
          },
          select: {
            totalPaisa: true,
          },
        });

        const prevRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalPaisa, 0);

        // Calculate growth based on collected revenue
        if (prevRevenue > 0) {
          growthPercentage = ((collectedRevenue - prevRevenue) / prevRevenue) * 100;
        } else if (collectedRevenue > 0) {
          growthPercentage = 100;
        }
      }
    }

    return NextResponse.json({
      collectedRevenue,
      expectedTotal,
      codToCollectRevenue,
      codToCollectCount,
      productsSold,
      newCustomers,
      growthPercentage: Math.round(growthPercentage * 10) / 10,
      filter,
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
