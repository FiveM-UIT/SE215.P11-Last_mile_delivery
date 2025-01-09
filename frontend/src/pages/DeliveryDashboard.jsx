import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import Header from '../components/Shared/Header';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiTruck, FiClock, FiPackage, FiUser, FiMail, FiPhone, FiCheckCircle, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [assignedRoutes, setAssignedRoutes] = useState([]);
  const [pendingRoutes, setPendingRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState({ assigned: 1, pending: 1 });
  const [itemsPerPage] = useState(5);
  const [currentTab, setCurrentTab] = useState('assigned');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo) {
      fetchRoutes();
    }
  }, [userInfo]);

  const fetchUserInfo = async () => {
    try {
      const response = await mockService.getUserProfile();
      if (response.success) {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      toast.error('Failed to load user information');
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await mockService.getRoutes();
      if (response.success) {
        // Phân loại routes
        const assigned = response.data.filter(route => 
          route.delivery_staff_id?._id === userInfo._id
        );
        const pending = response.data.filter(route => 
          route.status === 'pending'
        );

        setAssignedRoutes(assigned);
        setPendingRoutes(pending);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRoute = async (routeId) => {
    try {
      const response = await mockService.claimRoute(routeId, userInfo._id);
      if (response.success) {
        toast.success('Route claimed successfully');
        fetchRoutes();
      }
    } catch (error) {
      console.error('Error claiming route:', error);
      toast.error(error.message || 'Failed to claim route');
    }
  };

  const handleStatusChange = async (routeId, currentStatus) => {
    try {
      let newStatus;
      if (currentStatus === 'assigned') {
        newStatus = 'delivering';
      } else if (currentStatus === 'delivering') {
        const result = await Swal.fire({
          title: 'Complete Delivery',
          text: 'Was the delivery successful?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#10B981',
          cancelButtonColor: '#EF4444',
          confirmButtonText: 'Yes, Delivered',
          cancelButtonText: 'No, Failed',
          reverseButtons: true
        });

        if (result.isConfirmed) {
          newStatus = 'delivered';
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          newStatus = 'failed';
        } else {
          return;
        }
      }

      if (newStatus) {
        const response = await mockService.updateRouteStatus(routeId, newStatus);
        if (response.success) {
          toast.success(`Route status updated to ${newStatus}`);
          fetchRoutes();
        }
      }
    } catch (error) {
      console.error('Error updating route status:', error);
      toast.error(error.message || 'Failed to update route status');
    }
  };

  const getStatistics = () => {
    return {
      total: assignedRoutes.length,
      delivering: assignedRoutes.filter(r => r.status === 'delivering').length,
      completed: assignedRoutes.filter(r => r.status === 'delivered').length,
      failed: assignedRoutes.filter(r => r.status === 'failed').length
    };
  };

  const stats = getStatistics();

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('500', '100')}`}>
          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${color.replace('border-l-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  );

  const RouteCard = ({ route, type }) => {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border-l-4 transition-all duration-300
          ${type === 'assigned' ? 'border-l-blue-500' : 'border-l-yellow-500'}
          hover:shadow-md relative overflow-hidden`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{route.route_code}</h3>
              <StatusBadge status={route.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <FiTruck className="mr-2 text-blue-500" />
                <span>{route.vehicle_type}</span>
              </div>
              <div className="flex items-center">
                <FiMapPin className="mr-2 text-blue-500" />
                <span>{route.distance.toFixed(2)} km</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            {type === 'pending' ? (
              <ClaimButton route={route} />
            ) : (
              <RouteActions route={route} />
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center mb-3">
            <FiPackage className="text-blue-500 mr-2" />
            <span className="font-medium text-gray-700">Delivery Sequence</span>
          </div>
          <DeliverySequence shops={route.shops} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center">
            <FiClock className="mr-2 text-blue-500" />
            <span className="text-xs sm:text-sm">
              Assigned: {new Date(route.assigned_at).toLocaleString()}
            </span>
          </div>
          {route.status === 'delivering' && (
            <ViewMapButton routeId={route._id} />
          )}
        </div>
      </motion.div>
    );
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 border-blue-200',
      delivering: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const DeliverySequence = ({ shops }) => (
    <div className="space-y-3">
      {shops.map((shop, index) => (
        <div key={shop.shop_id} className="flex items-start space-x-3 group">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
            {index + 1}
          </div>
          <div className="flex-grow">
            <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
              {shop.shop_name}
            </div>
            {index < shops.length - 1 && (
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <motion.svg 
                  className="w-4 h-4 mr-1 text-blue-500"
                  initial={{ y: 0 }}
                  animate={{ y: [0, 2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </motion.svg>
                Next Stop
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const getPaginatedRoutes = (routes, type) => {
    const indexOfLastItem = currentPage[type] * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return routes.slice(indexOfFirstItem, indexOfLastItem);
  };

  const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, type }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center space-x-2 mt-4 pb-2">
        <button
          onClick={() => onPageChange(type, Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          Previous
        </button>
        <span className="px-3 py-1 bg-gray-50 rounded-md text-gray-600">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(type, Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  const handlePageChange = (type, pageNumber) => {
    setCurrentPage(prev => ({
      ...prev,
      [type]: pageNumber
    }));
  };

  const RouteActions = ({ route }) => {
    const navigate = useNavigate();

    const getActionButton = (status) => {
      switch (status) {
        case 'assigned':
          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusChange(route._id, status)}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 
                text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all 
                duration-300 shadow-sm hover:shadow-md flex items-center justify-center sm:justify-start space-x-2"
            >
              <span>Start Delivery</span>
              <FiTruck className="w-4 h-4" />
            </motion.button>
          );
        case 'delivering':
          return (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange(route._id, status)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                  text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all 
                  duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
              >
                <span>Complete</span>
                <FiCheckCircle className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/delivery/map/${route._id}`)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 
                  text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all 
                  duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
              >
                <span>View Map</span>
                <FiMapPin className="w-4 h-4" />
              </motion.button>
            </div>
          );
        default:
          return null;
      }
    };

    return getActionButton(route.status);
  };

  const ClaimButton = ({ route }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleClaimRoute(route._id)}
      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
        hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm
        hover:shadow-md flex items-center space-x-2"
    >
      <span>Claim Route</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </motion.button>
  );

  const ViewMapButton = ({ routeId }) => {
    const navigate = useNavigate();
    
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/delivery/map/${routeId}`)}
        className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 
          transition-colors duration-200 flex items-center space-x-1 text-sm"
      >
        <FiMapPin className="w-4 h-4" />
        <span>View Map</span>
      </motion.button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Delivery Dashboard" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
      <Header title="Delivery Dashboard" />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6"
      >
        {/* Profile Card */}
        {userInfo && (
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <div className="md:flex">
              <div className="md:flex-shrink-0 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 p-6 text-white
                relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }} />
                </div>
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3"
                  >
                    <FiUser className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-xl font-semibold">Delivery Staff</h2>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <FiUser className="text-blue-500" />
                      <div>
                        <label className="text-sm text-gray-500">Full Name</label>
                        <p className="font-medium text-gray-900">{userInfo.fullName || userInfo.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiMail className="text-blue-500" />
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="font-medium text-gray-900">{userInfo.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <FiPhone className="text-blue-500" />
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="font-medium text-gray-900">{userInfo.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiCheckCircle className="text-blue-500" />
                      <div>
                        <label className="text-sm text-gray-500">Status</label>
                        <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${userInfo.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics Section */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <StatCard
              title="Total Routes"
              value={stats.total}
              icon={FiPackage}
              color="border-l-blue-500"
            />
            <StatCard
              title="In Progress"
              value={stats.delivering}
              icon={FiTruck}
              color="border-l-yellow-500"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={FiCheckCircle}
              color="border-l-green-500"
            />
            <StatCard
              title="Failed"
              value={stats.failed}
              icon={FiX}
              color="border-l-red-500"
            />
          </div>
        </div>

        {/* Routes Grid với tabs */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
          <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8">
              <button
                className={`
                  pb-4 px-1 border-b-2 font-medium text-sm
                  ${currentTab === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                onClick={() => setCurrentTab('assigned')}
              >
                Assigned Routes ({assignedRoutes.length})
              </button>
              <button
                className={`
                  pb-4 px-1 border-b-2 font-medium text-sm
                  ${currentTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                onClick={() => setCurrentTab('pending')}
              >
                Available Routes ({pendingRoutes.length})
              </button>
            </nav>
          </div>

          {/* Routes List */}
          <div className="space-y-3 sm:space-y-4">
            {currentTab === 'assigned' ? (
              getPaginatedRoutes(assignedRoutes, 'assigned').map(route => (
                <RouteCard key={route._id} route={route} type="assigned" />
              ))
            ) : (
              getPaginatedRoutes(pendingRoutes, 'pending').map(route => (
                <RouteCard key={route._id} route={route} type="pending" />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 sm:mt-6">
            <Pagination
              totalItems={currentTab === 'assigned' ? assignedRoutes.length : pendingRoutes.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage[currentTab]}
              onPageChange={(_, page) => handlePageChange(currentTab, page)}
              type={currentTab}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryDashboard;
