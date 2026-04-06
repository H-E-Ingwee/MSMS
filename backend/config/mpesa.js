// M-Pesa Integration Configuration
// This file contains the M-Pesa API setup and constants

export const MPESA_CONFIG = {
  // M-Pesa Daraja API Credentials (sandbox environment)
  // These are the default sandbox credentials for testing
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || 'your_consumer_key_here',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret_here',
  
  // Shortcode (Business Code) - Sandbox default
  SHORTCODE: process.env.MPESA_SHORTCODE || '174379',
  
  // Passkey for STK Push (Sandbox default)
  PASSKEY: process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  
  // Callback URLs
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || 'http://localhost:3001/api/payments/mpesa/callback',
  TIMEOUT_URL: process.env.MPESA_TIMEOUT_URL || 'http://localhost:3001/api/payments/mpesa/timeout',
  
  // API Endpoints
  SANDBOX_AUTH_URL: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  SANDBOX_STK_URL: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  SANDBOX_QUERY_URL: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  
  PRODUCTION_AUTH_URL: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  PRODUCTION_STK_URL: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  PRODUCTION_QUERY_URL: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  
  // Transaction types
  BUSINESS_SHORT_CODE: 'BusinessShortCode',
  PAYMENT_TYPE: 'CustomerPayBillOnline',
  
  // Use sandbox (true) or production (false)
  SANDBOX_MODE: process.env.NODE_ENV !== 'production',
};

// Get the appropriate URL based on environment
export const getMpesaUrl = (endpoint) => {
  const mode = MPESA_CONFIG.SANDBOX_MODE ? 'SANDBOX' : 'PRODUCTION';
  return MPESA_CONFIG[`${mode}_${endpoint}_URL`];
};

// M-Pesa error codes reference
export const MPESA_ERROR_CODES = {
  'INVALID_SHORTCODE': { code: '400', message: 'Invalid merchant shortcode' },
  'INVALID_PHONE': { code: '401', message: 'Phone number is invalid' },
  'INSUFFICIENT_BALANCE': { code: '402', message: 'Insufficient business account balance' },
  'TRANSACTION_IN_PROGRESS': { code: '403', message: 'Transaction in progress' },
  'DUPLICATE_TRANSACTION': { code: '404', message: 'Duplicate transaction request' },
  'INVALID_AMOUNT': { code: '405', message: 'Invalid transaction amount' },
  'RATE_LIMIT_EXCEEDED': { code: '429', message: 'Rate limit exceeded' },
};

export default MPESA_CONFIG;
