# 🔍 Production Debugging Guide - 500 Errors

## 📊 Current Status

**Deployed:** Improved logging + Health check endpoint  
**Commit:** `4cbec948`  
**Status:** 🚀 Building now...

---

## 🏥 Step 1: Check Health Endpoint (2 minutes after deployment)

### **Test the Health Check:**

```bash
curl https://www.srmkoilmill.in/api/health
```

### **Expected Responses:**

**✅ If Healthy:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-16T20:06:09.147Z",
  "database": {
    "connected": true,
    "responseTime": "50ms",
    "productCount": 12,
    "orderCount": 22
  },
  "environment": "production"
}
```
→ **Database is connected!** Products should work.

**❌ If Unhealthy:**
```json
{
  "status": "unhealthy",
  "error": "Can't reach database server...",
  "database": {
    "connected": false
  }
}
```
→ **Database connection issue!** See fixes below.

---

## 🔧 Step 2: Fix Based on Error Message

### **Error: "Can't reach database server"**

**Cause:** Wrong DATABASE_URL in Vercel  
**Fix:**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Update to:
   ```
   postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```
4. **Important:** Must use port **6543** (not 5432)
5. Save and redeploy

---

### **Error: "Authentication failed"**

**Cause:** Wrong password in DATABASE_URL  
**Fix:**

1. Your password is: `Tharanicsekaran`
2. Check Vercel environment variable has correct password
3. No special character encoding needed for this password

---

### **Error: "Prepared statement already exists"**

**Cause:** Missing connection pooler parameter  
**Fix:**

1. Ensure DATABASE_URL includes: `?pgbouncer=true&connection_limit=1`
2. Complete URL should be:
   ```
   postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```

---

### **Error: "Too many connections"**

**Cause:** Not using connection pooler  
**Fix:**

1. Change port from 5432 to 6543
2. Add `?pgbouncer=true&connection_limit=1`

---

## 📋 Step 3: Check Vercel Function Logs

### **How to Access:**

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments**
4. Click on the latest deployment
5. Go to **Functions** tab
6. Look for `/api/health` or `/api/products` logs

### **What to Look For:**

**Good logs:**
```
🏥 Health check starting...
📊 Environment: production
🔗 Database URL exists: true
✅ Database connected in 45ms
📦 Products in database: 12
```

**Bad logs:**
```
❌ Health check failed
Error: Can't reach database server at db.vugpgnsvcqqbstbmeqyu.supabase.co:5432
```
→ Means using wrong port (5432 instead of 6543)

---

## ✅ Step 4: Verify Complete Environment Variables

Make sure ALL of these are set in Vercel:

```env
DATABASE_URL=postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

NEXTAUTH_SECRET=f8e7d6c5b4a3918273645f6e5d4c3b2a1918273645f6e5d4c3b2a19182736

NEXTAUTH_URL=https://www.srmkoilmill.in

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC0EvPUgiS9PfB3GK54OgsptnLh11sE8tQ

