# 🚀 Quick OTP API Integration Guide

## What You Need to Do

Open: `src/app/api/auth/send-otp/route.ts`

Find the function `sendOtpViaSMS()` around **line 14** and replace it with your OTP API integration.

---

## Template to Fill

```typescript
async function sendOtpViaSMS(phone: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('YOUR_API_ENDPOINT_HERE', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',  // or different auth method
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Fill based on your API documentation:
        phone: phone,           // or: mobile, to, number, etc.
        otp: otp,              // or: message, text, code, etc.
        // Add other required fields:
        // sender_id: 'SRMKOIL',
        // template_id: 'xyz123',
        // country_code: '91',
      }),
    });

    const data = await response.json();
    
    // Adjust based on your API's success response format:
    if (!response.ok || data.status === 'error') {
      return { 
        success: false, 
        message: data.message || 'Failed to send OTP' 
      };
    }

    return { success: true };
    
  } catch (error) {
    console.error('OTP API Error:', error);
    return { 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    };
  }
}
```

---

## Information I Need from You

Please provide:

1. **API Endpoint URL:**
   - Example: `https://api.sms-provider.com/v1/send`

2. **Authentication Method:**
   - API Key? Token? Username/Password?
   - Where to include it? Header? Query parameter?

3. **Request Format:**
   - What fields are required?
   - What's the exact field names? (phone, mobile, to, number?)
   - Any other required fields? (sender_id, template_id, etc.)

4. **Response Format:**
   - How does success look like?
   - How does error look like?

5. **API Documentation Link** (if available)

---

## Example Format for Your Response

```
API Details:
- Endpoint: https://api.example.com/send-otp
- Auth: API Key in header as "X-API-Key: abc123xyz"
- Request: { "mobile": "9999999999", "otp": "123456", "sender": "SRMKOIL" }
- Success Response: { "status": "success", "message": "OTP sent" }
- Error Response: { "status": "error", "message": "Invalid number" }
```

Share these details and I'll write the exact integration code for you! 🚀

---

## Environment Variables

After integration, add to `.env`:

```env
# Your OTP API Credentials
SMS_API_KEY=your_api_key_here
SMS_API_ENDPOINT=your_api_endpoint_here
SMS_SENDER_ID=SRMKOIL
# Add any other credentials
```

And add same variables to **Vercel** (or your hosting platform) under Project Settings → Environment Variables.

---

## Testing After Integration

1. Start dev server: `npm run dev`
2. Go to: http://localhost:4000/auth
3. Try signup with your real phone number
4. Check if you receive the SMS
5. Enter the OTP and verify it works

---

**I'm ready to help!** Just share your OTP API details. 📱
