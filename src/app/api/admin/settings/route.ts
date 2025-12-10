import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Simple settings storage (in real app, use database)
let settingsStore = {
  allowCustomerRegistration: true,
  requirePhoneVerification: false,
  deliveryZones: "Chennai\nCoimbatore\nMadurai\nSalem\nTirupur",
  productCategories: "Cooking Oils\nWood Pressed Oils\nCold Pressed Oils\nOrganic Oils\nSpecialty Oils",
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(settingsStore);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    settingsStore = { ...settingsStore, ...body };

    return NextResponse.json({ success: true, settings: settingsStore });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

