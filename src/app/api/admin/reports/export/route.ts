import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all orders with items
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create CSV content
    let csv = "Order ID,Date,Customer Name,Customer Phone,Status,Delivery Status,Total Amount,Items,Assigned To,City,Pincode\n";

    orders.forEach((order) => {
      const orderId = order.id.slice(-8);
      const date = new Date(order.createdAt).toLocaleDateString();
      const customerName = order.customerName || order.user?.name || "Guest";
      const customerPhone = order.customerPhone || order.user?.phone || "N/A";
      const status = order.status;
      const deliveryStatus = order.deliveryStatus;
      const total = `₹${(order.totalPaisa / 100).toFixed(2)}`;
      const items = order.items.map((item) => `${item.quantity}x ${item.productName}`).join("; ");
      const assignedTo = order.assignedTo?.name || "Unassigned";
      const city = order.city || "N/A";
      const pincode = order.postalCode || "N/A";

      // Escape commas and quotes in CSV
      const escapeCsv = (str: string) => {
        if (str.includes(",") || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      csv += `${orderId},${date},${escapeCsv(customerName)},${customerPhone},${status},${deliveryStatus},${total},"${escapeCsv(items)}",${escapeCsv(assignedTo)},${escapeCsv(city)},${pincode}\n`;
    });

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
