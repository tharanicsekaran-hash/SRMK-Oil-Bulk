# 🔔 Toast & Sound Notification Debugging Guide

## ✅ What I Fixed

### **Problem:**
- Toast notifications and sound alerts were not triggering for new orders
- Polling logic wasn't properly initialized
- Order count comparison was unreliable

### **Solution:**
1. ✅ Added `isInitializedRef` to ensure proper initialization
2. ✅ Improved logging with timestamps for better debugging
3. ✅ Added 5-second delay before polling starts (gives time for initial load)
4. ✅ Added "Check Now" button for manual testing
5. ✅ Added order count display in the header
6. ✅ Enhanced console logging for each step

---

## 🧪 How to Test (Step-by-Step)

### **Step 1: Open Admin Dashboard**

1. Go to http://localhost:4000/admin/dashboard/orders
2. Open **Browser Console** (F12 or Right-click → Inspect → Console)
3. You should see these logs:
   ```
   📊 Initial order count: X
   ✅ Order tracking initialized
   🔄 Starting polling for new orders (every 30 seconds)...
   ```
4. Check the header - it should show "Last count: X"

---

### **Step 2: Quick Test (Use "Check Now" Button)**

1. **Without placing a new order first:**
   - Click the green "Check Now" button
   - Console should show:
     ```
     🧪 Manual check triggered
     🔍 [12:34:56] Checking orders: Previous=5, Current=5
     ```
   - No toast should appear (counts are same)

2. **Now place a new order:**
   - Open **another browser tab** (or incognito window)
   - Go to http://localhost:4000
   - Add product to cart
   - Complete checkout
   - Place order
   - Wait for success modal

3. **Go back to admin dashboard tab:**
   - Click the green "Check Now" button
   - Console should show:
     ```
     🧪 Manual check triggered
     🔍 [12:35:22] Checking orders: Previous=5, Current=6
     🎉 NEW ORDERS DETECTED: 1 new order(s)!
     🔊 Sound enabled: true
     🔔 Playing notification sound...
     ```
   - ✅ **Toast should appear:** "🎉 1 new order received!"
   - ✅ **Sound should play:** Short beep
   - ✅ **Header should update:** "Last count: 6"

---

### **Step 3: Test Automatic Polling**

1. **Wait and watch:**
   - Keep admin dashboard open
   - Every 30 seconds, you'll see:
     ```
     🔍 [12:36:00] Checking orders: Previous=6, Current=6
     ```
   - This confirms polling is running

2. **Place another order** (from customer tab)

3. **Wait up to 30 seconds**
   - Console will show:
     ```
     🔍 [12:36:30] Checking orders: Previous=6, Current=7
     🎉 NEW ORDERS DETECTED: 1 new order(s)!
     🔊 Sound enabled: true
     🔔 Playing notification sound...
     ```
   - ✅ Toast appears automatically
   - ✅ Sound plays automatically
   - ✅ Header updates

---

### **Step 4: Test Sound Toggle**

1. Click the "Sound On" button to disable sound
2. Button should change to "Sound Off" (gray)
3. Place a new order
4. Click "Check Now"
5. Console shows:
   ```
   🎉 NEW ORDERS DETECTED: 1 new order(s)!
   🔊 Sound enabled: false
   ```
6. ✅ Toast appears
7. ✅ No sound plays
8. Click "Sound Off" to re-enable

---

## 🐛 Troubleshooting

### **Issue: No console logs at all**

**Symptoms:**
- No logs in browser console
- Page seems frozen

**Solution:**
1. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console is open** (F12)
3. **Check console filter** - ensure "All" or "Logs" is selected
4. **Clear console** and reload page

---

### **Issue: Only see initial logs, no polling logs**

**Symptoms:**
```
📊 Initial order count: 5
✅ Order tracking initialized
🔄 Starting polling for new orders (every 30 seconds)...
(then nothing...)
```

**Solution:**
1. **Wait at least 35 seconds** after page load
2. You should see:
   ```
   🔍 [12:34:56] Checking orders: Previous=5, Current=5
   ```
3. If not, click "Check Now" button

---

### **Issue: Console shows "⏳ Skipping check - not initialized yet"**

**Symptoms:**
```
🧪 Manual check triggered
⏳ Skipping check - not initialized yet
```

**Solution:**
- The initial fetch hasn't completed
- **Wait 2-3 seconds** and try again
- Make sure you see "✅ Order tracking initialized" first

---

### **Issue: Toast appears but no sound**

**Symptoms:**
- ✅ Toast notification shows
- ❌ No sound plays
- Console shows: `🔊 Sound enabled: true`

