import { predictiveData, marketListings, trainingModules, walletTransactions } from '../data/mockData';

// This simulation will later be replaced by Axios/Fetch calls to backend endpoints
export const getPredictiveData = async () => {
  return new Promise(resolve => setTimeout(() => resolve(predictiveData), 250));
};

export const getTrainingModules = async () => {
  return new Promise(resolve => setTimeout(() => resolve(trainingModules), 250));
};

export const getWalletData = async () => {
  return new Promise(resolve => setTimeout(() => resolve({balance: 45200, transactions: walletTransactions}), 250));
};


let users = [];
let listings = [...marketListings];
let orders = [];

export const getUserByPhone = async phone => {
  return new Promise(resolve => {
    setTimeout(() => {
      const user = users.find(u => u.phone === phone);
      resolve(user || null);
    }, 250);
  });
};

export const saveUser = async ({ name, phone, role, location }) => {
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
