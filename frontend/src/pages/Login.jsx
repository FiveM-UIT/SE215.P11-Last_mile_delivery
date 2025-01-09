import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaTruck, FaEnvelope, FaPhone, FaUserCircle } from 'react-icons/fa';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Customer',
    fullName: '',
    email: '',
    phone: ''
  });
  const [notification, setNotification] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });
    
    try {
      const role = await authService.login(formData.username, formData.password);
      console.log('Login successful, role:', role);
      
      switch(role) {
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        case 'DeliveryStaff':
          navigate('/delivery-dashboard');
          break;
        case 'Customer':
          navigate('/customer-tracking');
          break;
        default:
          setNotification({ type: 'error', message: 'Invalid role received' });
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    try {
      await authService.register(formData);
      setNotification({ 
        type: 'success', 
        message: 'Registration successful! Please login.' 
      });
      setIsLoginMode(true);
      setFormData({
        ...formData,
        password: '',
        role: 'Customer'
      });
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-12 bg-white rounded-2xl shadow-xl animate-fade-in backdrop-blur-sm bg-opacity-80">
        <div className="text-center">
          <div className="flex justify-center">
            <FaTruck className="h-10 w-10 sm:h-14 sm:w-14 text-primary-600 transform hover:scale-110 transition-transform duration-300" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginMode ? 'Sign in to your account' : 'Register for a new account'}
          </p>
        </div>

        {notification.message && (
          <div 
            className={`border-l-4 p-4 rounded-lg animate-fade-in ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`} 
            role="alert"
          >
            <p className={`text-sm ${
              notification.type === 'success' 
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={isLoginMode ? handleLogin : handleRegister}>
          <div className="space-y-4 sm:space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
              </div>
              <input
                name="username"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:bg-gray-50 transition duration-200"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
              </div>
              <input
                name="password"
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:bg-gray-50 transition duration-200"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            {!isLoginMode && (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:bg-gray-50 transition duration-200"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:bg-gray-50 transition duration-200"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="block w-full pl-10 pr-3 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:bg-gray-50 transition duration-200"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative group">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-3 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:bg-gray-50 transition duration-200"
                  >
                    <option value="Customer">Customer</option>
                    <option value="DeliveryStaff">Delivery Staff</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {isLoginMode ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            {isLoginMode ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
