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

// Admin API functions
export const getAdminStats = async () => {
  return await apiCall('/admin/stats');
};

export const getAdminUsers = async (page = 1, limit = 50) => {
  return await apiCall(`/admin/users?page=${page}&limit=${limit}`);
};

export const downloadAdminReport = async (reportType) => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportType}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  return response.blob();
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

// Notification API functions
export const getNotifications = async () => {
  const response = await apiCall('/notifications');
  return response.notifications || response;
};

export const getUnreadCount = async () => {
  return await apiCall('/notifications/unread-count');
};

export const markNotificationAsRead = async (notificationId) => {
  return await apiCall(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
};

export const markAllNotificationsRead = async () => {
  return await apiCall('/notifications/read-all', {
    method: 'PUT',
  });
};

// Order API functions
export const approveOrder = async (orderId, farmerNotes = '') => {
  return await apiCall(`/orders/${orderId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approved: true, farmerNotes }),
  });
};

export const rejectOrder = async (orderId, reason = '') => {
  return await apiCall(`/orders/${orderId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approved: false, farmerNotes: reason }),
  });
};

// Payment functions
export const checkPaymentStatus = async (transactionId) => {
  return await apiCall(`/payments/status/${transactionId}`);
};

export const getMpesaConfig = async () => {
  return await apiCall('/payments/config');
};
