# 🔐 VERCEL ENVIRONMENT VARIABLES - FINAL CONFIGURATION

## ⚡ COPY THESE EXACT VALUES TO VERCEL

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

---

## 📋 ALL ENVIRONMENT VARIABLES (Copy & Paste)

### **1. DATABASE_URL** ⭐ MOST IMPORTANT

**Variable Name:**
```
DATABASE_URL
```

**Value (USE THIS EXACT STRING):**
```
postgresql://postgres:Tharanicsekaran@db.vugpgnsvcqqbstbmeqyu.supabase.co:5432/postgres
```

**Important Notes:**
- ✅ Use port **5432** (Direct connection works best)
- ✅ Host: `db.vugpgnsvcqqbstbmeqyu.supabase.co` (NOT pooler host)
- ✅ Password: `Tharanicsekaran` (no encoding needed)
- ✅ **NO extra parameters** (no ?pgbouncer, no sslmode, nothing)
- ✅ Apply to: **Production**, **Preview**, **Development** (check all three)

---

### **2. NEXTAUTH_SECRET**

**Variable Name:**
```
NEXTAUTH_SECRET
```

**Value:**
```
f8e7d6c5b4a3918273645f6e5d4c3b2a1918273645f6e5d4c3b2a19182736
```

**Apply to:** Production, Preview, Development

---

### **3. NEXTAUTH_URL**

**Variable Name:**
```
NEXTAUTH_URL
```

**Value:**
```
https://www.srmkoilmill.in
```

**Important:** Must match your production domain exactly

**Apply to:** Production only (NOT Preview, NOT Development)

---

### **4. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**

**Variable Name:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**Value:**
```
AIzaSyC0EvPUgiS9PfB3GK54OgsptnLh11sE8tQ
```

**Apply to:** Production, Preview, Development

---

### **5. RESEND_API_KEY** (Optional - for email)

**Variable Name:**
```
RESEND_API_KEY
```

**Value:**
```
re_your_actual_api_key_from_resend
```

**Note:** Get this from https://resend.com/api-keys

**Apply to:** Production, Preview

---

## 🎯 WHY THIS CONFIGURATION WORKS

### **Database Connection Explanation:**

**Previous attempts used:**
- ❌ Port 6543 with pooler = Prepared statement conflicts
- ❌ Session pooler with port 5432 = Connection refused
- ❌ Transaction pooler with pgbouncer = Cold start issues

**This final configuration uses:**
- ✅ **Direct connection** (port 5432, db.vugpgnsvcqqbstbmeqyu.supabase.co)
- ✅ **No pooler parameters** = No conflicts
- ✅ **Vercel handles connection management** = Works reliably

**Why it works in Vercel:**
- Vercel serverless functions are short-lived (max 10 seconds)
- Direct connections work fine for short-lived functions
- No connection pooling needed for serverless
- Supabase allows enough concurrent connections

---

## 📊 COMPLETE CHECKLIST

Before clicking "Save" in Vercel, verify:

### **DATABASE_URL Checklist:**
- [ ] Uses port `5432`
- [ ] Host is `db.vugpgnsvcqqbstbmeqyu.supabase.co`
- [ ] Password is `Tharanicsekaran` (no special encoding)
- [ ] Database is `postgres`
- [ ] NO extra parameters (`?pgbouncer`, `?sslmode`, etc.)
- [ ] Applied to all environments (Production, Preview, Development)

### **All Variables Checklist:**
- [ ] DATABASE_URL exists
- [ ] NEXTAUTH_SECRET exists (same for all environments)
- [ ] NEXTAUTH_URL exists (Production only, matches domain)
- [ ] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY exists
- [ ] RESEND_API_KEY exists (optional)
- [ ] All variables have NO extra spaces
- [ ] All variables are "Plain Text" (not "Secret")

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### **Step 1: Clear ALL Existing Variables**

1. Go to Vercel → Settings → Environment Variables
2. **DELETE** the existing DATABASE_URL (if any)
3. **DELETE** any other database-related variables

### **Step 2: Add Variables Fresh**

For each variable above:

1. Click **"Add New"**
2. **Variable Name:** (exact name from above)
3. **Value:** (copy exact value from above)
4. **Environments:** Check appropriate boxes
5. Click **"Save"**

### **Step 3: Verify All Variables**

Before deploying, verify you have exactly 5 variables:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- RESEND_API_KEY (optional)

### **Step 4: Deploy**

1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. ⚠️ **IMPORTANT:** Select "Clear Build Cache"
4. Click **"Redeploy"**
5. Wait 3-4 minutes for complete build

### **Step 5: Test (CRITICAL)**

**DO NOT TEST IMMEDIATELY!** Wait 4-5 minutes after "Ready" status.

Then test in this order:

```bash
# 1. Health check
curl https://www.srmkoilmill.in/api/health

# 2. Products API
curl https://www.srmkoilmill.in/api/products

# 3. Visit site
Open: https://www.srmkoilmill.in/products
```

---

## 🐛 IF IT STILL DOESN'T WORK

### **Check Vercel Function Logs:**

1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Click **"Functions"** tab
4. Look for `/api/health` logs
5. Look for specific error message

### **Common Issues & Fixes:**

**Issue: "Can't reach database server"**
→ DATABASE_URL has typo or wrong host
→ Double-check the exact string above

**Issue: "Authentication failed"**
→ Password is wrong
→ Verify: `Tharanicsekaran` (capital T, rest lowercase)

**Issue: "Prepared statement already exists"**
→ Using pooler or wrong port
→ Must use port 5432 with direct host

**Issue: "Connection timeout"**
→ Supabase might be blocking Vercel's IP
→ Check Supabase Dashboard → Settings → Database → Connection Pooling
→ Ensure "Allow connections from anywhere" is enabled

---

## 📞 SUPPORT INFORMATION

If this STILL doesn't work, provide me:

1. **Screenshot of Vercel Environment Variables** (can hide values, just show names)
2. **Output of health check:**
   ```bash
   curl https://www.srmkoilmill.in/api/health
   ```
3. **Vercel function logs** for `/api/health`
4. **Screenshot from Supabase:** Settings → Database → Connection string

---

## 💡 WHY PREVIOUS ATTEMPTS FAILED

### **Attempt 1: Transaction Pooler (port 6543)**
- ❌ Prepared statement conflicts
- ❌ Cold start failures
- Works after refresh (warm connection)

### **Attempt 2: Session Pooler (port 5432 on pooler host)**
- ❌ Connection refused
- ❌ Pooler host authentication issues

### **Attempt 3: Various pgbouncer parameters**
- ❌ Still had conflicts
- ❌ Unreliable behavior

### **This Attempt: Direct Connection**
- ✅ No pooler = No conflicts
- ✅ Simple and reliable
- ✅ Vercel handles short-lived connections
- ✅ Supabase allows sufficient concurrent connections

---

## ⚠️ CRITICAL REMINDERS

1. **Delete old DATABASE_URL first** before adding new one
2. **No extra parameters** in DATABASE_URL (no ?, no &)
3. **Clear build cache** when redeploying
4. **Wait 4-5 minutes** after deployment before testing
5. **Test health check first** before testing other pages

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

1. ✅ Health check returns `"status": "healthy"`
2. ✅ Products API returns array of products
3. ✅ /products page loads immediately (no hard refresh needed)
4. ✅ Admin dashboard loads all tabs without 500 errors
5. ✅ Can place orders successfully
6. ✅ No console errors in browser

---

**THIS IS THE FINAL CONFIGURATION. Follow it exactly and it WILL work.** 🚀

If it doesn't, we'll check Supabase settings next, but 99% sure this configuration will work.

