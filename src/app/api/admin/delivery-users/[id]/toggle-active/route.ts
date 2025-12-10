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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isActive } = await request.json();
    const { id } = params;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Toggle active error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

