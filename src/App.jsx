import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, ShoppingCart, BookOpen, Wallet, Leaf, MapPin, 
  Phone, CheckCircle2, AlertCircle, PlusCircle, Video, Lock, User, LogOut,
  ShieldAlert, Users, Database, Activity
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const MOCK_PREDICTIONS = [
  { day: 'Mon', kangetaActual: 450, kangetaPred: 455, gizaPred: 800, demand: 1200 },
  { day: 'Tue', kangetaActual: 460, kangetaPred: 470, gizaPred: 820, demand: 1350 },
  { day: 'Wed', kangetaActual: 480, kangetaPred: 490, gizaPred: 810, demand: 1500 },
  { day: 'Thu', kangetaActual: 510, kangetaPred: 520, gizaPred: 850, demand: 1800 },
  { day: 'Fri', kangetaActual: null, kangetaPred: 550, gizaPred: 900, demand: 2100 }, // Peak
  { day: 'Sat', kangetaActual: null, kangetaPred: 580, gizaPred: 950, demand: 2400 },
  { day: 'Sun', kangetaActual: null, kangetaPred: 540, gizaPred: 880, demand: 2000 },
];

const INITIAL_LISTINGS = [
  { id: 1, grade: 'Kangeta', farmer: 'Joel M.', location: 'Meru Central', price: 600, qty: 50, verified: true, status: 'available' },
  { id: 2, grade: 'Alele', farmer: 'Sarah N.', location: 'Embu', price: 350, qty: 120, verified: true, status: 'available' },
  { id: 3, grade: 'Giza', farmer: 'Peter K.', location: 'Igembe South', price: 850, qty: 30, verified: false, status: 'available' },
];

const TRAINING_MODULES = [
  { id: 1, title: 'Sustainable Soil Management & Mulching', type: 'Video', duration: '5 mins', category: 'Conservation' },
  { id: 2, title: 'Water Conservation in Dry Seasons', type: 'Article', duration: '3 mins read', category: 'Environment' },
  { id: 3, title: 'Proper Harvesting Techniques for Quality', type: 'Video', duration: '8 mins', category: 'Harvesting' },
];

