import React from 'react';
import { Menu, Search, Bell, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick }) {
  const { logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* Left: Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Toggle menu"
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        {/* Center: Logo/Brand (Mobile) */}
        <div className="md:hidden flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-black text-gray-800 text-sm">MiraaLink</span>
        </div>

        {/* Spacer for mobile */}
        <div className="md:hidden w-10"></div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search (desktop only) */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none w-40"
            />
          </div>

          {/* Notifications */}
          <button className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400">
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Language/Region */}
          <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400">
            <Globe size={20} className="text-gray-700" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Logout"
          >
            <LogOut size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
