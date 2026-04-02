import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import {
  Home, ShoppingCart, BookOpen, Wallet, Leaf, TrendingUp,
  MapPin, Phone, CheckCircle2, AlertCircle, PlusCircle, Video
} from 'lucide-react';

const predictiveData = [
  { day: 'Mon', actualPrice: 450, predictedPrice: 455, demandVol: 1200 },
  { day: 'Tue', actualPrice: 460, predictedPrice: 470, demandVol: 1350 },
  { day: 'Wed', actualPrice: 480, predictedPrice: 490, demandVol: 1500 },
  { day: 'Thu', actualPrice: 510, predictedPrice: 520, demandVol: 1800 },
  { day: 'Fri', actualPrice: null, predictedPrice: 550, demandVol: 2100 },
  { day: 'Sat', actualPrice: null, predictedPrice: 580, demandVol: 2400 },
  { day: 'Sun', actualPrice: null, predictedPrice: 600, demandVol: 2600 },
];

const marketListings = [
  { id: 1, grade: 'Kangeta', farmer: 'John M.', location: 'Meru Central', price: 600, qty: 50, verified: true },
  { id: 2, grade: 'Alele', farmer: 'Sarah N.', location: 'Embu', price: 350, qty: 120, verified: true },
  { id: 3, grade: 'Giza', farmer: 'Peter K.', location: 'Igembe South', price: 850, qty: 30, verified: false },
  { id: 4, grade: 'Lomboko', farmer: 'David W.', location: 'Meru North', price: 450, qty: 80, verified: true },
];

const trainingModules = [
  { id: 1, title: 'Sustainable Soil Management', type: 'Video', duration: '5 mins' },
  { id: 2, title: 'Water Conservation in Dry Seasons', type: 'Article', duration: '3 mins read' },
  { id: 3, title: 'Proper Harvesting Techniques', type: 'Video', duration: '8 mins' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Predictive Dashboard</h2>
        <p className="text-sm text-gray-500">AI-driven insights for optimal harvesting.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Current Avg Price</p>
          <h3 className="text-xl md:text-2xl font-bold text-green-700">KES 480/kg</h3>
          <p className="text-xs text-green-600 flex items-center mt-2 font-medium">
            <TrendingUp size={12} className="mr-1" /> +5% from yesterday
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Forecast (Weekend)</p>
          <h3 className="text-xl md:text-2xl font-bold text-blue-700">KES 600/kg</h3>
          <p className="text-xs text-blue-600 flex items-center mt-2 font-medium">
            <TrendingUp size={12} className="mr-1" /> High Demand Expected
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 col-span-2 md:col-span-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">AI Recommendation</p>
            <h3 className="text-lg font-bold text-gray-800">Hold harvest until Friday</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Leaf className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-md font-bold text-gray-800 mb-4">7-Day Price Forecast (KES)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Line type="monotone" dataKey="actualPrice" name="Actual Price" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="predictedPrice" name="AI Prediction" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-md font-bold text-gray-800 mb-4">Predicted Demand Volume (kg)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="demandVol" name="Market Demand" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const MarketplaceView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Marketplace</h2>
          <p className="text-sm text-gray-500">Direct buyer-seller matching.</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">List Produce</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All Grades', 'Kangeta', 'Alele', 'Giza', 'Lomboko'].map(grade => (
          <button key={grade} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium border ${grade === 'All Grades' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {grade}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {marketListings.map(item => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{item.grade}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {item.location}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-green-700">KES {item.price}</p>
                <p className="text-xs text-gray-500">per kg</p>
              </div>
            </div>
            <div className="py-3 border-y border-gray-50 my-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                  {item.farmer.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    {item.farmer}
                    {item.verified && <CheckCircle2 size={14} className="text-blue-500" />}
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">
                {item.qty} kg available
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Buy Now</button>
              <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                <Phone size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const WalletView = () => (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">M-Pesa Wallet</h2>
        <p className="text-sm text-gray-500">Secure escrow and payments.</p>
      </header>

      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="font-medium text-green-100 tracking-wider text-sm">MSMS WALLET</span>
            <div className="font-bold italic text-lg tracking-tighter">M-PESA</div>
          </div>
          <p className="text-green-100 text-sm mb-1">Available Balance</p>
          <h1 className="text-4xl font-bold mb-6 tracking-tight">KES 45,200.00</h1>
          <div className="flex gap-3">
            <button className="flex-1 bg-white text-green-700 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">Withdraw</button>
            <button className="flex-1 border border-white text-white py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">Deposit</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4 px-1">Recent Transactions</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {[
            { title: 'Payment from Peter K.', date: 'Today, 10:42 AM', amount: '+12,000', type: 'in' },
            { title: 'Withdrawal to M-Pesa', date: 'Yesterday, 4:15 PM', amount: '-5,000', type: 'out' },
            { title: 'Escrow Lock (Order #492)', date: 'Mon, 09:00 AM', amount: '8,500', type: 'pending' },
          ].map((tx, idx) => (
            <div key={idx} className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.type === 'in' ? 'bg-green-100 text-green-600' : tx.type === 'out' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  {tx.type === 'in' ? <TrendingUp size={16} /> : tx.type === 'out' ? <TrendingUp size={16} className="rotate-180" /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{tx.title}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
              </div>
              <p className={`text-sm font-bold ${tx.type === 'in' ? 'text-green-600' : tx.type === 'out' ? 'text-gray-800' : 'text-orange-500'}`}>
                {tx.type === 'in' ? '+' : tx.type === 'out' ? '-' : ''}KES {tx.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TrainingView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Training & Sustainability</h2>
        <p className="text-sm text-gray-500">Learn modern, sustainable Miraa farming techniques.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trainingModules.map(mod => (
          <div key={mod.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-200 relative flex items-center justify-center">
              <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${mod.id}&backgroundColor=10b981`} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
              {mod.type === 'Video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Video className="text-green-600 ml-1" size={24} />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${mod.type === 'Video' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {mod.type}
                </span>
                <span className="text-xs text-gray-500 font-medium">{mod.duration}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{mod.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-3 bg-green-200 text-green-700 rounded-full shrink-0">
          <Leaf size={24} />
        </div>
        <div>
          <h4 className="font-bold text-green-800">Tip of the Day</h4>
          <p className="text-sm text-green-700 mt-1">
            Applying organic mulch around the base of your Miraa trees helps retain soil moisture during dry spells, reducing the need for excessive watering and improving long-term yield.
          </p>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'dashboard', label: 'Predictive', icon: TrendingUp },
    { id: 'marketplace', label: 'Market', icon: ShoppingCart },
    { id: 'training', label: 'Learn', icon: BookOpen },
    { id: 'wallet', label: 'M-Pesa', icon: Wallet },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {!isMobile && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <div className="bg-green-600 p-2 rounded-xl">
              <Leaf size={24} className="text-white" />
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">MiraaLink<span className="text-green-600">.</span></span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isActive ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-green-600' : ''} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                JM
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Joel M.</p>
                <p className="text-xs text-gray-500">Verified Farmer</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {isMobile && (
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-1.5 rounded-lg">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="text-lg font-black text-gray-800 tracking-tight">MiraaLink<span className="text-green-600">.</span></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
              JM
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'marketplace' && <MarketplaceView />}
            {activeTab === 'training' && <TrainingView />}
            {activeTab === 'wallet' && <WalletView />}
          </div>
        </div>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe pt-2 flex justify-around items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] h-16">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                  isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-green-600' : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
