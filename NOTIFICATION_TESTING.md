# 🔔 Order Notification Testing Guide

## ✅ What I Fixed

### **1. Notification Logic**
- Changed from `useState` to `useRef` for reliable order count tracking
- Fixed polling to work correctly every 30 seconds
- Added detailed console logging for debugging

### **2. How It Works**

```
1. Admin opens dashboard → Initial order count saved (e.g., 10 orders)
2. Every 30 seconds → Check current order count
3. If count increases (e.g., 10 → 11) → Trigger notification
4. Show toast + Play sound + Update count
```

---

## 🧪 Testing Steps

### **Test 1: Order Notification (30-Second Polling)**

1. **Open Admin Dashboard**
   ```
   URL: http://localhost:4000/admin/dashboard/orders
   Login: admin credentials
   ```

2. **Check Console**
   - You should see: `📊 Initial order count: X`
   - This is your baseline

3. **Place a New Order (Customer Side)**
   - Open new browser window/tab (incognito mode)
   - Go to: `http://localhost:4000`
   - Add products to cart
   - Complete checkout
   - Place order

4. **Wait & Watch Admin Dashboard**
   - **Within 30 seconds**, you should see:
     - Console: `🔍 Checking orders: Previous=X, Current=X+1`
     - Console: `🎉 NEW ORDERS DETECTED: 1 new order(s)!`
     - Toast notification: "🎉 1 new order received!"
     - Sound: Beep (if sound enabled)

---

### **Test 2: Email Notification**

1. **Check Terminal Logs After Order Creation**
   
   Look for these logs in your terminal:
   ```
   ✅ Order created successfully: [order-id]
   📧 Triggering email notification to: http://localhost:4000/api/admin/notify-new-order
   📧 Email notification response: 200
   ```

2. **Check Email API Logs**
   ```
   📧 ===== EMAIL NOTIFICATION API CALLED =====
   📧 Order ID: [order-id]
   ✅ Order found: { id, total, customer }
   📧 ===== EMAIL CONTENT =====
   To: tharanicsekaran@gmail.com
   Subject: 🎉 New Order #...
   Body: [full email content]
   ```

3. **Email Content Preview**
   - All order details logged to console
   - Ready for actual email sending (see implementation below)

---

### **Test 3: Sound Toggle**

1. **Enable/Disable Sound**
   - Click "Sound On" button → Changes to "Sound Off"
   - Place new order → No beep sound (only toast)
   - Click "Sound Off" → Changes to "Sound On"
   - Place new order → Beep sound plays ✅

---

### **Test 4: Sidebar Badge**

1. **New Order Badge**
   - New orders placed → Badge appears on "Orders" sidebar
   - Shows number (e.g., "3")
   - Click "Orders" → Badge clears

---

## 🐛 Troubleshooting

### **Issue: Toast Not Appearing**

**Check:**
1. Is polling running? Look for console logs: `🔍 Checking orders`
2. Is count increasing? `Previous=X, Current=Y`
3. Open browser console (F12) → Check for errors

**Fix:**
- Refresh admin dashboard
- Check if toast store is working (other toasts work?)

---

### **Issue: Sound Not Playing**

**Check:**
1. Is "Sound On" button active (blue)?
2. Browser console errors?
3. Browser blocked audio? (Some browsers block auto-play)

**Fix:**
- Click anywhere on page first (browsers require user interaction for audio)
- Check browser audio permissions
- Try different browser

---

### **Issue: Email Not Logging**

**Check Terminal:**
```bash
# Look for these logs:
✅ Order created successfully
📧 Triggering email notification
📧 Email notification response: 200
📧 ===== EMAIL NOTIFICATION API CALLED =====
```

**If Missing:**
1. Check order creation succeeded
2. Check `NEXTAUTH_URL` in `.env`
3. Restart development server

---

## 📧 Implementing Real Email Sending

### **Option 1: Resend (Recommended)**

1. **Install Resend**
   ```bash
   npm install resend
   ```

2. **Get API Key**
   - Sign up at https://resend.com
   - Get your API key
   - Add to `.env`:
     ```
     RESEND_API_KEY=re_xxxxxxxxxxxxx
     ```

3. **Update `/api/admin/notify-new-order/route.ts`**
   ```typescript
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   // Replace the console.log with:
   await resend.emails.send({
     from: 'orders@srmkoilmill.in',
     to: emailContent.to,
     subject: emailContent.subject,
     text: emailContent.body,
   });
   
   console.log("✅ Email sent successfully!");
   ```

4. **Verify Domain**
   - In Resend dashboard, verify your domain (srmkoilmill.in)
   - Add DNS records provided by Resend
   - Wait for verification

---

### **Option 2: Gmail SMTP (Quick Test)**

1. **Install Nodemailer**
   ```bash
   npm install nodemailer
   ```

2. **Add to `.env`**
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-specific-password
   ```
   
   Get app password: https://myaccount.google.com/apppasswords

3. **Update `/api/admin/notify-new-order/route.ts`**
   ```typescript
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS,
     },
   });
   
   await transporter.sendMail({
     from: process.env.EMAIL_USER,
     to: emailContent.to,
     subject: emailContent.subject,
     text: emailContent.body,
   });
   
   console.log("✅ Email sent via Gmail!");
   ```

---

## 📊 Expected Console Logs (Full Flow)

### **When Order is Placed:**
```
✅ Order created successfully: cm...
📧 Triggering email notification to: http://localhost:4000/api/admin/notify-new-order
📧 Email notification response: 200
📧 ===== EMAIL NOTIFICATION API CALLED =====
📧 Order ID: cm...
✅ Order found: { id: 'cm...', total: 230, customer: 'First User' }
📧 ===== EMAIL CONTENT =====
To: tharanicsekaran@gmail.com
Subject: 🎉 New Order #oa3jsdv3 - ₹230.00
Body: [full email]
📧 ===========================
✅ Email notification logged (not sent - implement email service)
```

### **On Admin Dashboard (Every 30s):**
```
🔍 Checking orders: Previous=10, Current=10
🔍 Checking orders: Previous=10, Current=11
🎉 NEW ORDERS DETECTED: 1 new order(s)!
```

---

## 🎯 Checklist

- [ ] Admin dashboard polling works (every 30s)
- [ ] Toast appears on new order
- [ ] Sound plays on new order (when enabled)
- [ ] Sound toggle button works
- [ ] Sidebar badge shows new order count
- [ ] Badge clears when clicking Orders
- [ ] Email API is called (check terminal logs)
- [ ] Email content is logged correctly
- [ ] (Optional) Real email sending implemented

---

## 🚀 Next Steps

1. **Test locally** using this guide
2. **Implement email service** (Resend or Gmail)
3. **Test email sending** with real service
4. **Deploy to Vercel**
5. **Test in production**

---

**Need help? Check the terminal logs for detailed debugging information!**

