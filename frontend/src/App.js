import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryMap from './pages/DeliveryMap';
import CustomerTracking from './pages/CustomerTracking';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ProtectedRoute from './components/ProtectedRoute';
import ShopManagement from './components/Admin/ShopManagement';
import RouteManagement from './components/Admin/RouteManagement';
import VehicleManagement from './components/Admin/VehicleManagement';
import NotFound from './components/Shared/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './contexts/AdminContext';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from './contexts/NotificationContext';
import CustomerMap from './pages/CustomerMap';

function App() {
  return (
    <NotificationProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Public Routes */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Admin Dashboard Routes */}
          <Route 
            path="/admin-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          >
            <Route path="shops" element={<ShopManagement />} />
            <Route path="routes" element={<RouteManagement />} />
            <Route path="vehicle-types" element={<VehicleManagement />} />
          </Route>

          <Route 
            path="/delivery-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['DeliveryStaff']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/delivery/map/:id" 
            element={
              <ProtectedRoute allowedRoles={['DeliveryStaff']}>
                <DeliveryMap />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/customer-tracking" 
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <CustomerTracking />
              </ProtectedRoute>
            } 
          />

          {/* Profile & Settings Routes - accessible by all authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'DeliveryStaff', 'Customer']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'DeliveryStaff', 'Customer']}>
                <Settings />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tracking/map/:routeCode" 
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <CustomerMap />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;