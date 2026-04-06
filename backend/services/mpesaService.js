// M-Pesa API Integration Services
import axios from 'axios';
import crypto from 'crypto';
import { MPESA_CONFIG, getMpesaUrl } from '../config/mpesa.js';

// Get M-Pesa OAuth token
export const getMpesaToken = async () => {
  try {
    const auth = Buffer.from(
      `${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(getMpesaUrl('AUTH'), {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get M-Pesa token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-Pesa');
  }
};

// Generate STK Push request
export const initiateSTKPush = async ({
  phoneNumber,
  amount,
  orderId,
  accountReference,
  transactionDescription,
}) => {
  try {
    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password from shortcode + passkey + timestamp
    const password = Buffer.from(
      `${MPESA_CONFIG.SHORTCODE}${MPESA_CONFIG.PASSKEY}${timestamp}`
    ).toString('base64');

    const payload = {
      BusinessShortCode: MPESA_CONFIG.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: MPESA_CONFIG.PAYMENT_TYPE,
      Amount: Math.round(amount),
      PartyA: phoneNumber.replace(/^0/, '254'), // Ensure proper format
      PartyB: MPESA_CONFIG.SHORTCODE,
      PhoneNumber: phoneNumber.replace(/^0/, '254'),
      CallBackURL: `${MPESA_CONFIG.CALLBACK_URL}?orderId=${orderId}`,
      AccountReference: accountReference || `ORDER_${orderId}`,
      TransactionDesc: transactionDescription || 'Payment for order',
    };

    const response = await axios.post(getMpesaUrl('STK'), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    };
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment'
    );
  }
};

// Query STK Push status
export const queryStkPushStatus = async (checkoutRequestId) => {
  try {
    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    const password = Buffer.from(
      `${MPESA_CONFIG.SHORTCODE}${MPESA_CONFIG.PASSKEY}${timestamp}`
    ).toString('base64');

    const payload = {
      BusinessShortCode: MPESA_CONFIG.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(getMpesaUrl('QUERY'), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: response.data.ResultCode === 0,
      resultCode: response.data.ResultCode,
      resultDescription: response.data.ResultDesc,
      data: response.data,
    };
  } catch (error) {
    console.error('STK Query error:', error.response?.data || error.message);
    throw new Error('Failed to query payment status');
  }
};

// Validate phone number format
export const validatePhoneNumber = (phone) => {
  // Accept formats: 254123456789, +254123456789, 0123456789
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else {
    throw new Error('Invalid phone number format');
  }
};

// Generate transaction reference
export const generateTransactionRef = (orderId) => {
  return `MSMS${orderId}${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
};

export default {
  getMpesaToken,
  initiateSTKPush,
  queryStkPushStatus,
  validatePhoneNumber,
  generateTransactionRef,
};