export default function App() {
  // --- APP STATE ---
  const [user, setUser] = useState(null); // null means not logged in
  const [activeTab, setActiveTab] = useState('dashboard');
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [walletBalance, setWalletBalance] = useState(12500);
  const [transactions, setTransactions] = useState([
    { id: 101, title: 'Initial Deposit', date: 'Today, 08:00 AM', amount: '+12,500', type: 'in' }
  ]);
  
  // --- UI STATE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [showAddListing, setShowAddListing] = useState(false);
  const [pendingTx, setPendingTx] = useState(null); // Holds data for the M-Pesa prompt

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- HANDLERS ---
  const handleLogin = (e, role) => {
    e.preventDefault();
    const phoneInput = e.target.closest('form').querySelector('input[type="tel"]').value;
    
    // Check for predefined Admin
    if (phoneInput === '707897640' || phoneInput === '+254707897640') {
      setUser({ 
        name: 'Joel Phineas', 
        role: 'admin', 
        phone: '+254707897640', 
        location: 'Meru' 
      });
      setActiveTab('admin_dashboard');
      return;
    }

    // Default Login
    setUser({ name: 'Test User', role: role, phone: '+254712345678', location: 'Meru' });
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const initiatePurchase = (listing) => {
    setPendingTx({ type: 'purchase', item: listing, amount: listing.price * listing.qty });
    setShowMpesaModal(true);
  };

  const confirmMpesaTransaction = () => {
    if (pendingTx.type === 'purchase') {
      const totalCost = pendingTx.amount;
      if (walletBalance >= totalCost) {
        // Deduct balance
        setWalletBalance(prev => prev - totalCost);
        // Mark listing as sold
        setListings(prev => prev.map(l => l.id === pendingTx.item.id ? { ...l, status: 'sold' } : l));
        // Add transaction
        setTransactions(prev => [
          { id: Date.now(), title: `Payment to ${pendingTx.item.farmer} (Escrow)`, date: 'Just now', amount: `-${totalCost}`, type: 'out' },
          ...prev
        ]);
        alert("Payment successful! Funds held in MSMS Escrow until delivery.");
      } else {
        alert("Insufficient MSMS Wallet Balance. Please deposit funds.");
      }
    }
    setShowMpesaModal(false);
    setPendingTx(null);
  };

  const handleAddListing = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newListing = {
      id: Date.now(),
      grade: formData.get('grade'),
      farmer: user.name,
      location: formData.get('location'),
      price: Number(formData.get('price')),
      qty: Number(formData.get('qty')),
      verified: true,
      status: 'available'
    };
    setListings([newListing, ...listings]);
    setShowAddListing(false);
    alert("Produce listed successfully on the marketplace!");
  };

  // --- VIEWS ---

  const AuthView = () => (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-green-600 p-3 rounded-xl shadow-lg">
            <Leaf size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-center text-gray-800 mb-2">MiraaLink MSMS</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Predictive Pricing & Smart Marketplace</p>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">+254</span>
              <input type="tel" defaultValue="707897640" className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">M-Pesa PIN / Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" defaultValue="1234" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
            </div>
          </div>
          
          <div className="pt-4 grid grid-cols-2 gap-3">
            <button onClick={(e) => handleLogin(e, 'farmer')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
              Login as Farmer
            </button>
            <button onClick={(e) => handleLogin(e, 'buyer')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
              Login as Buyer
            </button>
          </div>
          <div className="pt-2">
            <button onClick={(e) => handleLogin(e, 'admin')} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2">
              <ShieldAlert size={18} /> Login as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AdminDashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Admin Control Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">System-wide monitoring and user management.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-700 flex items-center gap-2">
          <Database size={16} className="text-blue-500" /> 
          PostgreSQL Connected
        </div>
      </header>

      {/* Admin Identity Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
            <User size={32} className="text-gray-300" />
          </div>
          <div>
            <h3 className="text-xl font-black">{user?.name}</h3>
            <p className="text-gray-400 font-medium text-sm flex items-center gap-2 mt-1">
              <MapPin size={14} /> {user?.location} &nbsp;|&nbsp; <Phone size={14} /> {user?.phone}
            </p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/30">
            Super Admin
          </span>
        </div>
      </div>

      {/* System KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
            <Users size={16} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-800">1,245</h3>
          <p className="text-xs text-green-600 font-bold mt-2">+12 this week</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Listings</p>
            <ShoppingCart size={16} className="text-orange-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-800">{listings.length}</h3>
          <p className="text-xs text-gray-500 font-bold mt-2">Across all regions</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Escrow Vol.</p>
            <Wallet size={16} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-800">KES 842K</h3>
          <p className="text-xs text-green-600 font-bold mt-2">+15% vs last month</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Health</p>
            <Activity size={16} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-green-600">99.9%</h3>
          <p className="text-xs text-gray-500 font-bold mt-2">All services operational</p>
        </div>
      </div>

      {/* User Management & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-4">Recent User Registrations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-bold">Name</th>
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold">Location</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'David M.', role: 'Farmer', loc: 'Meru North', status: 'Pending' },
                  { name: 'Agnes K.', role: 'Buyer', loc: 'Nairobi', status: 'Verified' },
                  { name: 'Peter W.', role: 'Farmer', loc: 'Embu', status: 'Verified' },
                ].map((u, i) => (
                  <tr key={i}>
                    <td className="py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 text-gray-600">{u.role}</td>
                    <td className="py-3 text-gray-600">{u.loc}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold text-xs">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Platform Activity</h3>
          <div className="space-y-4">
            {[
              { log: 'New listing (Kangeta)', time: '5 mins ago', icon: Leaf, color: 'text-green-500 bg-green-50' },
              { log: 'Escrow release (#402)', time: '12 mins ago', icon: Wallet, color: 'text-blue-500 bg-blue-50' },
              { log: 'Failed login attempt', time: '1 hour ago', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${act.color}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{act.log}</p>
                    <p className="text-xs text-gray-500">{act.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="w-full mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm transition-colors">
            View Full Audit Log
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Predictive Intelligence</h2>
        <p className="text-sm text-gray-500">AI-driven forecasts for {user?.role === 'farmer' ? 'optimal harvesting' : 'smart buying'}.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Price (Kangeta)</p>
          <h3 className="text-2xl font-black text-gray-800">KES 480</h3>
          <p className="text-xs text-green-600 flex items-center mt-2 font-bold bg-green-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp size={12} className="mr-1" /> +5% vs yesterday
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">7-Day Peak Forecast</p>
          <h3 className="text-2xl font-black text-blue-600">KES 580</h3>
          <p className="text-xs text-blue-600 flex items-center mt-2 font-bold bg-blue-50 w-fit px-2 py-1 rounded-md">
            Expected on Saturday
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 p-5 rounded-2xl shadow-md col-span-2 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Leaf size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-green-200 uppercase tracking-wider mb-1">AI Recommendation</p>
            <h3 className="text-xl font-bold mb-1">
              {user?.role === 'farmer' ? 'Hold harvest until Weekend' : 'Buy now before price surge'}
            </h3>
            <p className="text-sm text-green-100">Demand from export markets is predicted to rise by 25% by Friday.</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Price Forecast (Kangeta & Giza)</h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">ARIMA Model</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PREDICTIONS} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Line type="monotone" dataKey="kangetaActual" name="Actual (Kangeta)" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="kangetaPred" name="Predicted (Kangeta)" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Market Demand Volume (kg)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PREDICTIONS} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="demand" name="Total Demand" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const MarketplaceView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Marketplace</h2>
          <p className="text-sm text-gray-500">Direct, transparent trading.</p>
        </div>
        {user?.role === 'farmer' && (
          <button onClick={() => setShowAddListing(!showAddListing)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 flex items-center gap-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95">
            <PlusCircle size={18} />
            <span className="hidden sm:inline">{showAddListing ? 'Cancel' : 'List Produce'}</span>
          </button>
        )}
      </div>

      {/* Add Listing Form (Farmers Only) */}
      {showAddListing && user?.role === 'farmer' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-gray-800 mb-4">Post New Harvest</h3>
          <form onSubmit={handleAddListing} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Grade</label>
              <select name="grade" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-500" required>
                <option value="Kangeta">Kangeta</option>
                <option value="Alele">Alele</option>
                <option value="Giza">Giza</option>
                <option value="Lomboko">Lomboko</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Location</label>
              <input type="text" name="location" defaultValue="Meru Central" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Quantity (kg)</label>
              <input type="number" name="qty" min="1" placeholder="e.g. 50" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Price per kg (KES)</label>
              <input type="number" name="price" min="1" placeholder="e.g. 500" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-500" required />
            </div>
            <div className="md:col-span-4 flex justify-end mt-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors">Publish to Market</button>
            </div>
          </form>
        </div>
      )}

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {listings.filter(l => l.status === 'available').map(item => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-black text-lg text-gray-800">{item.grade}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={14} className="text-green-600" /> {item.location}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl text-green-700">KES {item.price}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">per kg</p>
              </div>
            </div>
            
            <div className="py-3 border-y border-gray-100 my-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-black text-sm">
                  {item.farmer.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                    {item.farmer}
                    {item.verified && <CheckCircle2 size={16} className="text-blue-500" />}
                  </p>
                  <p className="text-xs text-gray-500">{item.verified ? 'Verified Farmer' : 'New Farmer'}</p>
                </div>
              </div>
              <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                {item.qty} kg
              </div>
            </div>

            <div className="flex gap-3">
              {user?.role === 'buyer' ? (
                <button 
                  onClick={() => initiatePurchase(item)}
                  className="flex-1 bg-gray-900 hover:bg-black text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                  <Wallet size={16} /> Buy via Escrow
                </button>
              ) : (
                <button className="flex-1 bg-gray-100 text-gray-400 py-3 rounded-xl text-sm font-bold cursor-not-allowed">
                  Buyers Only
                </button>
              )}
              <button className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors">
                <Phone size={20} />
              </button>
            </div>
          </div>
        ))}
        {listings.filter(l => l.status === 'available').length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <ShoppingCart className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No available listings right now.</p>
          </div>
        )}
      </div>
    </div>
  );

  const WalletView = () => (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Digital Wallet</h2>
        <p className="text-sm text-gray-500">Secure M-Pesa integration & Escrow.</p>
      </header>

      {/* Wallet Card */}
      <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-300 tracking-wider text-sm">MSMS ESCROW</span>
            </div>
            <div className="font-black italic text-xl tracking-tighter text-green-400">M-PESA</div>
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Available Balance</p>
          <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">KES {walletBalance.toLocaleString()}</h1>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-500 hover:bg-green-400 text-gray-900 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2">
              <TrendingUp size={16} className="rotate-180" /> Deposit
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold text-sm transition-colors border border-gray-700 flex items-center justify-center gap-2">
              <TrendingUp size={16} /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Recent Transactions</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {tx.type === 'in' ? <TrendingUp size={20} /> : <ShoppingCart size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{tx.title}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{tx.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-black ${tx.type === 'in' ? 'text-green-600' : 'text-gray-800'}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TrainingView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sustainability Hub</h2>
        <p className="text-sm text-gray-500">Learn modern, climate-smart Miraa farming.</p>
      </header>

      {/* Tip of the day */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5 shadow-sm">
        <div className="p-4 bg-green-600 text-white rounded-2xl shrink-0 shadow-md">
          <Leaf size={32} />
        </div>
        <div>
          <h4 className="font-black text-green-900 text-lg mb-1">SDG 12: Responsible Production</h4>
          <p className="text-sm font-medium text-green-800 leading-relaxed">
            Applying organic mulch around the base of your Miraa trees helps retain soil moisture during dry spells. This reduces the need for excessive watering by 30% and improves long-term yield.
          </p>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 pt-4">Featured Modules</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TRAINING_MODULES.map(mod => (
          <div key={mod.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg transition-all flex flex-col">
            <div className="h-48 bg-gray-100 relative flex items-center justify-center overflow-hidden">
              {/* Simulated thumbnail */}
              <div className="absolute inset-0 bg-green-900/10 group-hover:bg-green-900/0 transition-colors z-10"></div>
              <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${mod.title}&backgroundColor=10b981`} alt="Thumbnail" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
              
              {mod.type === 'Video' && (
                <div className="absolute z-20 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Video className="text-green-600 ml-1" size={24} />
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
                  {mod.category}
                </span>
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  {mod.duration}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-base leading-tight">{mod.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- STK PUSH SIMULATION MODAL ---
  const MpesaModal = () => {
    if (!showMpesaModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-in-center">
          <div className="bg-green-600 p-6 text-center">
            <h3 className="font-black text-white text-xl tracking-wider">M-PESA</h3>
          </div>
          <div className="p-6 text-center space-y-6">
            <p className="text-gray-800 font-medium leading-relaxed">
              Do you want to pay <span className="font-black">KES {pendingTx?.amount.toLocaleString()}</span> to <span className="font-bold">MSMS Escrow</span> for account {pendingTx?.item?.grade} ({pendingTx?.item?.qty}kg)?
            </p>
            <div>
              <input 
                type="password" 
                placeholder="Enter M-PESA PIN" 
                className="w-full text-center tracking-[0.5em] font-black text-xl bg-gray-50 border-2 border-gray-200 rounded-xl py-3 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                maxLength={4}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setShowMpesaModal(false)} className="py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmMpesaTransaction} className="py-3 font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">OK</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- LAYOUT & NAVIGATION ---
  if (!user) return <AuthView />;

  // Adjust nav items based on role
  const navItems = user.role === 'admin' ? [
    { id: 'admin_dashboard', label: 'Admin Panel', icon: ShieldAlert },
    { id: 'dashboard', label: 'Intelligence', icon: TrendingUp },
    { id: 'marketplace', label: 'Market', icon: ShoppingCart },
  ] : [
    { id: 'dashboard', label: 'Intelligence', icon: TrendingUp },
    { id: 'marketplace', label: 'Market', icon: ShoppingCart },
    { id: 'training', label: 'Learn', icon: BookOpen },
    { id: 'wallet', label: 'Escrow', icon: Wallet },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900 overflow-hidden">
      <MpesaModal />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <div className="bg-green-600 p-2.5 rounded-xl shadow-sm">
              <Leaf size={24} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-gray-800 tracking-tight leading-none block">MiraaLink</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Smart Market System</span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Menu</p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold ${
                    isActive ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-green-600' : ''} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 m-4 bg-gray-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-black">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
              <LogOut size={18} />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-1.5 rounded-lg">
                <Leaf size={18} className="text-white" />
              </div>
              <span className="text-lg font-black text-gray-800 tracking-tight">MiraaLink</span>
            </div>
            <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <LogOut size={14} />
            </button>
          </header>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'admin_dashboard' && <AdminDashboardView />}
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'marketplace' && <MarketplaceView />}
            {activeTab === 'training' && <TrainingView />}
            {activeTab === 'wallet' && <WalletView />}
          </div>
        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe flex justify-around items-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] h-20">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors relative ${
                  isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-600 rounded-b-full"></div>}
                <Icon size={24} className={isActive ? 'text-green-600 mt-1' : 'mt-1'} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

    </div>
  );
}