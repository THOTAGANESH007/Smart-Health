import React, { useState, useEffect } from 'react';
import { ChevronDown, User, LogOut, Bell, CheckCheck, Calendar, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'notifications', 'reminders'
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Get current user ID
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?._id || user?.id;
    } catch {
      return null;
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/get-all-notifications`,
        { withCredentials: true }
      );
    

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setScheduledNotifications(response.data.scheduledNotifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Get isRead status for scheduled notification
  const getScheduledNotificationReadStatus = (scheduledNotification) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return true; // Default to read if no user

    // Find the recipient entry for current user
    const recipientEntry = scheduledNotification.recipients?.find(
      (r) => r.user === currentUserId || r.user?._id === currentUserId
    );

    return recipientEntry ? recipientEntry.isRead : true;
  };

  // Calculate unread count for all notifications
  const unreadCount = 
    notifications.filter(n => !n.isRead).length +
    scheduledNotifications.filter(n => n.isSent && !getScheduledNotificationReadStatus(n)).length;

  // Format time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' year' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' month' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' day' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hour' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    return 'Just now';
  };

  // Get filtered notifications based on active tab
  const getFilteredNotifications = () => {
    let allItems = [];

    if (activeTab === 'all' || activeTab === 'notifications') {
      allItems = [
        ...allItems,
        ...notifications.map(n => ({
          ...n,
          type: 'notification',
          displayMessage: n.message,
          time: getTimeAgo(n.createdAt)
        }))
      ];
    }

    if (activeTab === 'all' || activeTab === 'reminders') {
      allItems = [
        ...allItems,
        ...scheduledNotifications
          .filter(n => n.isSent) // Only show sent scheduled notifications
          .map(n => ({
            ...n,
            type: 'reminder',
            displayMessage: n.title ? `${n.title}: ${n.message}` : n.message,
            time: getTimeAgo(n.scheduledTime || n.createdAt),
            isRead: getScheduledNotificationReadStatus(n) // Add computed isRead status
          }))
      ];
    }

    // Sort by date (most recent first)
    return allItems.sort((a, b) => {
      const dateA = new Date(a.scheduledTime || a.createdAt);
      const dateB = new Date(b.scheduledTime || b.createdAt);
      return dateB - dateA;
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
    if (!isNotificationOpen) {
      fetchNotifications(); // Refresh notifications when opening
    }
  };

  const markAsRead = async (id, type) => {
    try {
   

      // Make API call to mark as read
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/mark-read/${id}`,
        {},
        { withCredentials: true }
      );
     

      // Refresh notifications after successful update
      if (res.data.success) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Refresh to sync with server state
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Make API call to mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setScheduledNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/mark-all-read`,
        {},
        { withCredentials: true }
      );

      // Refresh notifications after successful update
      if (res.data.success) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Refresh to sync with server state
      fetchNotifications();
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signout`,
        {},
        { withCredentials: true }
      );

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

  const filteredNotifications = getFilteredNotifications();

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
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-3">
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

                      {/* Category Tabs */}
                      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setActiveTab('all')}
                          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'all'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Inbox className="w-4 h-4" />
                          <span>All</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('notifications')}
                          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'notifications'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                          <span>Alerts</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('reminders')}
                          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'reminders'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Reminders</span>
                        </button>
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-500 mt-2">Loading notifications...</p>
                        </div>
                      ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                          <div
                            key={`${notification.type}-${notification._id}`}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-2">
                                <div className="flex items-center space-x-2 mb-1">
                                  {notification.type === 'reminder' ? (
                                    <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                  ) : (
                                    <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  )}
                                  <span className={`text-xs font-medium ${
                                    notification.type === 'reminder' ? 'text-purple-600' : 'text-blue-600'
                                  }`}>
                                    {notification.type === 'reminder' ? 'Reminder' : 'Notification'}
                                  </span>
                                </div>
                                <p className={`text-sm ${
                                  !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.displayMessage}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              <button
                                onClick={() => markAsRead(notification._id, notification.type)}
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
                          {activeTab === 'all' ? (
                            <Inbox className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          ) : activeTab === 'notifications' ? (
                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          ) : (
                            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          )}
                          <p>No {activeTab === 'all' ? '' : activeTab} yet</p>
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
                    src={JSON.parse(localStorage.getItem("user"))?.profile || '/default-profile.png'}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
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