RESEND_API_KEY=re_your_actual_key
```

**Check:**
- [ ] All variables exist
- [ ] No extra spaces
- [ ] DATABASE_URL uses port 6543
- [ ] DATABASE_URL includes `?pgbouncer=true&connection_limit=1`
- [ ] NEXTAUTH_URL matches your domain

---

## 🧪 Step 5: Test All Endpoints

After health check passes, test these:

### **1. Products API:**
```bash
curl https://www.srmkoilmill.in/api/products
```
**Should return:** Array of 12 products

### **2. Products Page:**
```
https://www.srmkoilmill.in/products
```
**Should show:** 12 products with images

### **3. Admin Login:**
```
https://www.srmkoilmill.in/admin
```
**Credentials:**
- Phone: 9999999999
- Password: admin123

### **4. Admin Dashboard:**
After login, go to Orders, Products, Delivery Management  
**Should:** Load without 500 errors

---

## 🔍 Common Issues & Solutions

### **Issue 1: Health check works but products don't load**

**Symptoms:**
- `/api/health` returns healthy
- `/api/products` returns 500

**Check:**
```bash
# Check Vercel function logs for /api/products
# Look for error message in logs
```

**Possible causes:**
- Prisma client not generated (check build logs)
- Schema mismatch (rare)

**Fix:**
1. Vercel Dashboard → Deployments
2. Redeploy **without** cache
3. Watch build logs for "Generated Prisma Client"

---

### **Issue 2: All APIs return 500**

**Symptoms:**
- All API routes fail
- Health check fails

**Fix:**
1. DATABASE_URL is definitely wrong
2. Go to Vercel environment variables
3. **Delete** the DATABASE_URL variable
4. **Create new** one with correct value
5. Redeploy

---

### **Issue 3: Works on first load, then fails**

**Symptoms:**
- First API call works
- Subsequent calls fail
- Error: "Prepared statement already exists"

**Fix:**
- Missing `connection_limit=1` parameter
- Add to DATABASE_URL: `?pgbouncer=true&connection_limit=1`

---

### **Issue 4: Intermittent failures**

**Symptoms:**
- Sometimes works, sometimes doesn't
- Random 500 errors

**Fix:**
- Not using connection pooler
- Change port from 5432 to 6543

---

## 📞 Debugging Checklist

Run through this checklist in order:

### **Pre-Deployment:**
- [ ] Committed latest changes
- [ ] Pushed to GitHub
- [ ] Vercel is building

### **Post-Deployment (wait 2-3 min):**
- [ ] Test health endpoint: `curl https://www.srmkoilmill.in/api/health`
- [ ] Check response is "healthy"
- [ ] Verify productCount and orderCount are correct

### **If Health Check Passes:**
- [ ] Test products API
- [ ] Visit products page
- [ ] Try adding to cart
- [ ] Test admin login
- [ ] Check admin dashboard

### **If Health Check Fails:**
- [ ] Check error message
- [ ] Go to Vercel function logs
- [ ] Look for specific error
- [ ] Apply fix from "Step 2" above
- [ ] Redeploy
- [ ] Wait 2-3 minutes
- [ ] Test again

---

## 🎯 Quick Reference

### **Correct DATABASE_URL for Vercel:**
```
postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### **Key Components:**
- Host: `db.vugpgnsvcqqbstbmeqyu.supabase.co`
- Port: `6543` (not 5432!)
- Database: `postgres`
- User: `postgres`
- Password: `Tharanicsekaran`
- Parameters: `?pgbouncer=true&connection_limit=1`

### **Test Commands:**
```bash
# Health check
curl https://www.srmkoilmill.in/api/health

# Products
curl https://www.srmkoilmill.in/api/products

# Check Vercel logs
vercel logs [deployment-url]
```

---

## 📊 What the Logs Will Show

### **In Vercel Function Logs for /api/health:**

**Good:**
```
🏥 Health check starting...
📊 Environment: production
🔗 Database URL exists: true
🔗 Database URL (masked): postgresql://postgres:****@db.vugpgnsvcqqbstbmeqyu.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
✅ Database connected in 45ms
📦 Products in database: 12
📋 Orders in database: 22
```

**Bad:**
```
🏥 Health check starting...
📊 Environment: production
🔗 Database URL exists: true
🔗 Database URL (masked): postgresql://postgres:****@db.vugpgnsvcqqbstbmeqyu.supabase.co:5432/postgres
❌ Health check failed
Error: Can't reach database server at db.vugpgnsvcqqbstbmeqyu.supabase.co:5432
```
→ Using wrong port (5432 instead of 6543)

---

## 🚀 Next Steps

1. **Wait 2-3 minutes** for Vercel deployment to complete
2. **Run health check:**
   ```bash
   curl https://www.srmkoilmill.in/api/health
   ```
3. **Share the output with me** so I can help identify the exact issue
4. **If healthy:** Test the products page
5. **If unhealthy:** Share the error message and we'll fix it

---

## 💡 Pro Tips

- Always test health check first before testing other endpoints
- Check Vercel function logs for detailed error messages
- DATABASE_URL must use port 6543 in Vercel (6543 = connection pooler)
- Local uses port 5432, Vercel uses port 6543 (they're different!)
- Don't use "Redeploy with cache" if changing environment variables

---

**Let me know the health check response and I'll guide you through the fix!** 🔍

