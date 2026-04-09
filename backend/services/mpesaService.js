// M-Pesa Integration Service using IntaSend
// This provides a simpler, more reliable M-Pesa integration

import axios from 'axios';

// IntaSend Configuration
const INTASEND_CONFIG = {
  PUBLISHABLE_KEY: process.env.INTASEND_PUBLISHABLE_KEY || 'ISPubKey_test_620da1ea-5e59-4597-9308-02e9ec9a2f6d',
  SECRET_KEY: process.env.INTASEND_SECRET_KEY || 'ISSecretKey_test_1234567890123456789012345678901234567890',
  TEST_MODE: process.env.NODE_ENV !== 'production',
};

console.log('IntaSend Config loaded:', {
  hasPublishableKey: !!process.env.INTASEND_PUBLISHABLE_KEY,
  hasSecretKey: !!process.env.INTASEND_SECRET_KEY,
  testMode: INTASEND_CONFIG.TEST_MODE,
  publicKeyPrefix: INTASEND_CONFIG.PUBLISHABLE_KEY.substring(0, 20) + '...',
});

// Initialize IntaSend
const getIntaSendHeaders = () => ({
  'Authorization': `Bearer ${INTASEND_CONFIG.SECRET_KEY}`,
  'Content-Type': 'application/json',
  'X-IntaSend-Public-Key': INTASEND_CONFIG.PUBLISHABLE_KEY,
});

// Validate and format phone number for M-Pesa
export const validatePhoneNumber = (phone) => {
  // Remove any non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }

  throw new Error('Invalid phone number format. Use format: 07XX XXX XXX or +254 XXX XXX XXX');
};

// Generate transaction reference
export const generateTransactionRef = (orderId) => {
  const timestamp = Date.now();
  return `MSMS_${orderId}_${timestamp}`;
};

// Initiate M-Pesa STK Push using IntaSend
export const initiateSTKPush = async ({ phoneNumber, amount, orderId, accountReference, transactionDescription }) => {
  try {
    const formattedPhone = validatePhoneNumber(phoneNumber);

    const payload = {
      amount: Math.round(amount),
      phone_number: formattedPhone,
      currency: 'KES',
      api_ref: generateTransactionRef(orderId),
      wallet_id: INTASEND_CONFIG.TEST_MODE ? '174379' : process.env.INTASEND_WALLET_ID || '174379',
      account: accountReference,
      narrative: transactionDescription,
    };

    console.log('IntaSend STK Push payload:', JSON.stringify(payload, null, 2));
    console.log('IntaSend API URL:', 'https://api.intasend.com/api/v1/payment/collection/');
    console.log('IntaSend Headers:', {
      'Authorization': '***REDACTED***',
      'Content-Type': 'application/json',
      'X-IntaSend-Public-Key': INTASEND_CONFIG.PUBLISHABLE_KEY.substring(0, 20) + '...',
    });

    const response = await axios.post(
      'https://api.intasend.com/api/v1/payment/collection/',
      payload,
      { headers: getIntaSendHeaders() }
    );

    console.log('✅ IntaSend response successful:', response.data);

    if (response.data && response.data.id) {
      return {
        checkoutRequestId: response.data.id,
        customerMessage: `Payment request sent to ${phoneNumber}. Enter your M-Pesa PIN to complete payment.`,
        trackingId: response.data.tracking_id || response.data.id,
      };
    } else {
      console.error('❌ Invalid response from IntaSend - no ID returned:', response.data);
      throw new Error('Invalid response from IntaSend - no transaction ID');
    }
  } catch (error) {
    console.error('❌ IntaSend STK Push error:');
    console.error('   Status:', error.response?.status);
    console.error('   Full Response:', JSON.stringify(error.response?.data, null, 2));
    console.error('   Message:', error.message);
    
    // Extract specific error message from IntaSend
    const errorMessage = error.response?.data?.detail 
      || error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data?.error_description
      || error.message;
    
    console.error('   Extracted Error Message:', errorMessage);
    throw new Error(`M-Pesa payment initiation failed: ${errorMessage}`);
  }
};

// Query STK Push status
export const queryStkPushStatus = async (checkoutRequestId) => {
  try {
    const response = await axios.get(
      `https://api.intasend.com/api/v1/payment/status/${checkoutRequestId}/`,
      { headers: getIntaSendHeaders() }
    );

    return {
      status: response.data.state || response.data.status,
      resultCode: response.data.state === 'COMPLETE' ? '0' : '1',
      resultDesc: response.data.state || 'Unknown status',
      mpesaReceiptNumber: response.data.mpesa_receipt_number || null,
      transactionDate: response.data.created_at || null,
    };
  } catch (error) {
    console.error('IntaSend status query error:', error.response?.data || error.message);
    throw new Error(`Failed to check payment status: ${error.response?.data?.message || error.message}`);
  }
};

// Process M-Pesa callback (webhook)
export const processMpesaCallback = (callbackData) => {
  try {
    const { id, state, mpesa_receipt_number, amount, phone_number } = callbackData;

    return {
      checkoutRequestId: id,
      resultCode: state === 'COMPLETE' ? '0' : '1',
      resultDesc: state,
      mpesaReceiptNumber: mpesa_receipt_number,
      amount: amount,
      phoneNumber: phone_number,
      transactionDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    throw error;
  }
};
