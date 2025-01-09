import { useState } from 'react';
import { FaTruck, FaUser, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: nhập username, 2: nhập mật khẩu mới
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckUsername = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      console.log('Checking username:', username);
      const data = await api.checkUsername(username);
      console.log('Response:', data);

      if (data.message === 'Username verified') {
        setStep(2);
        setStatus({ type: 'success', message: 'Username verified. Please enter your new password.' });
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Username not found'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: 'Error verifying username. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.resetPassword(username, newPassword);
      
      if (data.message === 'Password successfully changed') {
        setStatus({
          type: 'success',
          message: 'Password successfully changed!'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Error resetting password'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error resetting password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-50 via-white to-primary-100 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-12 bg-white/90 rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-100 p-4 rounded-2xl">
              <FaTruck className="h-12 w-12 sm:h-16 sm:w-16 text-primary-600 transform hover:rotate-12 transition-all duration-300" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            {step === 1 ? 'Enter your username to continue' : 'Enter your new password'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={step === 1 ? handleCheckUsername : handleResetPassword}>
          {status.message && (
            <div className={`${
              status.type === 'error' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
            } border-l-4 p-4 rounded-xl animate-fade-in`} role="alert">
              <p className={`text-sm ${
                status.type === 'error' ? 'text-red-700' : 'text-green-700'
              }`}>{status.message}</p>
            </div>
          )}

          {step === 1 ? (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
              </div>
              <input
                id="username"
                type="text"
                required
                className="block w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 hover:bg-white transition-all duration-200"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 hover:bg-white transition-all duration-200"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength="6"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 hover:bg-white transition-all duration-200"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength="6"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-6 text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (step === 1 ? 'Continue' : 'Reset Password')}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm sm:text-base font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 