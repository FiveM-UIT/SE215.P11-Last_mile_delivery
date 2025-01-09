import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTruck, FaLock } from 'react-icons/fa';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-reset-token/${token}`);
        if (!response.ok) {
          setIsValidToken(false);
          setStatus({
            type: 'error',
            message: 'Invalid or expired reset token'
          });
        }
      } catch (error) {
        setIsValidToken(false);
        setStatus({
          type: 'error',
          message: 'Error verifying reset token'
        });
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Password successfully reset'
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
        message: 'Error resetting password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-50 via-white to-primary-100">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600">Invalid Reset Link</h2>
          <p className="mt-2 text-gray-600">This password reset link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

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
            Set New Password
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {status.message && (
            <div className={`${
              status.type === 'error' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
            } border-l-4 p-4 rounded-xl animate-fade-in`} role="alert">
              <p className={`text-sm ${
                status.type === 'error' ? 'text-red-700' : 'text-green-700'
              }`}>{status.message}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 hover:bg-white transition-all duration-200"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-6 text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 