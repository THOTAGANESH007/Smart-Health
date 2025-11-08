import React, { useState } from 'react';
import { ChevronDown, User, LogOut, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Sample notifications - replace with actual data from your API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'Your appointment is scheduled for tomorrow at 10:00 AM',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: 2,
      message: 'Lab results are now available',
      time: '5 hours ago',
      isRead: false
    },
    {
      id: 3,
      message: 'Prescription refill approved',
      time: '1 day ago',
      isRead: true
    },
    {
      id: 4,
      message: 'New health tip: Stay hydrated!',
      time: '2 days ago',
      isRead: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signout`,
        {},
        { withCredentials: true }
      );
      console.log(response);

      if (response.statusText) {
        console.log('Logout successful');
        localStorage.removeItem("user");
        navigate('/');
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred during logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const handleProfile = () => {
    console.log('Profile clicked');
    navigate('/update-user');
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-50 to-green-50 shadow-lg">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-wide">
              SmartHealth
            </h1>
          </div>

          {/* Right Side: Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={toggleNotification}
                className="relative focus:outline-none group p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsNotificationOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-2">
                                <p className={`text-sm ${
                                  !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className={`flex-shrink-0 ${
                                  notification.isRead ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                                } transition-colors`}
                                title={notification.isRead ? 'Read' : 'Mark as read'}
                              >
                                <CheckCheck className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 focus:outline-none group"
                disabled={isLoggingOut}
              >
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white shadow-md hover:border-gray-200 transition-all">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* <ChevronDown 
                  className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                /> */}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={handleProfile}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3 text-blue-500" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-red-500" />
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;