import { predictiveData, marketListings, trainingModules, walletTransactions } from '../data/mockData';

// This simulation will later be replaced by Axios/Fetch calls to backend endpoints
export const getPredictiveData = async () => {
  return new Promise(resolve => setTimeout(() => resolve(predictiveData), 250));
};

export const getMarketListings = async () => {
  return new Promise(resolve => setTimeout(() => resolve(marketListings), 250));
};

export const getTrainingModules = async () => {
  return new Promise(resolve => setTimeout(() => resolve(trainingModules), 250));
};

export const getWalletData = async () => {
  return new Promise(resolve => setTimeout(() => resolve({balance: 45200, transactions: walletTransactions}), 250));
};

export const postNewListing = async listing => {
  return new Promise(resolve => setTimeout(() => resolve({...listing, id: Date.now()}), 300));
};

export const createOrder = async order => {
  return new Promise(resolve => setTimeout(() => resolve({...order, id: Date.now(), status: 'CREATED'}), 300));
};
