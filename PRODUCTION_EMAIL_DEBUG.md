# 📧 Production Email Issue - Debug & Fix

## ✅ Fix Applied

Changed the email sender to use Resend's default domain that doesn't require verification.

---

## 🐛 Likely Causes

### **1. Missing Environment Variable on Vercel** (Most Common)

**Check if these are set on Vercel:**
- `RESEND_API_KEY`
- `NEXTAUTH_URL`

### **2. Wrong "From" Email (Fixed)**

**Before:**
- Tried to use `orders@srmkoilmill.in` (requires domain verification)
- Fallback to `onboarding@resend.dev` based on env variable

**After:**
- Always uses `onboarding@resend.dev` (Resend's verified domain)
- Works immediately without domain setup

---

## 🔧 Fix Steps for Production

### **Step 1: Update Environment Variables on Vercel**

1. Go to: https://vercel.com/[your-project]
2. Click **Settings** → **Environment Variables**
3. **Verify these variables exist:**

```env
RESEND_API_KEY=re_9n5cLrxC_CU3MASmqBnGL8e3bPkpGWqhV
NEXTAUTH_URL=https://your-domain.vercel.app
TWO_FACTOR_API_KEY=ccde159e-2760-11f1-bcb0-0200cd936042
RAZORPAY_KEY_ID=rzp_live_RyUNgt52SOqXCs
RAZORPAY_KEY_SECRET=NvFZBXYLCO9uT0HHdwtmyHVZ
DATABASE_URL=your_supabase_connection_string
NEXTAUTH_SECRET=f8e7d6c5b4a3918273645f6e5d4c3b2a1918273645f6e5d4c3b2a19182736
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC0EvPUgiS9PfB3GK54OgsptnLh11sE8tQ
```

4. Make sure **ALL environments** are checked (Production, Preview, Development)

### **Step 2: Redeploy**

After setting environment variables:
```bash
git add .
git commit -m "fix: Update email sender and delivery charge"
git push origin main
```

Or manually trigger redeploy in Vercel dashboard.

### **Step 3: Test Email**

1. Place a test order on production
2. Check `selvaraj.whizzkid@gmail.com` inbox
3. **Check spam folder** if not in inbox
4. Check Vercel logs for email sending

---

## 🔍 How to Check Vercel Logs

1. Go to Vercel dashboard
2. Click on your deployment
3. Click **Functions** tab
4. Find `/api/admin/notify-new-order`
5. Check logs for:
   - "📧 Email sent successfully" ✅
   - OR "❌ Resend error" ❌

**Look for these messages:**
```
📧 Attempting to send email via Resend...
✅ Email sent successfully via Resend!
```

---

## 🧪 Quick Test in Local (Before Production)

Test if email works locally first:

1. Go to: http://localhost:4000
2. Add items to cart
3. Place a **COD order**
4. Check if email arrives at `selvaraj.whizzkid@gmail.com`

**If local works but production doesn't:**
→ Environment variables missing on Vercel

---

## 📧 Resend Configuration

### **Current Setup:**

**Sender:** `SRMK Oil Mill <onboarding@resend.dev>`
- ✅ No domain verification needed
- ✅ Works immediately
- ✅ Reliable for testing

**Recipient:** `selvaraj.whizzkid@gmail.com`

### **Future: Custom Domain (Optional)**

If you want emails from `orders@srmkoilmill.in`:

1. Login to Resend: https://resend.com/domains
2. Add domain: `srmkoilmill.in`
3. Add DNS records (MX, TXT, DKIM)
4. Verify domain
5. Update code to use verified domain

**For now:** Using `onboarding@resend.dev` is perfectly fine and professional!

---

## 🔍 Debugging Checklist

### **If Email Still Not Working:**

- [ ] Verify `RESEND_API_KEY` is set on Vercel
- [ ] Check Vercel function logs for errors
- [ ] Verify `selvaraj.whizzkid@gmail.com` is correct email
- [ ] Check Gmail spam folder
- [ ] Check Resend dashboard for delivery status
- [ ] Ensure NEXTAUTH_URL is set correctly on Vercel
- [ ] Test with COD order first (simpler flow)
- [ ] Check if Resend API key is valid

### **Check Resend Dashboard:**

1. Login: https://resend.com/emails
2. Check **Recent Emails**
3. Look for emails to `selvaraj.whizzkid@gmail.com`
4. Check delivery status (Sent, Delivered, Bounced, etc.)

---

## 🎯 Most Likely Issue

**Missing Environment Variable on Vercel**

The `RESEND_API_KEY` might not be set in Vercel environment variables.

**To Fix:**
1. Go to Vercel Project Settings
2. Environment Variables
3. Add: `RESEND_API_KEY` = `re_9n5cLrxC_CU3MASmqBnGL8e3bPkpGWqhV`
4. Save and redeploy

---

## 📝 Test Order Flow

### **COD Order:**
```
1. Place COD order in production
2. Check Vercel logs: /api/admin/notify-new-order
3. Should see: "✅ Email sent successfully"
4. Check Gmail inbox (and spam)
```

### **Razorpay Order:**
```
1. Place online payment order
2. Complete payment
3. After payment success → Email sent
4. Check Gmail inbox
```

---

## 🚨 Quick Fix Command

If you want to test locally first to confirm email works:

```bash
# In your local terminal
cd /Users/tharanic/Documents/GitHub/SRMK-Oil-Bulk
# Place a test COD order on localhost:4000
# Check if email arrives at selvaraj.whizzkid@gmail.com
```

---

## 📞 Need Help?

Let me know:
1. **What type of order** did you place? (COD or Razorpay)
2. **Did you check spam folder?**
3. **Do you have access to Vercel logs?**
4. **Is RESEND_API_KEY set on Vercel?**

I can help debug further based on your answers!

---

**Most important:** Check Vercel Environment Variables for `RESEND_API_KEY` ⚠️
