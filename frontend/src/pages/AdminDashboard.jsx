import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import { mockService } from '../services/mockService';
import { AdminContext } from '../contexts/AdminContext';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../contexts/NotificationContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    shops: 0,
    routes: 0,
    vehicles: 0,
    deliveryStaff: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const { notifications, updateNotifications } = useNotifications();
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await mockService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await mockService.getNotifications();
      if (response.success) {
        updateNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchDeliveryStaff = async () => {
    try {
      const response = await mockService.getDeliveryStaff();
      if (response.success) {
        setDeliveryStaff(response.data);
      }
    } catch (error) {
      console.error('Error fetching delivery staff:', error);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchActivities(),
      fetchDeliveryStaff()
    ]);
  }, []);

  // Expose fetchStats to child components through Context
  const contextValue = {
    stats,
    fetchStats,
    fetchActivities
  };

  // Loading state
  if (loading) {
    return (
      <AdminContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Header title="Admin Dashboard" />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </main>
          <Footer />
        </div>
      </AdminContext.Provider>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Header title="Admin Dashboard" />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </AdminContext.Provider>
    );
  }

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Helper functions for activity styling
  const getActivityIconStyle = (type) => {
    switch (type) {
      case 'CREATE': return 'bg-blue-100 text-blue-600';
      case 'UPDATE': return 'bg-green-100 text-green-600';
      case 'DELETE': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
        case 'CREATE':
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>;
            
        case 'UPDATE':
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>;
            
        case 'DELETE':
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>;
            
        default:
            return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>;
    }
  };

  const isDashboardHome = location.pathname === '/admin-dashboard';

  // Thêm hàm kiểm tra active card
  const isActiveCard = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <AdminContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header title="Admin Dashboard" />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Statistics Cards - Always show */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Shops Stats */}
            <div 
              onClick={() => navigate('/admin-dashboard/shops')}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl transition-colors duration-300 
                    ${isActiveCard('/shops') ? 'bg-blue-100' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className={`text-4xl font-bold transition-colors duration-300
                    ${isActiveCard('/shops') ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                    {stats.shops}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-xl font-semibold transition-colors duration-300
                    ${isActiveCard('/shops') ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                    Shops
                  </h3>
                  <p className="text-sm text-gray-500">Total registered stores</p>
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 transform transition-transform duration-300 origin-left
                ${isActiveCard('/shops') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
              ></div>
            </div>

            {/* Routes Stats */}
            <div 
              onClick={() => navigate('/admin-dashboard/routes')}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl transition-colors duration-300 
                    ${isActiveCard('/routes') ? 'bg-indigo-100' : 'bg-indigo-50 group-hover:bg-indigo-100'}`}>
                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <span className={`text-4xl font-bold transition-colors duration-300
                    ${isActiveCard('/routes') ? 'text-indigo-600' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                    {stats.routes}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-xl font-semibold transition-colors duration-300
                    ${isActiveCard('/routes') ? 'text-indigo-600' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                    Routes
                  </h3>
                  <p className="text-sm text-gray-500">Total delivery paths</p>
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r from-indigo-400 to-indigo-600 transform transition-transform duration-300 origin-left
                ${isActiveCard('/routes') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
              ></div>
            </div>

            {/* Vehicle Types Stats */}
            <div 
              onClick={() => navigate('/admin-dashboard/vehicle-types')}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl transition-colors duration-300 
                    ${isActiveCard('/vehicle-types') ? 'bg-purple-100' : 'bg-purple-50 group-hover:bg-purple-100'}`}>
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <span className={`text-4xl font-bold transition-colors duration-300
                    ${isActiveCard('/vehicle-types') ? 'text-purple-600' : 'text-gray-900 group-hover:text-purple-600'}`}>
                    {stats.vehicles}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-xl font-semibold transition-colors duration-300
                    ${isActiveCard('/vehicle-types') ? 'text-purple-600' : 'text-gray-900 group-hover:text-purple-600'}`}>
                    Vehicles
                  </h3>
                  <p className="text-sm text-gray-500">Total vehicle types</p>
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600 transform transition-transform duration-300 origin-left
                ${isActiveCard('/vehicle-types') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
              ></div>
            </div>
          </div>

          {/* Navigation Buttons - Always show */}
          <div className="bg-white shadow-md rounded-lg mb-6 overflow-x-auto">
            <div className="flex space-x-4 sm:space-x-8 px-4 py-2">
              <button 
                onClick={() => navigate('/admin-dashboard/shops')}
                className={`px-3 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  isActivePath('/admin-dashboard/shops') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Shops</span>
                </div>
              </button>

              <button 
                onClick={() => navigate('/admin-dashboard/routes')}
                className={`px-3 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  isActivePath('/admin-dashboard/routes') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Route</span>
                </div>
              </button>

              <button 
                onClick={() => navigate('/admin-dashboard/vehicle-types')}
                className={`px-3 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  isActivePath('/admin-dashboard/vehicle-types') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Vehicle Type</span>
                </div>
              </button>
            </div>
          </div>

          {/* Dashboard Overview - Only show on dashboard home */}
          {isDashboardHome && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Recent Activities Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 
                  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 
                  hover:scrollbar-thumb-gray-400 transition-colors duration-200">
                  {loadingActivities ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent activities</p>
                  ) : (
                    notifications.map((activity, index) => (
                      <div key={activity._id || index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center
                            ${getActivityIconStyle(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            by {activity.performedBy}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.timeAgo}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Staff List</h3>
                <div className="overflow-x-auto">
                  {loadingStaff ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"/>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"/>
                            <div className="h-3 bg-gray-200 rounded w-1/3"/>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : deliveryStaff.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No delivery staff found</p>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {deliveryStaff.map((staff) => (
                          <tr key={staff._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover" 
                                    src={staff.avatar} 
                                    alt={staff.fullName}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{staff.fullName}</div>
                                  <div className="text-sm text-gray-500">{staff.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{staff.email}</div>
                              <div className="text-sm text-gray-500">{staff.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${staff.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'}`}>
                                {staff.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(staff.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Area - Show when not on dashboard home */}
          {!isDashboardHome && (
            <div className="bg-white shadow-md rounded-lg">
              <Outlet />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </AdminContext.Provider>
  );
};

export default AdminDashboard;