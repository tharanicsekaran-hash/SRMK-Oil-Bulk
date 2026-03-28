# 📧 Resend Email Setup Guide

## ✅ Package Already Installed!

I've already installed Resend and configured the code. Now you just need to:
1. Get your API key from Resend
2. Add it to your `.env` file
3. Verify your domain (for production)

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Sign Up for Resend**

1. Go to https://resend.com
2. Click "Sign Up" (it's free!)
3. Sign up with your email
4. Verify your email address

---

### **Step 2: Get Your API Key**

1. After login, you'll be in the Resend dashboard
2. Click "API Keys" in the left sidebar
3. Click "Create API Key"
4. Name it: `SRMK Oil Mill - Production`
5. Copy the API key (starts with `re_...`)
   - ⚠️ **Save it immediately - you can't see it again!**

---

### **Step 3: Add API Key to `.env` File**

Open `/Users/tharanic/Documents/GitHub/SRMK-Oil-Bulk/.env` and add:

```env
# Resend Email API Key
RESEND_API_KEY=re_your_actual_api_key_here
```

**Example:**
```env
# Database - Direct connection for local development
DATABASE_URL="postgresql://postgres:..."

# NextAuth - Local
NEXTAUTH_SECRET="f8e7d6c5b4a3918273645f6e5d4c3b2a1918273645f6e5d4c3b2a19182736"
NEXTAUTH_URL="http://localhost:4000"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyC0EvPUgiS9PfB3GK54OgsptnLh11sE8tQ"

# Resend Email API Key
RESEND_API_KEY=re_ABC123xyz456...
```

---

### **Step 4: Restart Development Server**

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

### **Step 5: Test It!**

1. **Place a Test Order**
   - Go to http://localhost:4000
   - Add product to cart
   - Complete checkout
   - Place order

2. **Check Terminal Logs**
   ```
   ✅ Order created successfully
   📧 Attempting to send email via Resend...
   ✅ Email sent successfully via Resend!
   📧 Email ID: [resend-email-id]
   ```

3. **Check Your Email**
   - Check `tharanicsekaran@gmail.com`
   - You should receive the order notification!
   - Subject: "🎉 New Order #..."

---

## 🌐 Production Setup (For Vercel)

### **Step 1: Verify Your Domain**

**Why?** Resend's free tier only sends from verified domains in production.

1. In Resend Dashboard → Click "Domains"
2. Click "Add Domain"
3. Enter: `srmkoilmill.in`
4. Resend will show DNS records to add

### **Step 2: Add DNS Records**

You need to add these records to your domain DNS settings:

**Example records** (yours will be different):
```
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: MX
Name: @
Value: [provided by Resend]
Priority: 10
```

**Where to add:**
- Log in to your domain registrar (GoDaddy, Namecheap, etc.)
- Go to DNS settings
- Add the records exactly as shown by Resend

### **Step 3: Wait for Verification**

- Takes 24-48 hours (usually faster)
- Resend will verify automatically
- You'll get an email when verified ✅

### **Step 4: Add API Key to Vercel**

1. Go to https://vercel.com/your-project
2. Settings → Environment Variables
3. Add new variable:
   ```
   Name: RESEND_API_KEY
   Value: re_your_api_key
   ```
4. Redeploy your app

---

## 📊 Resend Free Tier Limits

✅ **100 emails per day** - More than enough!  
✅ **Unlimited API keys**  
✅ **Email logs & analytics**  
✅ **Webhook support**  

**Need more?** Paid plan starts at $20/month for 50,000 emails.

---

## 🎨 Email Customization

### **Change "From" Email Address**

In `/api/admin/notify-new-order/route.ts`:

```typescript
from: "SRMK Oil Mill <orders@srmkoilmill.in>",
// Change to any email on your verified domain:
// - notifications@srmkoilmill.in
// - admin@srmkoilmill.in
// - no-reply@srmkoilmill.in
```

### **Change "To" Email Address**

```typescript
to: ["tharanicsekaran@gmail.com"],
// Can add multiple recipients:
to: ["tharanicsekaran@gmail.com", "manager@srmkoilmill.in"],
```

### **Add CC or BCC**

```typescript
await resend.emails.send({
  from: "SRMK Oil Mill <orders@srmkoilmill.in>",
  to: ["tharanicsekaran@gmail.com"],
  cc: ["manager@srmkoilmill.in"],
  bcc: ["accounting@srmkoilmill.in"],
  subject: emailContent.subject,
  text: emailContent.body,
});
```

---

## 🔍 Debugging

### **Issue: Email Not Sending**

**Check Terminal Logs:**
```bash
# Should see:
📧 Attempting to send email via Resend...
✅ Email sent successfully via Resend!

# If you see:
⚠️  RESEND_API_KEY not configured
# → API key missing or incorrect in .env
```

**Fix:**
1. Verify `.env` has `RESEND_API_KEY=re_...`
2. API key is correct (starts with `re_`)
3. Restart dev server after adding key
4. Check for typos

---

### **Issue: Error from Resend**

**Common Errors:**

1. **"Domain not verified"**
   - Solution: Use Resend's sandbox domain for testing
   - Or verify your domain (see Production Setup)

2. **"Invalid API key"**
   - Solution: Check API key is correct
   - Generate new one if needed

3. **"Rate limit exceeded"**
   - Solution: You've sent 100+ emails today
   - Wait 24 hours or upgrade plan

---

### **Issue: Email in Spam**

**Solutions:**
1. Verify your domain (most important!)
2. Add SPF, DKIM, DMARC records (Resend provides)
3. Use a professional "From" address
4. Avoid spam trigger words
5. Keep sending consistently

---

## 📧 Email Preview

**Subject:**
```
🎉 New Order #oa3jsdv3 - ₹230.00
```

**Body:**
```
🎉 NEW ORDER RECEIVED!

━━━━━━━━━━━━━━━━━━━━━━
📋 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━

Order ID: #oa3jsdv3
Date: 16/12/2025, 11:22 AM

👤 CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
Name: First User
Phone: 9865322138

📍 DELIVERY ADDRESS
━━━━━━━━━━━━━━━━━━━━━━
Dubai kurukku Sandhu, Dubai main road
Theni, Tamil Nadu
Pincode: 625531

📦 ORDER ITEMS
━━━━━━━━━━━━━━━━━━━━━━
1x Coconut Oil (500ml) - ₹230.00

━━━━━━━━━━━━━━━━━━━━━━
💰 TOTAL: ₹230.00
━━━━━━━━━━━━━━━━━━━━━━

🔗 Login to admin panel:
http://localhost:4000/admin/dashboard/orders

━━━━━━━━━━━━━━━━━━━━━━
SRMK Oil Mill - Admin Notification
```

---

## ✅ Quick Checklist

**For Local Testing:**
- [ ] Resend package installed (✅ Already done!)
- [ ] Created Resend account
- [ ] Got API key
- [ ] Added `RESEND_API_KEY` to `.env`
- [ ] Restarted dev server
- [ ] Placed test order
- [ ] Received email!

**For Production (Vercel):**
- [ ] Domain verified on Resend
- [ ] DNS records added
- [ ] Domain verification confirmed
- [ ] API key added to Vercel env vars
- [ ] Redeployed app
- [ ] Tested in production

---

## 🎯 Alternative: Using Resend Sandbox (Quick Test)

**Don't want to verify domain yet?**

While your domain is being verified, Resend allows testing with:

```typescript
from: "onboarding@resend.dev"  // Resend's test domain
```

**Limitations:**
- Can only send to your own email
- Shows "via resend.dev" in inbox
- Good for testing only

**To use:**
```typescript
// In /api/admin/notify-new-order/route.ts
from: "SRMK Oil Mill <onboarding@resend.dev>",  // Use this for testing
```

Once domain is verified, change back to:
```typescript
from: "SRMK Oil Mill <orders@srmkoilmill.in>",
```

---

## 📞 Need Help?

- **Resend Docs:** https://resend.com/docs
- **Resend Support:** support@resend.com
- **Resend Discord:** https://resend.com/discord

---

**Ready to test? Just add your API key to `.env` and restart the server!** 🚀
