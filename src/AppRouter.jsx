import React from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Leaf, TrendingUp, ShoppingCart, BookOpen, Wallet, User, Settings } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import TrainingPage from './pages/TrainingPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Predictive', path: '/dashboard', icon: TrendingUp },
  { id: 'marketplace', label: 'Market', path: '/marketplace', icon: ShoppingCart },
  { id: 'training', label: 'Learn', path: '/training', icon: BookOpen },
  { id: 'wallet', label: 'M-Pesa', path: '/wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', path: '/profile', icon: User },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shadow-sm z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-green-600 p-2 rounded-xl">
          <Leaf size={24} className="text-white" />
        </div>
        <span className="text-xl font-black text-gray-800 tracking-tight">MiraaLink<span className="text-green-600">.</span></span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-green-600' : 'text-gray-500'} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">JM</div>
          <div>
            <p className="text-sm font-bold text-gray-800">Joel M.</p>
            <p className="text-xs text-gray-500">Verified Farmer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe pt-2 flex justify-around items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] h-16 md:hidden">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink key={item.id} to={item.path} className={`flex flex-col items-center justify-center w-16 h-full gap-1 text-[10px] font-medium ${isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon size={22} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AppRouter() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/training" element={<TrainingPage />} />
      