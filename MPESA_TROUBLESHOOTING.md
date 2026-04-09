# M-Pesa Payment Not Working - Troubleshooting Guide

## Quick Diagnosis Steps

### Step 1: Check Backend Logs
1. Look at your backend terminal where `npm start` is running
2. Try depositing money to wallet
3. Look for these messages:

```
✅ IntaSend Config loaded:
✅ Config output shows: hasPublishableKey: true, hasSecretKey: true
✅ Initiating M-Pesa STK Push with: {...}
```

If you see ❌ errors, note the error message.

### Step 2: Verify IntaSend Credentials

Your `.env` file currently has:
```env
INTASEND_PUBLISHABLE_KEY="ISPubKey_test_44df7b25-4685-4c3c-b7de-e15857372f72"
INTASEND_SECRET_KEY="ISSecretKey_test_0d572d0b-8e73-4c87-8d1e-aefacbbdb940"
```

**Verify these are YOUR actual credentials from IntaSend:**

1. Go to https://sandbox.intasend.com/dashboard
2. Login with your account
3. Go to Settings → API Keys
4. Copy your **Publishable Key** and **Secret Key**
5. Update your `.env` file with YOUR actual keys
6. **Restart the backend** (Ctrl+C and npm start)

### Step 3: Test IntaSend Connection

Use the curl command to test if IntaSend is working:

```bash
# Get current config
curl http://localhost:3001/api/payments/config

# Expected response (if configured):
{
  "configured": true,
  "environment": "development",
  "testMode": true,
  "provider": "IntaSend",
  "message": "IntaSend is properly configured",
  "keyDetails": {
    "hasPublishableKey": true,
    "hasSecretKey": true
  }
}
```

### Step 4: Test M-Pesa Prompt

Open your browser console and run:

```javascript
// In browser DevTools > Console tab
fetch('http://localhost:3001/api/payments/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('msms_token')
  },
  body: JSON.stringify({ phoneNumber: '0790123456' })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    alert('✅ Test successful!\nCheck phone for M-Pesa prompt:\n' + data.nextStep);
  } else {
    alert('❌ Error:\n' + JSON.stringify(data, null, 2));
  }
});
```

Or use curl:
```bash
curl -X POST http://localhost:3001/api/payments/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"phoneNumber":"0790123456"}'
```

## Common Issues & Fixes

### Issue 1: "Invalid credentials"

**Cause:** Using wrong IntaSend API keys

**Fix:**
1. Go to https://sandbox.intasend.com/dashboard
2. Copy the correct Publishable Key and Secret Key
3. Update `.env` with YOUR keys
4. Restart backend

### Issue 2: "Phone number invalid"

**Cause:** Wrong phone number format

**Fix:** Use one of these formats:
- ✅ `0790123456` (local Kenya format)
- ✅ `254790123456` (international format)
- ✅ `+254790123456` (international with +)

NOT:
- ❌ `7901234567` (missing country code)
- ❌ `00254790123456` (double 0+254)

### Issue 3: "No prompt on phone"

**Possible Causes:**

1. **Phone number doesn't match M-Pesa account**
   - Solution: Use the phone number registered with your Safaricom account

2. **Amount too small or too large**
   - M-Pesa Sandbox: Test with 100-1000 KES
   - Live: 10-50,000 KES max

3. **IntaSend sandbox not set up**
   - Solution: Go to https://sandbox.intasend.com/
   - Create account if needed
   - Verify your wallet is set up
   - Get correct API keys

4. **Timeout issue** 
   - M-Pesa prompt expires after ~40 seconds
   - Solution: Be ready on your phone when initiating payment

### Issue 4: Backend keeps showing errors

**Check:**
1. Did you restart the backend after updating `.env`?
   ```bash
   # Stop: Press Ctrl+C in backend terminal
   # Start: npm start
   ```

2. Check the error message in backend terminal:
   ```
   ❌ IntaSend STK Push error:
   Status: 401
   Data: { detail: "Invalid authentication" }
   ```
   → This means your credentials are wrong

3. Look for more details:
   ```
   ❌ IntaSend STK Push error:
   Status: 400
   Data: { message: "Invalid phone number" }
   ```
   → This means your phone number format is wrong

## Backend Logs to Look For

After starting backend, you should see:
```
✅ IntaSend Config loaded: {
  hasPublishableKey: true,
  hasSecretKey: true,
  testMode: true,
  publicKeyPrefix: 'ISPubKey_test...'
}
```

When you initiate payment, you should see:
```
Initiating M-Pesa STK Push with: {
  phoneNumber: '254790123456',
  amount: 100,
  orderId: 'WALLET_...'
}

IntaSend STK Push payload: {...}
IntaSend API URL: https://api.intasend.com/api/v1/payment/collection/
IntaSend Headers: {...}

✅ IntaSend response successful: {
  id: 'some-transaction-id',
  ...
}
```

If you see ❌ errors, share the error message.

## Next Steps

1. **Restart backend** first!
   ```bash
   # In backend terminal:
   Ctrl+C  # Stop
   npm start  # Start
   ```

2. **Verify credentials** in `.env`
   - Copy from: https://sandbox.intasend.com/dashboard → Settings

3. **Test IntaSend connection** using one of the methods above

4. **Try deposit again** from Wallet page

5. **Check phone** for M-Pesa prompt within 40 seconds

6. **Share backend logs** if still not working

---

## IntaSend Sandbox Account

If you haven't created an account yet:

1. Go to https://sandbox.intasend.com/
2. Click "Sign Up"
3. Create account with email
4. Verify email
5. Go to Dashboard → Settings → API Keys
6. Copy **Publishable Key** and **Secret Key**
7. Add to your `.env`:
   ```env
   INTASEND_PUBLISHABLE_KEY=ISPubKey_test_YOUR_KEY_HERE
   INTASEND_SECRET_KEY=ISSecretKey_test_YOUR_KEY_HERE
   ```
8. Restart backend
9. Test!

## Support

If M-Pesa still doesn't work after these steps:

1. Share the **backend terminal logs** (error messages)
2. Confirm your IntaSend credentials are correct
3. Check your phone number format
4. Share the response from `/api/payments/config` endpoint

The most common issue is using **old/incorrect IntaSend credentials**!
