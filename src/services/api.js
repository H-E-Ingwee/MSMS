import { predictiveData, marketListings, trainingModules, walletTransactions } from '../data/mockData';

// Backend integration: Replace with your actual API base URL
const API_BASE_URL = 'https://api.miraalink.com'; // TODO: Update with real backend URL

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

// Predictive data - keep mock for now
export const getPredictiveData = async () => {
  // TODO: Replace with real API call
  // return await apiCall('/predictive');
  return new Promise(resolve => setTimeout(() => resolve(predictiveData), 250));
};

export const getTrainingModules = async () => {
  // TODO: Replace with real API call
  // return await apiCall('/training');
  return new Promise(resolve => setTimeout(() => resolve(trainingModules), 250));
};

export const getWalletData = async () => {
  // TODO: Replace with real API call
  // return await apiCall('/wallet');
  return new Promise(resolve => setTimeout(() => resolve({balance: 45200, transactions: walletTransactions}), 250));
};


let users = [];
let listings = [...marketListings];
let orders = [];

export const getUserByPhone = async phone => {
  // TODO: Replace with real API call
  // return await apiCall(`/users/phone/${phone}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const user = users.find(u => u.phone === phone);
      resolve(user || null);
    }, 250);
  });
};

export const saveUser = async ({ name, phone, role, location }) => {
  // TODO: Replace with real API call
  // return await apiCall('/users', { method: 'POST', body: JSON.stringify({ name, phone, role, location }) });
  return new Promise(resolve => {
    setTimeout(() => {
      let existing = users.find(u => u.phone === phone);
      if (!existing) {
        existing = { id: Date.now(), name, phone, role, location, createdAt: new Date().toISOString() };
        users.push(existing);
      } else {
        existing = { ...existing, name, role, location };
      }
      resolve(existing);
    }, 300);
  });
};

export const postNewListing = async listing => {
  return new Promise(resolve => {
    setTimeout(() => {
      const saved = { ...listing, id: Date.now(), createdAt: new Date().toISOString(), status: 'AVAILABLE' };
      listings.push(saved);
      resolve(saved);
    }, 300);
  });
};

export const getMarketListings = async () => {
  return new Promise(resolve => setTimeout(() => resolve(listings), 250));
};

export const createOrder = async order => {
  return new Promise(resolve => {
    setTimeout(() => {
      const saved = { ...order, id: Date.now(), createdAt: new Date().toISOString(), status: 'PENDING' };
      orders.push(saved);
      resolve(saved);
    }, 300);
  });
};

export const getOrders = async userId => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(orders.filter(o => o.buyerId === userId || o.sellerId === userId));
    }, 250);
  });
};

export const processMpesaPayment = async ({ amount, phone, orderId }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!amount || !phone || !orderId) {
        return reject(new Error('Missing payment parameters')); 
      }
      resolve({ status: 'SUCCESS', transactionId: `MPESA-${Date.now()}`, amount, orderId });
    }, 600);
  });
};
