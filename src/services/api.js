const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const AUTH_USER_KEY = 'msms_auth';
const AUTH_TOKEN_KEY = 'msms_token';

const getAuthHeaders = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.message || response.statusText;
      throw new Error(`API Error: ${message}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

export const requestOtp = async phone => {
  return await apiCall('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
};

export const loginWithOtp = async (phone, otp) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

  return response;
};

export const registerUser = async ({ name, phone, role, location }) => {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, role: role.toUpperCase(), location }),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

  return response;
};

export const getCurrentUser = async () => {
  return await apiCall('/auth/profile');
};

export const getPredictiveData = async () => {
  const response = await apiCall('/predictive');
  return response.predictions || response;
};

export const getTrainingModules = async () => {
  const response = await apiCall('/training');
  return response.modules || response;
};

export const getWalletData = async () => {
  const response = await apiCall('/wallet');
  return response;
};

export const getMarketListings = async () => {
  const response = await apiCall('/listings');
  return response.listings || response;
};

export const postNewListing = async listing => {
  const response = await apiCall('/listings', {
    method: 'POST',
    body: JSON.stringify(listing),
  });
  return response.listing || response;
};

export const createOrder = async order => {
  const response = await apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
  return response.order || response;
};

export const getOrders = async () => {
  const response = await apiCall('/orders');
  return response.orders || response;
};

export const processMpesaPayment = async ({ amount, phoneNumber, orderId }) => {
  const response = await apiCall(`/payments/order/${orderId}`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod: 'MPESA', phoneNumber, amount }),
  });
  return response;
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};
