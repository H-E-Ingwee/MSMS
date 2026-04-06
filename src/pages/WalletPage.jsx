import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import { getWalletData } from '../services/api';

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const data = await getWalletData();
      setWallet(data);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 10) {
      alert('Minimum deposit amount is KES 10');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('msms_token')}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod: 'MPESA',
        }),
      });

      if (!response.ok) {
        throw new Error('Deposit failed');
      }

      const result = await response.json();
      alert('Deposit initiated successfully! Check your phone for M-Pesa prompt.');
      setDepositModal(false);
      setAmount('');
      loadWalletData();
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < 50) {
      alert('Minimum withdrawal amount is KES 50');
      return;
    }

    if (parseFloat(amount) > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('msms_token')}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Withdrawal failed');
      }

      const result = await response.json();
      alert('Withdrawal initiated successfully! Funds will be sent to your registered M-Pesa number.');
      setWithdrawModal(false);
      setAmount('');
      loadWalletData();
    } catch (error) {
      console.error('Withdraw error:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <SectionHeading title="M-Pesa Wallet" subtitle="Secure escrow and payments." />
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="font-medium text-emerald-100 tracking-wider text-sm">MSMS WALLET</span>
            <div className="font-bold italic text-lg tracking-tighter">M-PESA</div>
          </div>
          <p className="text-emerald-100 text-sm mb-1">Available Balance</p>
          <h1 className="text-4xl font-bold mb-6 tracking-tight">KES {wallet.balance.toLocaleString()}</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setWithdrawModal(true)}
              className="flex-1 bg-white text-emerald-700 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors"
            >
              Withdraw
            </button>
            <button
              onClick={() => setDepositModal(true)}
              className="flex-1 border border-white text-white py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4 px-1">Recent Transactions</h3>
        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {wallet.transactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'in' ? 'bg-emerald-100 text-emerald-600' : tx.type === 'out' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {tx.type === 'in' ? <TrendingUp size={16} /> : tx.type === 'out' ? <TrendingUp size={16} className="rotate-180" /> : <AlertCircle size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{tx.title}</p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${tx.type === 'in' ? 'text-emerald-600' : tx.type === 'out' ? 'text-gray-800' : 'text-orange-500'}`}>
                  {tx.type === 'in' ? '+' : tx.type === 'out' ? '-' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Deposit Money</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: KES 10, Maximum: KES 10,000</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDepositModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Withdraw Money</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  min="50"
                  max="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: KES 50, Maximum: KES 50,000</p>
                <p className="text-xs text-gray-600 mt-1">Available balance: KES {wallet.balance.toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
