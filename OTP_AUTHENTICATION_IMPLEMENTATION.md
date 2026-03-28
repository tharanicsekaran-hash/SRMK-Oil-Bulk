# 🔐 OTP Authentication Implementation Guide

## ✅ Implementation Complete

Your application has been successfully migrated from **password-based authentication** to **OTP-based (passwordless) authentication** for customer login and signup!

---

## 🎯 What's Changed

### **Before (Password-based)**
- Users created accounts with phone + password
- Login required remembering password
- Password reset via OTP

### **After (OTP-based / Passwordless)**
- Users create accounts with phone only (no password)
- Login via OTP sent to phone
- Cleaner, more secure authentication
- Better user experience

---

## 📋 Changes Made

### 1. **Database Schema** ✅
- Made `passwordHash` field **optional** in User model
- Existing users with passwords can still login (backward compatible)
- New users are created without passwords (OTP-only)

**File:** `prisma/schema.prisma`
```prisma
model User {
  passwordHash   String?  // Now optional
  // ... other fields
}
```

### 2. **API Endpoints** ✅

#### **New Endpoint: `/api/auth/send-otp`**
- Sends OTP to user's phone
- Validates phone number format
- Checks user existence based on action (login/signup)
- Stores OTP in database with 5-minute expiry
- Rate limiting ready

**Action-based validation:**
- `action: 'login'` - Ensures user exists
- `action: 'signup'` - Ensures user doesn't exist

#### **Updated: `/api/auth/verify-otp`**
- Verifies OTP
- Creates new user on signup
- Returns user info for session creation
- Handles different actions (login/signup)

#### **Updated: `/api/auth/register`**
- Now supports both OTP and password-based registration
- Backward compatible for admin/delivery user creation

### 3. **NextAuth Configuration** ✅

**File:** `src/lib/auth.ts`

Added two providers:
1. **OTP Provider** (Primary for customers)
   - ID: `"otp"`
   - Credentials: phone + otp
   - Validates OTP and creates session

2. **Password Provider** (Fallback for admin/delivery)
   - ID: `"password"`
   - Credentials: phone + password
   - For users with passwords (admin/delivery)

### 4. **Frontend Auth Page** ✅

**File:** `src/app/auth/page.tsx`

**New Features:**
- Two-step authentication flow:
  - Step 1: Enter phone number → Send OTP
  - Step 2: Enter OTP → Login/Signup
  
- Real-time OTP expiry countdown timer
- Attempt tracking (3 attempts max)
- Resend OTP functionality
- Change phone number option
- Development mode: Shows OTP in console/toast

**Login Flow:**
1. User enters phone number
2. Clicks "Send OTP"
3. Receives OTP via SMS
4. Enters OTP
5. Verified → Logged in

**Signup Flow:**
1. User enters name (optional) + phone
2. Clicks "Send OTP"
3. Receives OTP via SMS
4. Enters OTP
5. Verified → Account created → Auto-logged in

---

## 🔧 OTP API Integration (Action Required)

### **Your Task:** Integrate Your OTP SMS API

Open the file: `src/app/api/auth/send-otp/route.ts`

Find this function (around line 14):

```typescript
async function sendOtpViaSMS(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  console.log(`📱 Sending OTP ${otp} to phone ${phone}`);
  
  // PLACEHOLDER: Replace this with your actual OTP API call
  // Example structure:
  /*
  try {
    const response = await fetch('YOUR_OTP_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        otp: otp,
        template_id: 'YOUR_TEMPLATE_ID' // if required
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to send OTP' };
    }

    return { success: true };
  } catch (error) {
    console.error('OTP API Error:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
  */

  // DEVELOPMENT MODE: Always succeed
  console.log("⚠️ DEVELOPMENT MODE: OTP not actually sent. Check console for OTP value.");
  return { success: true };
}
```

### **Integration Steps:**

1. **Get your OTP API details:**
   - API endpoint URL
   - Authentication method (API key, token, etc.)
   - Request format
   - Response format

2. **Replace the function with your API call:**

Example integrations for popular SMS providers:

#### **Example 1: Generic REST API**
```typescript
async function sendOtpViaSMS(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('https://api.your-sms-provider.com/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: `+91${phone}`, // Add country code if required
        message: `Your OTP is ${otp}. Valid for 5 minutes.`,
        sender_id: 'SRMKOIL',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('SMS API Error:', error);
    return { success: false, message: 'Failed to send SMS' };
  }
}
```

