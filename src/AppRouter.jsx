import React, { useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Leaf, TrendingUp, ShoppingCart, BookOpen, Wallet, User, Settings, X, Package, PlusCircle } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import OrdersPage from './pages/OrdersPage';
import TrainingPage from './pages/TrainingPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BuyerOrderHistoryPage from './pages/BuyerOrderHistoryPage';
import ListProducePage from './pages/ListProducePage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Predictive', path: '/dashboard', icon: TrendingUp },
  { id: 'marketplace', label: 'Market', path: '/marketplace', icon: ShoppingCart },
  { id: 'orders', label: 'Orders', path: '/orders', icon: Package },
  { id: 'training', label: 'Learn', path: '/training', icon: BookOpen },
  { id: 'wallet', label: 'M-Pesa', path: '/wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', path: '/profile', icon: User },
];

function DesktopSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const allNavItems = [
    { id: 'dashboard', label: 'Predictive', path: '/dashboard', icon: TrendingUp },
    { id: 'marketplace', label: 'Market', path: '/marketplace', icon: ShoppingCart },
    ...(user?.role === 'FARMER' ? [{ id: 'list-produce', label: 'List Produce', path: '/marketplace/list', icon: PlusCircle }] : []),
    { id: 'orders', label: user?.role === 'BUYER' ? 'Order History' : 'Orders', path: user?.role === 'BUYER' ? '/orders/history' : '/orders', icon: Package },
    { id: 'training', label: 'Learn', path: '/training', icon: BookOpen },
    { id: 'wallet', label: 'M-Pesa', path: '/wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', path: '/profile', icon: User },
    ...(user?.role === 'ADMIN' ? [{ id: 'admin', label: 'Admin', path: '/admin/dashboard', icon: Settings }] : []),
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col shadow-sm fixed left-0 top-16 bottom-0 z-20">
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {allNavItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-500'} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
            {user?.name?.charAt(0) || 'JM'}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{user?.name || 'Joel M.'}</p>
            <p className="text-xs text-gray-500">Verified Farmer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();

  const allNavItems = [
    { id: 'dashboard', label: 'Predictive', path: '/dashboard', icon: TrendingUp },
    { id: 'marketplace', label: 'Market', path: '/marketplace', icon: ShoppingCart },
    { id: 'orders', label: 'Orders', path: '/orders', icon: Package },
    { id: 'training', label: 'Learn', path: '/training', icon: BookOpen },
    { id: 'wallet', label: 'M-Pesa', path: '/wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', path: '/profile', icon: User },
    ...(user?.role === 'ADMIN' ? [{ id: 'admin', label: 'Admin', path: '/admin/dashboard', icon: Settings }] : []),
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Leaf size={24} className="text-white" />
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">
              MiraaLink<span className="text-emerald-600">.</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {allNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-500'} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
              {user?.name?.charAt(0) || 'JM'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{user?.name || 'Joel M.'}</p>
              <p className="text-xs text-gray-500">Verified Farmer</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AppRouter() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { loading: authLoading } = useAuth();

  // Close sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Determine if we should show header and sidebar
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

  // Show loading spinner while auth is loading
  if (authLoading && !isAuthPage) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {!isAuthPage && <DesktopSidebar />}
      
      <div className="flex-1 flex flex-col h-full">
        {!isAuthPage && (
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        )}

        {!isAuthPage && (
          <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            !isAuthPage ? 'pt-16 lg:pl-64' : ''
          }`}
        >
          <div className={isAuthPage ? 'h-full' : 'p-4 md:p-8 pb-24 md:pb-8'}>
            <div className={isAuthPage ? 'h-full' : 'max-w-7xl mx-auto h-full'}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
                <Route path="/marketplace/list" element={<ProtectedRoute farmerOnly><ListProducePage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/history" element={<ProtectedRoute><BuyerOrderHistoryPage /></ProtectedRoute>} />
                <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
