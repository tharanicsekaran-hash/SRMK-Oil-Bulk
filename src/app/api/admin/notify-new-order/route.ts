import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// This endpoint is called by the order creation API to send email notifications
export async function POST(request: NextRequest) {
  try {
    console.log("📧 ===== EMAIL NOTIFICATION API CALLED =====");
    const { orderId } = await request.json();
    console.log("📧 Order ID:", orderId);

    if (!orderId) {
      console.error("❌ No Order ID provided");
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      console.error("❌ Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("✅ Order found:", {
      id: order.id,
      total: order.totalPaisa / 100,
      customer: order.customerName,
    });

    // Prepare email content
    const emailContent = {
      to: "tharanicsekaran@gmail.com",
      subject: `🎉 New Order #${order.id.slice(-8)} - ₹${(order.totalPaisa / 100).toFixed(2)}`,
      body: `
🎉 NEW ORDER RECEIVED!

━━━━━━━━━━━━━━━━━━━━━━
📋 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━

Order ID: #${order.id.slice(-8)}
Date: ${new Date().toLocaleString("en-IN")}

👤 CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
Name: ${order.customerName || "N/A"}
Phone: ${order.customerPhone || "N/A"}

📍 DELIVERY ADDRESS
━━━━━━━━━━━━━━━━━━━━━━
${order.addressLine1}
${order.addressLine2 || ""}
${order.city}, ${order.state || ""}
Pincode: ${order.postalCode}

📦 ORDER ITEMS
━━━━━━━━━━━━━━━━━━━━━━
${order.items.map((item) => 
  `${item.quantity}x ${item.productName} (${item.unit}) - ₹${(item.pricePaisa * item.quantity / 100).toFixed(2)}`
).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━
💰 TOTAL: ₹${(order.totalPaisa / 100).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━

🔗 Login to admin panel to view full details and assign delivery agent:
${process.env.NEXTAUTH_URL || "http://localhost:4000"}/admin/dashboard/orders

━━━━━━━━━━━━━━━━━━━━━━
SRMK Oil Mill - Admin Notification
      `,
    };

    console.log("📧 ===== EMAIL CONTENT =====");
    console.log("To:", emailContent.to);
    console.log("Subject:", emailContent.subject);
    console.log("Body:\n", emailContent.body);
    console.log("📧 ===========================");

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("📧 Attempting to send email via Resend...");
        console.log("📧 RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
        console.log("📧 NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
        
        // Initialize Resend with API key (only when needed)
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Use verified domain if available, otherwise use Resend test domain
        // In production, if domain is not verified, use test domain
        const fromEmail = process.env.NODE_ENV === "production" 
          ? (process.env.RESEND_VERIFIED_DOMAIN === "true" 
              ? "SRMK Oil Mill <orders@srmkoilmill.in>"
              : "onboarding@resend.dev") // Fallback to test domain
          : "SRMK Oil Mill <orders@srmkoilmill.in>"; // Localhost can use any domain
        
        console.log("📧 From email:", fromEmail);
        
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: [emailContent.to],
          subject: emailContent.subject,
          text: emailContent.body,
        });

        if (error) {
          console.error("❌ Resend error:", JSON.stringify(error, null, 2));
          console.error("❌ Error type:", error.constructor?.name);
          console.error("❌ Error message:", error.message);
          console.error("❌ Full error:", error);
          
          return NextResponse.json({ 
            success: false, 
            error: error.message || "Unknown Resend error",
            errorDetails: process.env.NODE_ENV === "development" ? error : undefined,
            emailPreview: emailContent,
          }, { status: 500 });
        }

        console.log("✅ Email sent successfully via Resend!");
        console.log("📧 Email ID:", data?.id);
        console.log("📧 From:", fromEmail);
        
        return NextResponse.json({ 
          success: true, 
          message: "Email sent successfully",
          emailId: data?.id,
          from: fromEmail,
        });
      } catch (error) {
        console.error("❌ Failed to send email:", error);
        console.error("❌ Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        });
        
        return NextResponse.json({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to send email",
          errorDetails: process.env.NODE_ENV === "development" ? String(error) : undefined,
          emailPreview: emailContent,
        }, { status: 500 });
      }
    } else {
      // API key not configured - just log
      console.log("⚠️  RESEND_API_KEY not configured - email not sent");
      console.log("📝 Email content logged for debugging");
      console.log("📝 NODE_ENV:", process.env.NODE_ENV);
      console.log("📝 Available env vars:", Object.keys(process.env).filter(k => k.includes("RESEND") || k.includes("NEXTAUTH")));
      
      return NextResponse.json({ 
        success: false,
        message: "Email notification failed (RESEND_API_KEY not configured)",
        emailPreview: emailContent,
        environment: process.env.NODE_ENV,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Email notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

