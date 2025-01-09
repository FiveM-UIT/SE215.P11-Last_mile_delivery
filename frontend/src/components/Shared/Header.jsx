import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import axios from 'axios';
import { AdminContext } from '../../contexts/AdminContext';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';
import { mockService } from '../../services/mockService';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications, unreadCount, updateNotifications } = useNotifications();
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    displayRole: '',
    avatar: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await mockService.getUserProfile();
        if (response.success) {
          setUserInfo(response.data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // Kiểm tra tất cả các màn hình của customer
  const isCustomerScreen = location.pathname.includes('/customer') || 
                         location.pathname === '/settings' || 
                         location.pathname === '/profile';

  // Fetch notifications chỉ khi không phải màn hình customer
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await mockService.getNotifications();
        if (response.success) {
          updateNotifications(response.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Chỉ fetch khi không phải màn hình customer
    if (!isCustomerScreen) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isCustomerScreen]); // Thêm isCustomerScreen vào dependencies

  // Helper function để style icon theo loại activity
  const getActivityIconStyle = (type) => {
    switch (type) {
      case 'CREATE': return 'text-blue-600 bg-blue-100';
      case 'UPDATE': return 'text-green-600 bg-green-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper function để lấy icon theo loại activity
  const getActivityIcon = (type) => {
    switch (type) {
      case 'CREATE':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'UPDATE':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'DELETE':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login'; // hoặc sử dụng navigate từ react-router
  };

  const handleTitleClick = () => {
    const userRole = authService.getCurrentUserRole();
    if (userRole === 'Admin' && location.pathname.includes('/admin-dashboard')) {
      navigate('/admin-dashboard');
    }
  };

  const handleClearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Clearing notifications...'); // Debug log
      
      const response = await axios.delete('http://localhost:5000/api/activities/clear-notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response:', response.data); // Debug log
      
      if (response.data.success) {
        updateNotifications([]);
        toast.success('Notifications cleared');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error(error.message || 'Failed to clear notifications');
    }
  };

  const handleProfileClick = () => {
    const userRole = authService.getCurrentUserRole();
    let dashboardPath = '/';
    
    // Xác định đường dẫn dashboard dựa vào role
    switch (userRole) {
      case 'Admin':
        dashboardPath = '/admin-dashboard';
        break;
      case 'DeliveryStaff':
        dashboardPath = '/delivery-dashboard';
        break;
      case 'Customer':
        dashboardPath = '/customer-tracking';
        break;
      default:
        dashboardPath = '/';
    }

    navigate(dashboardPath);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo và Title */}
          <div 
            className={`flex items-center ${
              location.pathname.includes('/admin-dashboard') 
                ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' 
                : ''
            }`}
            onClick={handleTitleClick}
          >
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">GiaoHangXanh</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            {/* <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div> */}

            {/* Notification Button - Ẩn ở tất cả màn hình customer */}
            {!isCustomerScreen && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 max-h-96 overflow-y-auto"
                    style={{
                      width: isMobile ? 'calc(100vw - 2rem)' : '20rem',
                      right: isMobile ? '50%' : '0',
                      transform: isMobile ? 'translateX(50%)' : 'none'
                    }}
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <div 
                            key={notification._id || `notification-${index}`} 
                            className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconStyle(notification.type)}`}>
                                  {getActivityIcon(notification.type)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  by {notification.performedBy}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-3 focus:outline-none"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  className="h-9 w-9 rounded-full ring-2 ring-blue-500 p-0.5"
                  src={userInfo.avatar}
                  alt={userInfo.name}
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                  <p className="text-xs text-gray-500">{userInfo.displayRole}</p>
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin cá nhân
                  </a>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
