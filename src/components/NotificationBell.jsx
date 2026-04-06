import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { getNotifications, markNotificationAsRead, getUnreadCount } from '../services/api';

export default function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanel]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notifData, unreadData] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      
      setNotifications(notifData || []);
      setUnreadCount(unreadData?.count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_RECEIVED':
      case 'ORDER_APPROVED':
      case 'PAYMENT_RECEIVED':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'PAYMENT_FAILED':
      case 'ORDER_REJECTED':
        return <AlertCircle size={18} className="text-red-600" />;
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type, read) => {
    if (read) return 'bg-white hover:bg-gray-50';
    switch (type) {
      case 'ORDER_RECEIVED':
      case 'ORDER_APPROVED':
        return 'bg-emerald-50 hover:bg-emerald-100';
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'PAYMENT_FAILED':
      case 'ORDER_REJECTED':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notifDate.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-700" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={`p-4 cursor-pointer border-l-4 transition-colors ${
                      getNotificationBgColor(notification.type, notification.read)
                    } ${notification.read ? 'border-l-gray-200' : 'border-l-emerald-600'}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-emerald-600 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
