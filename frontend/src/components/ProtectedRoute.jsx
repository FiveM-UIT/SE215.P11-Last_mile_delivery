import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getCurrentUserRole();

  if (!isAuthenticated) {
    // Chưa đăng nhập -> chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Không có quyền truy cập -> chuyển về trang phù hợp với role
    switch (userRole) {
      case 'Admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'DeliveryStaff':
        return <Navigate to="/delivery-dashboard" replace />;
      case 'Customer':
        return <Navigate to="/customer-tracking" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 