#### **Example 2: Twilio**
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendOtpViaSMS(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    await client.messages.create({
      body: `Your SRMK Oil OTP is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });
    return { success: true };
  } catch (error) {
    console.error('Twilio Error:', error);
    return { success: false, message: 'Failed to send SMS' };
  }
}
```

#### **Example 3: MSG91 (Popular in India)**
```typescript
async function sendOtpViaSMS(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flow_id: process.env.MSG91_FLOW_ID,
        sender: process.env.MSG91_SENDER_ID || 'SRMKOIL',
        mobiles: `91${phone}`,
        otp: otp,
      }),
    });

    const data = await response.json();
    
    if (data.type !== 'success') {
      return { success: false, message: data.message };
    }

    return { success: true };
  } catch (error) {
    console.error('MSG91 Error:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}
```

3. **Add environment variables to `.env`:**
```env
# SMS/OTP Provider
SMS_API_KEY=your_api_key_here
SMS_API_ENDPOINT=https://api.your-provider.com
SMS_SENDER_ID=SRMKOIL
# Add other credentials as needed
```

4. **Test the integration:**
   - Try signup with a real phone number
   - Verify you receive the SMS with OTP
   - Complete the OTP verification

---

## 🧪 Testing Guide

### **Development Mode (Current)**
- OTP is shown in browser console and toast notification
- No actual SMS sent
- Any 6-digit code works
- Perfect for local testing

### **Test Login Flow:**
1. Visit: http://localhost:4000/auth
2. Click "Login" tab
3. Enter phone: `9999999999` (or any registered user)
4. Click "Send OTP"
5. Check console for OTP (shown in development mode)
6. Enter the OTP
7. Click "Verify & Login"
8. ✅ You should be logged in

### **Test Signup Flow:**
1. Visit: http://localhost:4000/auth
2. Click "Sign Up" tab
3. Enter name (optional)
4. Enter a new phone number (not already registered)
5. Click "Send OTP"
6. Check console for OTP
7. Enter the OTP
8. Click "Verify & Create Account"
9. ✅ Account created and auto-logged in

### **Production Testing (After SMS Integration):**
1. Deploy to production with your SMS API integrated
2. Remove/disable the dev OTP display:
   ```typescript
   // In send-otp/route.ts, remove this line:
   devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
   ```
3. Test with real phone numbers

---

## 🔐 Security Features

### **OTP Security:**
- ✅ 5-minute expiry time
- ✅ Maximum 3 verification attempts
- ✅ OTP deleted after successful verification
- ✅ Old OTPs automatically deleted when new one requested
- ✅ 6-digit random OTP generation

### **Rate Limiting (Recommended):**
Add rate limiting to prevent abuse:

```typescript
// Example using next-rate-limit or similar
import rateLimit from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit: 3 OTP requests per 15 minutes per phone
  const rateLimitResult = await rateLimit(request, {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 500,
    limit: 3,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ... rest of the code
}
```

---

## 🌐 Admin/Delivery Users (Password Support)

**Good News:** Admin and delivery users can still use passwords!

### **Admin Login:**
- URL: http://localhost:4000/admin
- Phone: `9999999999`
- Password: `admin123`
- Uses password provider (backward compatible)

### **Creating Admin/Delivery Users:**
The admin dashboard delivery user creation still uses passwords. This is intentional because:
- Admins need reliable access (not dependent on SMS)
- Delivery agents may need quick access without OTP delays

---

## 📊 User Migration Strategy

### **Existing Users:**
- Users with passwords can still login using password
- They can continue using password-based auth
- Or migrate to OTP on their next login

### **New Users (Customers):**
- All new customer signups are OTP-only
- No password field shown
- Cleaner registration process

### **Recommendation:**
Eventually migrate all customers to OTP:
1. Add a banner: "Switch to OTP login (no password needed!)"
2. Allow users to opt-in to OTP
3. After majority migrates, deprecate password login for customers

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Integrate your SMS/OTP API in `send-otp/route.ts`
- [ ] Add SMS API credentials to environment variables
- [ ] Test OTP sending with real phone numbers
- [ ] Push database schema changes: `npx prisma db push`
- [ ] Update environment variables on Vercel/hosting platform
- [ ] Remove dev OTP display from response
- [ ] Add rate limiting (optional but recommended)
- [ ] Test login and signup flows in production
- [ ] Monitor SMS delivery rates and errors

### **Environment Variables for Production:**

Add these to your Vercel/hosting platform:

```env
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.com

# SMS/OTP API
SMS_API_KEY=your_api_key
SMS_API_ENDPOINT=https://api.your-provider.com
SMS_SENDER_ID=SRMKOIL
# Add other SMS credentials as needed
```

---

## 📁 File Changes Summary

### **Modified Files:**
1. ✅ `prisma/schema.prisma` - Made passwordHash optional
2. ✅ `src/lib/auth.ts` - Added OTP provider to NextAuth
3. ✅ `src/app/api/auth/send-otp/route.ts` - **NEW** - Sends OTP
4. ✅ `src/app/api/auth/verify-otp/route.ts` - Updated for login/signup
5. ✅ `src/app/api/auth/register/route.ts` - Updated for OTP support
6. ✅ `src/app/auth/page.tsx` - Complete UI overhaul for OTP flow

### **No Changes Required:**
- Admin dashboard (still uses passwords)
- Customer portal features
- Order management
- Product management
- Razorpay integration

---

## 🐛 Troubleshooting

### **Issue: OTP not being sent**
- Check if SMS API credentials are correct
- Verify phone number format (should be 10 digits)
- Check API rate limits
- Look at server logs for API errors

### **Issue: OTP expired**
- Default expiry: 5 minutes
- Adjust in `send-otp/route.ts`: `const OTP_EXPIRY_MINUTES = 10;`

### **Issue: Database error about passwordHash**
- Run: `npx prisma db push` to apply schema changes
- Or run: `npx prisma generate` to update Prisma client

### **Issue: User can't login with password anymore**
- Check if user has passwordHash in database
- If migrating, they need to use OTP instead
- Admin users should still work with passwords

### **Issue: OTP not shown in development**
- Check browser console (logged with 🔐 emoji)
- Check toast notifications
- Ensure `NODE_ENV=development`

---

## 📞 Next Steps

1. **Share your OTP API details** so I can help integrate it
2. **Test the current implementation** in development mode
3. **Deploy to production** once SMS is integrated
4. **Monitor user feedback** on the new OTP flow

---

## 🎉 Benefits of OTP Authentication

✅ **Better Security**: No password storage or leaks
✅ **Better UX**: No password to remember
✅ **Higher Conversion**: Faster signup process
✅ **Mobile-First**: Perfect for mobile users
✅ **Reduced Support**: No "forgot password" requests
✅ **Modern**: Industry standard for e-commerce

---

**Ready to integrate your OTP API!** Share the API details and I'll help you complete the integration. 🚀
