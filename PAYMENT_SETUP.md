# Payment System Setup Guide

## Overview
The MSMS platform now uses **IntaSend** to process M-Pesa payments. All wallet deposits and order payments go through IntaSend which communicates with Safaricom's M-Pesa API.

## 🚀 Quick Start

### 1. Create IntaSend Account
1. Visit [IntaSend Sandbox](https://sandbox.intasend.com/) for testing
2. Create a free account
3. Go to **Settings → API Keys**
4. Copy your **Publishable Key** and **Secret Key**

### 2. Update Environment Variables
Edit `backend/.env`:
```env
INTASEND_PUBLISHABLE_KEY=ISPubKey_test_xxxxxxxxxxxx
INTASEND_SECRET_KEY=ISSecretKey_test_xxxxxxxxxxxx
INTASEND_WALLET_ID=your_wallet_id
```

### 3. Test the Payment Flow

#### Test Case 1: Deposit to Wallet
1. Navigate to Wallet page
2. Click "Deposit"
3. Enter M-Pesa number: `0790123456`
4. Enter amount: `100` KES
5. Click "Deposit"
6. **You should get an M-Pesa prompt on your test number**

#### Test Case 2: Order Payment
1. Create a listing and order
2. Click "Pay" when order is APPROVED
3. Enter M-Pesa number and confirm
4. **M-Pesa prompt will appear**

## 📱 How M-Pesa Prompts Work

When you initiate a payment:
1. Your phone receives an **M-Pesa pop-up dialog** asking you to enter your PIN
2. This is sent directly from Safaricom (not from our app)
3. Once you enter your PIN, the transaction is processed
4. Our system receives a callback with the status

### ⚠️ Why You Might Not See a Prompt

1. **Incorrect IntaSend credentials** → Check `.env` file
2. **Invalid phone number format** → Use: `07XX XXX XXX` or `+254XXXXXXXXX`
3. **IntaSend API key is for wrong environment** → Use sandbox for testing
4. **Network issues** → Check internet connection on test phone
5. **You're using a real phone number, not a test number** → Use sandbox.intasend.com test credentials

## 💰 Payment Features

### Wallet Deposit
- **Min/Max:** 10 - 50,000 KES
- **Status:** PENDING → COMPLETED (when M-Pesa completes)
- **Fee:** IntaSend charges ~1-2% (configurable)

### Order Payment
- **Trigger:** When order is APPROVED
- **Amount:** Order total price
- **Status:** Follows M-Pesa callback status
- **Receipt:** M-Pesa receipt number recorded in system

### Wallet Withdrawal
- **Min/Max:** 50 - 50,000 KES
- **Status:** PENDING → COMPLETED
- **Destination:** Registered M-Pesa number

## 📊 Transaction History
All transactions now visible in:
- **Wallet page:** Recent transactions list with status
- Shows: Description, Amount, Status, Date

## 🔗 Payment Flow Diagram
```
User clicks "Deposit"
    ↓
Enters phone & amount
    ↓
Backend creates PENDING transaction
    ↓
Calls IntaSend API
    ↓
IntaSend sends M-Pesa prompt to phone
    ↓
User enters M-Pesa PIN
    ↓
IntaSend processes with Safaricom
    ↓
Payment results sent to webhook
    ↓
Transaction status COMPLETED/FAILED
    ↓
User balance updated
```

## 🛠️ Testing Checklist

- [ ] IntaSend account created
- [ ] API keys copied to `.env`
- [ ] Frontend restarts (if needed)
- [ ] Backend restarts
- [ ] Try wallet deposit
- [ ] Verify M-Pesa prompt appears
- [ ] Complete payment with test PIN
- [ ] Check transaction in wallet history
- [ ] Verify balance updated

## 📚 Useful Links

- [IntaSend Documentation](https://docs.intasend.com/)
- [IntaSend Sandbox](https://sandbox.intasend.com/)
- [M-Pesa Sandbox (Safaricom)](https://developer.safaricom.co.ke/)
- [MSMS API Reference](./backend/API_REFERENCE.md)

## ❓ Troubleshooting

### M-Pesa prompt not appearing
1. Check IntaSend credentials in `.env`
2. Enable logs: Add `console.log('Payment initiated:', ...)` in mpesaService.js
3. Check IntaSend dashboard for errors
4. Verify phone number format

### Transaction stuck as PENDING
1. Check IntaSend dashboard payment status
2. Verify backend received the callback
3. Check server logs for errors
4. May need manual status update in database

### Wrong amount charged
1. Verify amount sent matches order/deposit amount
2. Check IntaSend fee structure
3. Review transaction metadata in database

## 🔒 Security Notes

- Never commit real API keys to version control
- Use different keys for sandbox and production
- Keep JWT_SECRET secure
- Enable HTTPS in production
- Rate limit payment endpoints

## 🚀 Production Setup

When going live:
1. Create production IntaSend account
2. Update credentials in environment
3. Set `NODE_ENV=production`
4. Update `FRONTEND_URL` to production domain
5. Enable secure webhooks (HTTPS)
6. Set up proper error monitoring
7. Configure rate limiting
