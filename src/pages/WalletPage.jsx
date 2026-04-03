import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import { getWalletData } from '../services/api';

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWalletData().then(data => {
      setWallet(data);
      setLoading(false);
    });
  }, []);

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
            <button className="flex-1 bg-white text-emerald-700 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">Withdraw</button>
            <button className="flex-1 border border-white text-white py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">Deposit</button>
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
    </div>
  );
}
