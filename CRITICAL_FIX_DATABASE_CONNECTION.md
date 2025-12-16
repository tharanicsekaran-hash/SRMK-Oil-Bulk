# 🚨 CRITICAL FIX: Database Connection in Vercel

## ❌ Current Issue

**ALL production APIs are failing with 500 errors:**
- `/api/products` - No products showing
- `/api/admin/delivery-users` - Delivery management fails
- `/api/admin/orders` - Orders fail to load

**Error:** `{"error":"Internal server error"}`

---

## 🔍 Root Cause

**Vercel is using the WRONG database connection string!**

### **Current DATABASE_URL in Vercel (WRONG):**
```
postgresql://postgres:PASSWORD@db.vugpgnsvcqqbstbmeqyu.supabase.co:5432/postgres
```
❌ **Port 5432** = Direct connection (doesn't work in Vercel serverless)

### **Correct DATABASE_URL for Vercel:**
```
postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```
✅ **Port 6543** = Connection pooler (works in Vercel serverless)

---

## ✅ IMMEDIATE FIX (Do This Now!)

### **Step 1: Go to Vercel Dashboard**
1. Open https://vercel.com
2. Select your project: **SRMK Oil Mill**
3. Go to **Settings** → **Environment Variables**

### **Step 2: Update DATABASE_URL**
1. Find `DATABASE_URL` in the list
2. Click **Edit** (pencil icon)
3. **Replace the value with:**
   ```
   postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```
4. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### **Step 3: Redeploy**
1. Go to **Deployments** tab
2. Click the **3 dots** (···) next to latest deployment
3. Click **Redeploy**
4. ✅ Check "Use existing Build Cache"
5. Click **Redeploy**

### **Step 4: Wait & Test (2-3 minutes)**
1. Wait for deployment to complete
2. Test: https://www.srmkoilmill.in/products
3. Should show products! ✅

---

## 🎯 What's Different?

| Setting | Wrong (Current) | Correct (Fixed) |
|---------|----------------|-----------------|
| **Port** | 5432 | 6543 |
| **Connection** | Direct | Pooler |
| **Parameters** | None | `?pgbouncer=true&connection_limit=1` |
| **Works in Vercel?** | ❌ No | ✅ Yes |

---

## 📊 Why This Happens

### **Vercel = Serverless Functions**
- Each API call creates a new connection
- Direct connections (port 5432) = Too many connections
- Connection pooler (port 6543) = Shared connections

### **Local = Normal Server**
- Single persistent connection
- Direct connection (port 5432) works fine

---

## 🔐 Full Environment Variables Checklist

Make sure ALL these are set in Vercel:

```env
# Database - Connection Pooler (CRITICAL!)
DATABASE_URL=postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# NextAuth
NEXTAUTH_SECRET=f8e7d6c5b4a3918273645f6e5d4c3b2a1918273645f6e5d4c3b2a19182736
NEXTAUTH_URL=https://www.srmkoilmill.in

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC0EvPUgiS9PfB3GK54OgsptnLh11sE8tQ

# Resend Email
RESEND_API_KEY=re_your_actual_key
```

---

## 🧪 Testing After Fix

### **1. Products Page**
- Go to: https://www.srmkoilmill.in/products
- ✅ Should show 12 products

### **2. Admin Dashboard**
- Login: https://www.srmkoilmill.in/admin
- Go to **Orders** tab
- ✅ Should load orders

### **3. Delivery Management**
- Go to **Delivery Management**
- ✅ Should load delivery users (or empty state)

### **4. Place Test Order**
- Add product to cart
- Complete checkout
- ✅ Order should create successfully

---

## 📝 Verification Steps

### **Before Fix:**
```bash
curl https://www.srmkoilmill.in/api/products
# Returns: {"error":"Internal server error"}
```

### **After Fix:**
```bash
curl https://www.srmkoilmill.in/api/products
# Returns: [{"id":"cmiz...","nameTa":"தேங்காய் எண்ணெய்",...}]
```

---

## 🚨 Common Mistakes to Avoid

### **❌ Don't:**
- Use port 5432 in Vercel
- Forget the `?pgbouncer=true&connection_limit=1` parameters
- Use different connection strings for different environments

### **✅ Do:**
- Use port 6543 in Vercel
- Include pgbouncer parameters
- Test after deployment

---

## 🔧 If Still Failing After Fix

### **1. Check Vercel Function Logs:**
```
Vercel Dashboard → Deployments → Latest → Functions
```

### **2. Look for Specific Errors:**
- `Can't reach database server` → Wrong port/host
- `Authentication failed` → Wrong password
- `Too many connections` → Missing pgbouncer parameter
- `Prepared statement already exists` → Missing connection_limit

### **3. Clear Build Cache:**
- Redeploy **without** "Use existing Build Cache"

### **4. Check Prisma Generation:**
```bash
# In Vercel build logs, should see:
✔ Generated Prisma Client
```

---

## 📖 Reference

### **Supabase Connection Strings:**

**Direct Connection (Local only):**
```
postgresql://postgres:PASSWORD@HOST:5432/postgres
```
- Use for: Local development
- Port: 5432
- Pooling: No

**Connection Pooler (Vercel/Production):**
```
postgresql://postgres:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1
```
- Use for: Vercel, serverless environments
- Port: 6543
- Pooling: Yes

---

## ⏱️ Timeline to Resolution

| Time | Action | Status |
|------|--------|--------|
| Now | Update DATABASE_URL in Vercel | ⏳ Pending |
| +30s | Click Redeploy | ⏳ Pending |
| +2min | Build completes | ⏳ Pending |
| +3min | Test production site | ⏳ Pending |
| +3min | ✅ **SITE WORKING!** | ⏳ Pending |

---

## 💡 Prevention

To avoid this in the future:

1. **Document the correct connection string** ✅ (This file)
2. **Never change DATABASE_URL** without checking this guide
3. **Always use port 6543** for Vercel
4. **Keep local and production separate** (.env vs Vercel dashboard)

---

## 🎯 Quick Command Reference

### **Check if it's working:**
```bash
# Products API
curl https://www.srmkoilmill.in/api/products

# Should return JSON array of products
# If returns {"error":"Internal server error"} → Still broken
```

### **Check Vercel logs:**
```bash
vercel logs [deployment-url]
```

---

**THIS IS A CRITICAL PRODUCTION ISSUE - FIX IMMEDIATELY!** 🚨

**Estimated fix time:** 3 minutes  
**Impact:** HIGH - Entire site is broken  
**Priority:** P0 - URGENT  

---

**ACTION REQUIRED NOW:**
1. Go to Vercel Dashboard
2. Update DATABASE_URL to use port 6543 with pgbouncer parameters
3. Redeploy
4. Test

**DO THIS NOW! ⚡**

