import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// OTP configuration
const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;

// ============================================
// 2Factor.in SMS API Integration
// ============================================
async function sendOtpViaSMS(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  console.log(`📱 Sending OTP ${otp} to phone ${phone}`);
  
  const API_KEY = process.env.TWO_FACTOR_API_KEY || 'ccde159e-2760-11f1-bcb0-0200cd936042';
  
  // 2Factor.in API - Send custom OTP
  // URL format: https://2factor.in/API/V1/{API_KEY}/SMS/{MOBILE}/{OTP}/OTP1
  // Note: Replace AUTOGEN with actual OTP to send custom OTP
  const apiUrl = `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/${otp}/OTP1`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    const data = await response.json();
    
    console.log('2Factor.in Response:', data);
    
    // 2Factor.in response format:
    // Success: { "Status": "Success", "Details": "session_id" }
    // Error: { "Status": "Error", "Details": "error message" }
    
    if (data.Status === 'Success') {
      console.log(`✅ OTP ${otp} sent successfully to ${phone}. Session ID: ${data.Details}`);
      return { success: true };
    } else {
      console.error('2Factor.in Error:', data.Details);
      return { 
        success: false, 
        message: data.Details || 'Failed to send OTP' 
      };
    }
    
  } catch (error) {
    console.error('2Factor.in API Error:', error);
    return { 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    };
  }
}

// Generate random OTP
function generateOTP(length: number = OTP_LENGTH): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export async function POST(request: NextRequest) {
  try {
    const { phone, action } = await request.json();

    // Validate phone
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Check if action is 'signup' and user already exists
    if (action === 'signup') {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this phone number already exists. Please login instead." },
          { status: 409 }
        );
      }
    }

    // Check if action is 'login' and user doesn't exist
    if (action === 'login') {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: "No account found with this phone number. Please sign up first." },
          { status: 404 }
        );
      }

      // Check if user is active
      if (!existingUser.isActive) {
        return NextResponse.json(
          { error: "Your account has been deactivated. Please contact support." },
          { status: 403 }
        );
      }

      // Note: Admin/Delivery users can login here too, but will be redirected to admin portal
      // They can also use the admin login page at /admin for password-based login
    }

    // Delete any existing OTP for this phone
    await prisma.otpVerification.deleteMany({
      where: { phone },
    });

    // Generate OTP
    const otp = generateOTP();
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Save OTP to database
    await prisma.otpVerification.create({
      data: {
        phone,
        otp,
        expiresAt,
        attempts: 0,
      },
    });

    // Send OTP via SMS API
    const smsResult = await sendOtpViaSMS(phone, otp);

    if (!smsResult.success) {
      // Clean up OTP record if SMS failed
      await prisma.otpVerification.deleteMany({
        where: { phone },
      });

      return NextResponse.json(
        { error: smsResult.message || "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${phone}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
      // DEV ONLY: Remove this in production
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