**Solution:**
1. **Check browser sound permissions:**
   - Chrome: Click 🔒 (lock icon) in address bar → Sound → Allow
   - Firefox: Click 🔒 → Permissions → Autoplay → Allow Audio
2. **Check system volume** is not muted
3. **Try clicking on the page first** (some browsers require user interaction before playing sounds)
4. **Test with a known sound:**
   - Open browser console
   - Type: `new Audio('https://www.soundjay.com/button/beep-07.wav').play()`
   - If this doesn't play, it's a browser issue

---

### **Issue: New orders not detected**

**Symptoms:**
- Place order
- Console shows: `🔍 Checking orders: Previous=5, Current=5`
- Count doesn't increase

**Solution:**
1. **Check if order was actually created:**
   - Refresh the orders page manually
   - Check database: http://localhost:5555 (Prisma Studio)
2. **Check API response:**
   - Network tab → `/api/admin/orders`
   - Check if response includes the new order
3. **Try clicking "Check Now" multiple times**
4. **Hard refresh** the admin page

---

### **Issue: Toast appears multiple times**

**Symptoms:**
- Single order placed
- Multiple toasts appear

**Solution:**
- This happens if you have **multiple admin tabs open**
- Each tab runs its own polling
- **Close duplicate tabs**

---

### **Issue: Sound plays but is very quiet**

**Solution:**
1. The beep is set to 30% volume by default
2. To make it louder, edit `/src/app/admin/dashboard/orders/page.tsx`:
   ```typescript
   gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
   // Change to:
   gainNode.gain.setValueAtTime(0.7, audioContext.currentTime); // 70% volume
   ```

---

## 📊 Expected Console Output

### **On Page Load:**
```
📊 Initial order count: 5
✅ Order tracking initialized
🔄 Starting polling for new orders (every 30 seconds)...
```

### **Every 30 Seconds (No New Orders):**
```
🔍 [12:34:56] Checking orders: Previous=5, Current=5
🔍 [12:35:26] Checking orders: Previous=5, Current=5
🔍 [12:35:56] Checking orders: Previous=5, Current=5
```

### **When New Order is Placed:**
```
🔍 [12:36:26] Checking orders: Previous=5, Current=6
🎉 NEW ORDERS DETECTED: 1 new order(s)!
🔊 Sound enabled: true
🔔 Playing notification sound...
```

### **When Sound is Disabled:**
```
🔍 [12:37:26] Checking orders: Previous=6, Current=7
🎉 NEW ORDERS DETECTED: 1 new order(s)!
🔊 Sound enabled: false
```

---

## 🎯 Quick Checklist

**Before Testing:**
- [ ] Dev server running (`npm run dev`)
- [ ] Admin dashboard page open (http://localhost:4000/admin/dashboard/orders)
- [ ] Browser console open (F12)
- [ ] Sound enabled (blue button)

**During Test:**
- [ ] See initial logs in console
- [ ] See "Last count: X" in header
- [ ] Place test order from another tab/window
- [ ] Click "Check Now" button
- [ ] See toast notification appear
- [ ] Hear notification sound
- [ ] See updated count in header

**If Something Fails:**
1. Check console for error messages
2. Try hard refresh (Ctrl+Shift+R)
3. Check browser sound permissions
4. Verify order was created (refresh page)
5. Try "Check Now" button multiple times

---

## 🔧 Advanced Debugging

### **Enable Verbose Logging**

Add this to the top of `fetchOrdersQuietly()` function:

```typescript
console.log("=== FETCH ORDERS QUIETLY DEBUG ===");
console.log("Initialized:", isInitializedRef.current);
console.log("Last Count Ref:", lastOrderCountRef.current);
console.log("Sound Enabled:", soundEnabled);
```

### **Test Sound Directly in Console**

Open browser console and paste:

```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
oscillator.type = "sine";
oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.3);
```

If this plays a beep, the sound system works!

### **Test Toast Directly**

Open browser console and paste:

```javascript
// Find the toast store
const toastStore = window.__ZUSTAND_STORE__;
// Or manually trigger:
const event = new CustomEvent('show-toast', { 
  detail: { message: 'Test notification!', type: 'success' } 
});
window.dispatchEvent(event);
```

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Console shows initialization logs on page load
2. ✅ Console shows polling checks every 30 seconds
3. ✅ "Check Now" button triggers immediate check
4. ✅ Toast appears when new order is placed
5. ✅ Sound plays when toast appears (if enabled)
6. ✅ Order count updates in header
7. ✅ Sound toggle button works correctly

---

**Need more help?** Check the browser console for specific error messages!
