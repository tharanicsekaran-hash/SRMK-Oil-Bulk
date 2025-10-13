import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const header = [
    "orderId",
    "createdAt",
    "status",
    "paymentMethod",
    "customerName",
    "customerPhone",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "postalCode",
    "lat",
    "lng",
    "totalPaisa",
    "itemIndex",
    "itemName",
    "unit",
    "qty",
    "pricePaisa",
    "lineTotalPaisa",
  ];

  const rows: string[] = [];
  rows.push(header.join(","));

  for (const o of orders) {
    if (!o.items.length) {
      rows.push([
        o.id,
        o.createdAt.toISOString(),
        o.status,
        o.paymentMethod,
        o.customerName ?? "",
        o.customerPhone ?? "",
        o.addressLine1 ?? "",
        o.addressLine2 ?? "",
        o.city ?? "",
        o.state ?? "",
        o.postalCode ?? "",
        o.lat?.toString() ?? "",
        o.lng?.toString() ?? "",
        o.totalPaisa.toString(),
        "",
        "",
        "",
        "",
        "",
        "",
      ].map(csvEscape).join(","));
    } else {
      o.items.forEach((it: any, idx: number) => {
        rows.push([
          o.id,
          o.createdAt.toISOString(),
          o.status,
          o.paymentMethod,
          o.customerName ?? "",
          o.customerPhone ?? "",
          o.addressLine1 ?? "",
          o.addressLine2 ?? "",
          o.city ?? "",
          o.state ?? "",
          o.postalCode ?? "",
          o.lat?.toString() ?? "",
          o.lng?.toString() ?? "",
          o.totalPaisa.toString(),
          (idx + 1).toString(),
          it.productName,
          it.unit,
          it.quantity.toString(),
          it.pricePaisa.toString(),
          (it.pricePaisa * it.quantity).toString(),
        ].map(csvEscape).join(","));
      });
    }
  }

  const csv = rows.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=orders.csv` ,
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(v: string) {
  if (v.includes(",") || v.includes("\n") || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}
