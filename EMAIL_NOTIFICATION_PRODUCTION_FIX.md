# 📧 Email Notification Production Fix Guide

## 🔍 Issue Diagnosis

Email notifications work on localhost but fail in production. Here's how to fix it.

---

## ✅ Checklist: What to Verify

### **1. RESEND_API_KEY in Vercel**

**Check:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for `RESEND_API_KEY`
3. Make sure it's set for **Production** environment

**Fix if missing:**
1. Get your Resend API key from https://resend.com/api-keys
2. In Vercel: Settings → Environment Variables → Add New
3. Name: `RESEND_API_KEY`
4. Value: `re_...` (your actual API key)
5. Environment: Select **Production** (and Preview if needed)
6. Click "Save"
7. **Redeploy** your application

---

### **2. Domain Verification in Resend**

**The Problem:**
- Code uses: `from: "SRMK Oil Mill <orders@srmkoilmill.in>"`
- Resend requires the domain to be verified in production

**Check:**
1. Go to https://resend.com/domains
2. Check if `srmkoilmill.in` is verified
3. Status should be "Verified" (green checkmark)

**Fix if not verified:**
1. In Resend Dashboard → Click "Domains" → "Add Domain"
2. Enter: `srmkoilmill.in`
3. Add the DNS records Resend provides:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
4. Wait for verification (usually 5-15 minutes)
5. Once verified, emails will work

**Alternative (Quick Fix):**
If you can't verify the domain immediately, use Resend's test domain:
```typescript
from: "onboarding@resend.dev"  // Temporary - works without verification
```

---

### **3. NEXTAUTH_URL in Production**

**Check:**
1. In Vercel: Settings → Environment Variables
2. Look for `NEXTAUTH_URL`
3. Should be: `https://www.srmkoilmill.in` (or your actual domain)

**Fix if wrong:**
1. Update `NEXTAUTH_URL` to match your production domain
2. Must start with `https://`
3. No trailing slash
4. Redeploy after updating

---

### **4. Check Server Logs**

**In Vercel Dashboard:**
1. Go to your project → Deployments → Latest deployment
2. Click "Functions" tab
3. Look for `/api/admin/notify-new-order` function
4. Check logs for errors

**What to look for:**
```
✅ Good logs:
📧 ===== EMAIL NOTIFICATION API CALLED =====
📧 Order ID: ...
✅ Order found: ...
📧 Attempting to send email via Resend...
✅ Email sent successfully via Resend!

❌ Bad logs:
⚠️  RESEND_API_KEY not configured
❌ Resend error: ...
❌ Failed to send email: ...
```

---

## 🔧 Quick Fixes

### **Fix 1: Use Resend Test Domain (Temporary)**

If domain verification is pending, update the "from" email:

**File:** `src/app/api/admin/notify-new-order/route.ts`

```typescript
// Change line 95 from:
from: "SRMK Oil Mill <orders@srmkoilmill.in>",

// To (temporary):
from: "onboarding@resend.dev",
```

**Note:** This works immediately but shows "onboarding@resend.dev" as sender. Use only until domain is verified.

---

### **Fix 2: Add Better Error Logging**

Add more detailed error logging to see what's failing:

**File:** `src/app/api/admin/notify-new-order/route.ts`

Add after line 101:
```typescript
if (error) {
  console.error("❌ Resend error:", JSON.stringify(error, null, 2));
  console.error("❌ Error type:", error.constructor.name);
  console.error("❌ Error message:", error.message);
  // ... rest of error handling
}
```

---

### **Fix 3: Verify API Key Format**

The API key should:
- Start with `re_`
- Be exactly as shown in Resend dashboard
- Have no extra spaces or quotes
- Be set for Production environment in Vercel

---

## 🧪 Testing in Production

### **Test 1: Check Environment Variables**

Create a test endpoint to verify env vars (remove after testing):

**File:** `src/app/api/test-email-config/route.ts` (temporary)

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 3),
    nextAuthUrl: process.env.NEXTAUTH_URL,
    environment: process.env.NODE_ENV,
  });
}
```

**Test:**
1. Deploy this endpoint
2. Visit: `https://yourdomain.com/api/test-email-config`
3. Check if `hasResendKey: true`
4. **Delete this file after testing!**

---

### **Test 2: Manual Email Test**

Create a test endpoint to send a test email:

**File:** `src/app/api/test-email/route.ts` (temporary)

```typescript
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Use test domain
      to: "tharanicsekaran@gmail.com",
      subject: "Test Email from Production",
      text: "This is a test email from production. If you receive this, email notifications are working!",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**Test:**
1. Deploy this endpoint
2. Use Postman or curl:
   ```bash
   curl -X POST https://yourdomain.com/api/test-email
   ```
3. Check if email arrives
4. **Delete this file after testing!**

---

## 📋 Production Checklist

Before deploying, verify:

- [ ] `RESEND_API_KEY` is set in Vercel (Production environment)
- [ ] `NEXTAUTH_URL` is set to your production domain (https://...)
- [ ] Domain `srmkoilmill.in` is verified in Resend (or use test domain)
- [ ] DNS records are correctly configured (if using custom domain)
- [ ] Latest code is deployed to Vercel
- [ ] Server logs show no errors when orders are placed

---

## 🚨 Common Issues & Solutions

### **Issue 1: "RESEND_API_KEY not configured"**

**Solution:**
- Add `RESEND_API_KEY` to Vercel environment variables
- Make sure it's set for **Production** environment
- Redeploy the application

---

### **Issue 2: "Domain not verified"**

**Solution:**
- Verify `srmkoilmill.in` in Resend dashboard
- Or temporarily use `onboarding@resend.dev`

---

### **Issue 3: "Failed to fetch" in logs**

**Solution:**
- Check if `NEXTAUTH_URL` is correct
- Make sure it's `https://` not `http://`
- Verify the notification endpoint is accessible

---

### **Issue 4: Emails go to spam**

**Solution:**
- Verify domain in Resend
- Add SPF, DKIM, DMARC records
- Use verified "from" address

---

## 📞 Need Help?

If emails still don't work after checking all above:

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Deployments → Functions → `/api/admin/notify-new-order`
   - Look for error messages

2. **Check Resend Dashboard:**
   - Go to https://resend.com/emails
   - See if emails are being sent
   - Check for bounce/error messages

3. **Test with curl:**
   ```bash
   curl -X POST https://yourdomain.com/api/admin/notify-new-order \
     -H "Content-Type: application/json" \
     -d '{"orderId":"test-order-id"}'
   ```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Vercel logs show: `✅ Email sent successfully via Resend!`
2. ✅ Email arrives in `tharanicsekaran@gmail.com`
3. ✅ Subject: `🎉 New Order #...`
4. ✅ Resend dashboard shows successful sends

---

**Last Updated:** 2025-12-25

