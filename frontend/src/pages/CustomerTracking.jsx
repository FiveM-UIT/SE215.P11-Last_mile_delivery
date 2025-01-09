import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPackage, FiTruck, FiMapPin, FiClock, FiPhone, FiUser, FiBox, FiMail, FiStar, FiMap } from 'react-icons/fi';
import Header from '../components/Shared/Header';
import { useNavigate } from 'react-router-dom';
import RatingDialog from '../components/Customer/RatingDialog';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    delivering: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0">
      <Icon className="w-5 h-5 text-blue-500" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

const TimelineItem = ({ date, title, status }) => (
  <div className="flex items-center space-x-4">
    <div className={`w-3 h-3 rounded-full ${
      status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
    }`} />
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      {date && (
        <p className="text-sm text-gray-500">
          {new Date(date).toLocaleString()}
        </p>
      )}
    </div>
  </div>
);

const RouteDetails = React.memo(({ route, navigate, onRate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-xl shadow-sm overflow-hidden"
  >
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2">Route {route.route_code}</h3>
          <StatusBadge status={route.status} />
        </div>
        <div className="flex space-x-2">
          {route.status === 'delivering' && (
            <button
              onClick={() => navigate(`/tracking/map/${route.route_code}`)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 
                transition-all duration-300 flex items-center space-x-2 shadow-lg hover:scale-105"
            >
              <FiMap className="w-5 h-5" />
              <span>View Map</span>
            </button>
          )}
          {route.status === 'delivered' && !route.rating && (
            <button
              onClick={onRate}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 
                transition-all duration-300 flex items-center space-x-2 shadow-lg hover:scale-105"
            >
              <FiStar className="w-5 h-5" />
              <span>Đánh giá tài xế</span>
            </button>
          )}
        </div>
        {route.rating && (
          <div className="bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${
                    star <= route.rating.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              ({route.rating.rating}/5)
            </span>
          </div>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="p-6">
      {/* Delivery Info */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-4">Delivery Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            icon={FiTruck}
            label="Vehicle Type"
            value={route.vehicle_type_id}
          />
          <InfoItem
            icon={FiMapPin}
            label="Total Distance"
            value={`${route.distance.toFixed(2)} km`}
          />
          <InfoItem
            icon={FiUser}
            label="Delivery Staff"
            value={route.delivery_staff_id?.fullName || 'Not assigned'}
          />
          <InfoItem
            icon={FiPhone}
            label="Contact"
            value={route.delivery_staff_id?.phone || 'N/A'}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-500 mb-4">Timeline</h4>
        <div className="space-y-4">
          <TimelineItem
            date={route.createdAt}
            title="Route Created"
            status="completed"
          />
          <TimelineItem
            date={route.assigned_at}
            title="Assigned to Delivery Staff"
            status={route.assigned_at ? 'completed' : 'pending'}
          />
          <TimelineItem
            date={route.status === 'delivering' ? route.updatedAt : null}
            title="Delivery Started"
            status={route.status === 'delivering' ? 'completed' : 'pending'}
          />
          {route.status === 'delivered' && (
            <TimelineItem
              date={route.updatedAt}
              title="Delivery Completed"
              status="completed"
            />
          )}
          {route.status === 'failed' && (
            <TimelineItem
              date={route.updatedAt}
              title="Delivery Failed"
              status="completed"
            />
          )}
        </div>
      </div>
    </div>
  </motion.div>
));

const StudentInfoDialog = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50"
        />
        
        {/* Dialog Container - for centering */}
        <div className="fixed inset-0 z-10">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl relative"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-xl font-semibold text-white">Project Information</h3>
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {/* Student 1 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Student 1</h4>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Full Name:</span> Trần Nhật Tân
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Student ID:</span> 22521312
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span> 22521312@gm.uit.edu.vn
                      </p>
                    </div>
                  </div>

                  {/* Student 2 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Student 2</h4>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Full Name:</span> Nguyễn Duy Vũ
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Student ID:</span> 22521693
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span> 22521693@gm.uit.edu.vn
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-gray-500 text-sm">
                    <p>Last Mile Delivery Management System</p>
                    <p>Project 1 - 2024</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )}
  </AnimatePresence>
);

const CustomerTracking = () => {
  const [routeCode, setRouteCode] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const navigate = useNavigate();

  // Poll route status every 30 seconds if route is delivering
  useEffect(() => {
    let interval;
    if (route && route.status === 'delivering') {
      interval = setInterval(fetchRouteStatus, 30000);
    }
    return () => clearInterval(interval);
  }, [route]);

  const fetchRouteStatus = async () => {
    try {
      console.log('Fetching status for route:', route.route_code);
      
      const response = await mockService.getRouteStatus(route.route_code);
      
      console.log('Status response:', response);
      
      if (response.success) {
        setRoute(prev => ({
          ...prev,
          status: response.data.status,
          delivery_staff_id: response.data.delivery_staff,
          updatedAt: response.data.last_updated
        }));
      }
    } catch (error) {
      console.error('Status fetch error:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 8) {
      setRouteCode(value);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!routeCode.trim()) return;

    setLoading(true);

    try {
      const response = await mockService.getCustomerRoute(routeCode);
      
      if (response.success) {
        setRoute(response.data);
        toast.success('Route found!');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to find route');
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      const response = await mockService.submitRating(route.route_code, ratingData);
      if (response.success) {
        setRoute(prev => ({
          ...prev,
          rating: {
            ...ratingData,
            createdAt: new Date().toISOString()
          }
        }));
        toast.success('Cảm ơn bạn đã đánh giá!');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Không thể gửi đánh giá. Vui lòng thử lại!');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50">
      <Header title="Package Tracking" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section - Enhanced & Responsive */}
        <div className="text-center mb-8 sm:mb-16 relative px-4">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 rounded-3xl blur-3xl"></div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Last Mile Delivery Tracking System
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              Track Your Package
              <span className="text-blue-600">.</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Enter your route code below to get real-time updates and detailed information about your delivery
            </p>
          </motion.div>
        </div>

        {/* Search Section - Enhanced & Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mb-8 sm:mb-16 px-4"
        >
          <div className="bg-white/80 backdrop-blur-lg p-4 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={routeCode}
                onChange={handleInputChange}
                placeholder="Enter route code (e.g., RT000001)"
                className="w-full px-4 sm:px-8 py-3 sm:py-4 pl-12 sm:pl-16 text-base sm:text-lg rounded-xl sm:rounded-2xl 
                  border-2 border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 transition-all duration-300 shadow-sm"
              />
              <FiBox className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-blue-500 w-5 sm:w-6 h-5 sm:h-6" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 sm:px-6 py-2 sm:py-3 
                  bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl 
                  hover:from-blue-700 hover:to-blue-800 transition-all duration-300 
                  disabled:opacity-50 transform hover:scale-105 flex items-center space-x-2 sm:space-x-3 
                  shadow-lg disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium hidden sm:inline">Searching...</span>
                    <span className="font-medium sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <FiSearch className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="font-medium hidden sm:inline">Track Package</span>
                    <span className="font-medium sm:hidden">Track</span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Track your delivery status, estimated time, and real-time location updates
              </p>
            </div>
          </div>
        </motion.div>

        {/* Results Section - Enhanced */}
        <div className="min-h-[500px] relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingState />
            ) : route ? (
              <RouteDetails 
                route={route} 
                navigate={navigate}
                onRate={() => setShowRatingDialog(true)}
              />
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </div>

        {/* Features Section - Enhanced & Responsive */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4"
        >
          <FeatureCard 
            icon={FiTruck}
            title="Real-time Tracking"
            description="Track your package location in real-time with our advanced GPS tracking system"
            color="blue"
          />
          <FeatureCard 
            icon={FiMapPin}
            title="Detailed Route Info"
            description="Access comprehensive information about your delivery route and all stops"
            color="indigo"
          />
          <FeatureCard 
            icon={FiClock}
            title="Live Updates"
            description="Receive instant notifications about your package status and delivery progress"
            color="purple"
          />
        </motion.div>

        {/* Footer Section - Modified */}
        <div className="mt-12 sm:mt-24 text-center px-4">
          <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Need Help Tracking Your Package?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Our customer support team is available 24/7 to assist you with any questions
            </p>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 
                transform hover:scale-105 shadow-lg text-sm sm:text-base flex items-center 
                justify-center mx-auto"
            >
              <FiUser className="w-5 h-5 mr-2" />
              <span>Contact Information</span>
            </button>
          </div>
        </div>

        {/* Add StudentInfoDialog */}
        <StudentInfoDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
        />

        <RatingDialog
          isOpen={showRatingDialog}
          onClose={() => setShowRatingDialog(false)}
          onSubmit={handleRatingSubmit}
          deliveryStaff={route?.delivery_staff_id}
        />
      </div>
    </div>
  );
};

// Enhanced Loading State
const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center h-[400px] sm:h-[500px] px-4 text-center"
  >
    <div className="relative">
      <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <FiPackage className="w-8 h-8 text-blue-600" />
      </div>
    </div>
    <p className="text-xl text-gray-700 mt-8 font-medium">Searching for your package...</p>
    <p className="text-gray-500 mt-2">This may take a few moments</p>
  </motion.div>
);

// Enhanced Empty State
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center h-[400px] sm:h-[500px] text-center px-4"
  >
    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 sm:mb-8
      relative before:absolute before:inset-0 before:bg-blue-100/50 before:rounded-full before:animate-ping before:animation-delay-200"
    >
      <FiPackage className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 relative z-10" />
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to Track</h3>
    <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
      Enter your route code above to start tracking your delivery in real-time
    </p>
  </motion.div>
);

// Enhanced Feature Card
const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colors = {
    blue: 'hover:bg-blue-50 group-hover:text-blue-600',
    indigo: 'hover:bg-indigo-50 group-hover:text-indigo-600',
    purple: 'hover:bg-purple-50 group-hover:text-purple-600'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100
        hover:shadow-xl transition-all duration-300"
    >
      <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6
        transition-colors duration-300 ${colors[color]}`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 transition-colors duration-300" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default CustomerTracking;