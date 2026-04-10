// M-Pesa Daraja Integration Service
// Official M-Pesa API by Safaricom
// https://developer.safaricom.co.ke/

import axios from 'axios';
import { Buffer } from 'buffer';

// Daraja Configuration
const DARAJA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  BUSINESS_SHORTCODE: process.env.MPESA_BUSINESS_SHORTCODE || '174379',
  PASSKEY: process.env.MPESA_PASSKEY,
  ENVIRONMENT: process.env.MPESA_ENVIRONMENT || 'sandbox',
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || 'http://localhost:3001/api/payments/mpesa/callback',
};

// Daraja API URLs
const DARAJA_URLS = {
  sandbox: {
    auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    stkPushQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
    b2c: 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
    c2bRegister: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl',
  },
  production: {
    auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    stkPushQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
    b2c: 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
    c2bRegister: 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl',
  },
};

// Get the appropriate environment URLs
const API_URLS = DARAJA_URLS[DARAJA_CONFIG.ENVIRONMENT] || DARAJA_URLS.sandbox;

console.log('✅ Daraja Config loaded:', {
  hasConsumerKey: !!DARAJA_CONFIG.CONSUMER_KEY,
  hasConsumerSecret: !!DARAJA_CONFIG.CONSUMER_SECRET,
  environment: DARAJA_CONFIG.ENVIRONMENT,
  businessShortcode: DARAJA_CONFIG.BUSINESS_SHORTCODE,
  consumerKeyPrefix: DARAJA_CONFIG.CONSUMER_KEY?.substring(0, 10) + '...',
});

// Cache for access token
let accessTokenCache = {
  token: null,
  expiresAt: 0,
};

/**
 * Get Bearer Token from Daraja
 */
export const getAccessToken = async () => {
  // Return cached token if still valid
  if (accessTokenCache.token && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  try {
    const auth = Buffer.from(
      `${DARAJA_CONFIG.CONSUMER_KEY}:${DARAJA_CONFIG.CONSUMER_SECRET}`
    ).toString('base64');

    console.log('[Daraja] Requesting access token...');

    const response = await axios.get(API_URLS.auth, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3599; // Default 1 hour

    // Cache token
    accessTokenCache = {
      token,
      expiresAt: Date.now() + expiresIn * 1000 - 60000, // Refresh 1 min before expiry
    };

    console.log('✅ Access token obtained, expires in:', expiresIn, 'seconds');
    return token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.response?.data || error.message);
    throw new Error(`Daraja authentication failed: ${error.response?.data?.error_description || error.message}`);
  }
};

/**
 * Validate and format phone number for M-Pesa
 */
export const validatePhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('254')) {
    if (cleaned.length !== 12) throw new Error('Invalid phone number format: must be 12 digits starting with 254');
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }

  throw new Error('Invalid phone number format. Use format: 07XX XXX XXX or +254 XXX XXX XXX');
};

/**
 * Initiate STK Push (Lipa na M-Pesa Online)
 * Used for wallet deposits and order payments
 */
