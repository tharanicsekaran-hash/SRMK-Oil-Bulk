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

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        name: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const escapeCsv = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    let csv = "Name,Phone,Orders,Joined Date\n";
    customers.forEach((customer) => {
      const name = customer.name || "Guest Customer";
      const joinedDate = new Date(customer.createdAt).toLocaleDateString("en-IN");
      csv += `${escapeCsv(name)},${customer.phone},${customer._count.orders},${joinedDate}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=\"customers-export-${new Date().toISOString().split("T")[0]}.csv\"`,
      },
    });
  } catch (error) {
    console.error("Customer export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