export const initiateSTKPush = async ({
  phoneNumber,
  amount,
  orderId,
  accountReference,
  transactionDescription,
}) => {
  try {
    const formattedPhone = validatePhoneNumber(phoneNumber);
    const token = await getAccessToken();

    // Generate timestamp (YYYYMMDDHHmmss)
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);

    // Generate password: base64(BusinessShortCode + Passkey + Timestamp)
    const passwordString = `${DARAJA_CONFIG.BUSINESS_SHORTCODE}${DARAJA_CONFIG.PASSKEY}${timestamp}`;
    const password = Buffer.from(passwordString).toString('base64');

    const payload = {
      BusinessShortCode: DARAJA_CONFIG.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: DARAJA_CONFIG.BUSINESS_SHORTCODE,
      PhoneNumber: formattedPhone,
      AccountReference: accountReference || 'MSMS',
      TransactionDesc: transactionDescription || 'MSMS Payment',
      CallBackURL: DARAJA_CONFIG.CALLBACK_URL,
    };

    console.log('📤 [Daraja STK Push] Initiating payment request:', {
      phoneNumber: formattedPhone,
      amount,
      orderId,
      timestamp,
    });

    const response = await axios.post(API_URLS.stkPush, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ [Daraja STK Push] Success:', response.data);

    return {
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
      timestamp,
    };
  } catch (error) {
    console.error('❌ [Daraja STK Push] Error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.errorMessage || error.message;
    throw new Error(`M-Pesa payment initiation failed: ${errorMsg}`);
  }
};

/**
 * Query STK Push Status
 */
export const querySTKPushStatus = async (checkoutRequestId) => {
  try {
    const token = await getAccessToken();

    // Generate timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);

    // Generate password
    const passwordString = `${DARAJA_CONFIG.BUSINESS_SHORTCODE}${DARAJA_CONFIG.PASSKEY}${timestamp}`;
    const password = Buffer.from(passwordString).toString('base64');

    const payload = {
      BusinessShortCode: DARAJA_CONFIG.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    console.log('[Daraja] Querying STK Push status...');

    const response = await axios.post(API_URLS.stkPushQuery, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ STK Push status:', response.data);

    return {
      resultCode: response.data.ResultCode,
      resultDescription: response.data.ResultDesc,
      merchantRequestId: response.data.MerchantRequestID,
      checkoutRequestId: response.data.CheckoutRequestID,
      mpesaReceiptNumber: response.data.MpesaReceiptNumber || null,
    };
  } catch (error) {
    console.error('❌ STK Push query error:', error.response?.data || error.message);
    throw new Error(`Failed to check payment status: ${error.message}`);
  }
};

/**
 * B2C Payment (Withdraw to user's M-Pesa account)
 */
export const initiateB2CPayment = async ({
  phoneNumber,
  amount,
  commandId = 'BusinessPayment',
  occasionId = null,
  remarks = 'MSMS Withdrawal',
}) => {
  try {
    const formattedPhone = validatePhoneNumber(phoneNumber);
    const token = await getAccessToken();

    const payload = {
      OriginatorConversationID: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      InitiatorName: 'MSMS_SYSTEM',
      SecurityCredential: encryptSecurityCredential(process.env.MPESA_SECURITY_CREDENTIAL || 'credential'),
      CommandID: commandId, // BusinessPayment, SalaryPayment, PromotionPayment
      Amount: Math.round(amount),
      PartyA: DARAJA_CONFIG.BUSINESS_SHORTCODE,
      PartyB: formattedPhone,
      Remarks: remarks,
      QueueTimeOutURL: DARAJA_CONFIG.CALLBACK_URL,
      ResultURL: DARAJA_CONFIG.CALLBACK_URL,
      OccassionID: occasionId,
    };

    console.log('📤 [Daraja B2C] Initiating withdrawal:', {
      phoneNumber: formattedPhone,
      amount,
    });

    const response = await axios.post(API_URLS.b2c, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ [Daraja B2C] Success:', response.data);

    return {
      conversationId: response.data.ConversationID,
      originatorConversationId: response.data.OriginatorConversationID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
    };
  } catch (error) {
    console.error('❌ [Daraja B2C] Error:', error.response?.data || error.message);
    throw new Error(`Withdrawal failed: ${error.response?.data?.errorMessage || error.message}`);
  }
};

/**
 * Process M-Pesa Callback
 * Parse the callback data from Daraja webhook
 */
export const processMpesaCallback = (callbackData) => {
  try {
    const body = callbackData.Body.stkCallback;

    return {
      merchantRequestId: body.MerchantRequestID,
      checkoutRequestId: body.CheckoutRequestID,
      resultCode: body.ResultCode,
      resultDescription: body.ResultDesc,
      amount: body.CallbackMetadata?.Item?.find((i) => i.Name === 'Amount')?.Value,
      mpesaReceiptNumber: body.CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber')?.Value,
      transactionDate: body.CallbackMetadata?.Item?.find((i) => i.Name === 'TransactionDate')?.Value,
      phoneNumber: body.CallbackMetadata?.Item?.find((i) => i.Name === 'PhoneNumber')?.Value,
      success: body.ResultCode === 0,
    };
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    throw error;
  }
};

/**
 * Encrypt security credential (placeholder - would need actual PKCS#1 encryption)
 */
const encryptSecurityCredential = (credential) => {
  // In production, this needs proper RSA encryption using Safaricom's public key
  // For now, returning base64 encoded credential
  return Buffer.from(credential).toString('base64');
};

export default {
  getAccessToken,
  validatePhoneNumber,
  initiateSTKPush,
  querySTKPushStatus,
  initiateB2CPayment,
  processMpesaCallback,
};
