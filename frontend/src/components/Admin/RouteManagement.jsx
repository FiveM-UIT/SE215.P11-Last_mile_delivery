import React, { useState, useEffect } from 'react';
import { mockService } from '../../services/mockService';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import AddRouteModal from './AddRouteModal';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editForm, setEditForm] = useState({
    vehicle_type_id: '',
    status: ''
  });
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await mockService.getVehicles();
        if (response.success) {
          // Lọc chỉ lấy các vehicle type có status là active
          const activeVehicleTypes = response.data.filter(type => type.status === 'active');
          setVehicleTypes(activeVehicleTypes);
        }
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
        toast.error('Failed to load vehicle types');
      }
    };

    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    const fetchDeliveryStaff = async () => {
      try {
        console.log('Fetching delivery staff...'); // Debug log

        const response = await mockService.getDeliveryStaff();
        
        console.log('Delivery staff response:', response); // Debug log

        if (response.success) {
          setDeliveryStaff(response.data);
        }
      } catch (error) {
        console.error('Error fetching delivery staff:', error);
        toast.error(error.message || 'Failed to load delivery staff');
      }
    };

    fetchDeliveryStaff();
  }, []);

  const fetchRoutes = async () => {
    try {
      console.log('Fetching routes...');
      
      const response = await mockService.getRoutes();

      console.log('Routes response:', response);

      if (response.success) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'delivering':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id, routeCode) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete route ${routeCode}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await mockService.deleteRoute(id);

        if (response.success) {
          setRoutes(prevRoutes => prevRoutes.filter(route => route._id !== id));

          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `Route ${routeCode} has been deleted.`,
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to delete route',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEdit = (route) => {
    setSelectedRoute(route);
    setEditForm({
        vehicle_type_id: route.vehicle_type_id,
        status: route.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const isVehicleTypeEditable = !['assigned', 'delivering', 'delivered', 'cancelled', 'failed'].includes(selectedRoute.status);
      if (isVehicleTypeEditable && editForm.vehicle_type_id === '') {
        toast.error('Please select a vehicle type');
        return;
      }

      const payload = {
        status: editForm.status,
        vehicle_type_id: isVehicleTypeEditable ? editForm.vehicle_type_id : selectedRoute.vehicle_type_id
      };

      console.log('Submitting edit form:', payload);

      const response = await mockService.updateRoute(selectedRoute._id, payload);

      if (response.success) {
        await fetchRoutes();

        setShowEditModal(false);
        setSelectedRoute(null);
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Route updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating route:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to update route'
      });
    }
  };

  const EditModal = () => {
    // Định nghĩa các trạng thái có thể chuyển đổi
    const getAllowedStatuses = (currentStatus) => {
        const transitions = {
            'pending': ['assigned', 'cancelled'],
            'assigned': ['delivering', 'cancelled'],
            'delivering': ['delivered', 'failed'],
            'delivered': [],
            'cancelled': [],
            'failed': ['pending']
        };
        return transitions[currentStatus] || [];
    };

    const allowedStatuses = getAllowedStatuses(selectedRoute.status);

    // Kiểm tra xem có cho phép edit vehicle type không
    const isVehicleTypeEditable = (status) => {
        const nonEditableStatuses = [
            'assigned', 'delivering', 'delivered', 
            'cancelled', 'failed'
        ];
        return !nonEditableStatuses.includes(status);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[90%] md:w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Edit Route</h3>
                    <button onClick={() => setShowEditModal(false)}>
                        <FiX className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                        <select
                            value={editForm.vehicle_type_id}
                            onChange={(e) => setEditForm({...editForm, vehicle_type_id: e.target.value})}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
                                !isVehicleTypeEditable(selectedRoute.status) ? 'bg-gray-100' : ''
                            }`}
                            disabled={!isVehicleTypeEditable(selectedRoute.status)}
                            required
                        >
                            <option value="" disabled>Select Vehicle Type</option>
                            {vehicleTypes.map((type) => (
                                <option key={type.code} value={type.code}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {vehicleTypes.length === 0 && (
                            <p className="mt-1 text-sm text-yellow-600">
                                No active vehicle types available
                            </p>
                        )}
                        {!isVehicleTypeEditable(selectedRoute.status) && (
                            <p className="mt-1 text-sm text-gray-500">
                                Vehicle type cannot be changed in {selectedRoute.status} status
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                            <option value={selectedRoute.status}>
                                {selectedRoute.status.charAt(0).toUpperCase() + selectedRoute.status.slice(1)}
                            </option>
                            {allowedStatuses.map((status) => (
                                status !== selectedRoute.status && (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                )
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  // Thêm hàm kiểm tra xem route có thể xóa không
  const isDeletable = (status) => {
    const nonDeletableStatuses = ['assigned', 'delivering', 'delivered'];
    return !nonDeletableStatuses.includes(status);
  };

  // Thêm component RouteCard cho mobile view
  const RouteCard = ({ route, onEdit, onDelete, isDeletable }) => {
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'assigned': return 'bg-purple-100 text-purple-800';
        case 'delivering': return 'bg-blue-100 text-blue-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'failed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{route.route_code}</h3>
            <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(route.status)}`}>
              {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
            </span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(route)}
              className="text-indigo-600 hover:text-indigo-900 p-1"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => isDeletable(route.status) && onDelete(route._id, route.route_code)}
              className={`p-1 ${isDeletable(route.status) ? 'text-red-600 hover:text-red-900' : 'text-gray-400'}`}
              disabled={!isDeletable(route.status)}
              title={!isDeletable(route.status) ? `Cannot delete route in ${route.status} status` : 'Delete route'}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 space-y-2 text-sm text-gray-600">
          <div className="text-sm text-gray-600 mt-2">
            <div className="font-medium mb-1">Shops:</div>
            {route.shops.map((shop, index) => (
                <div key={shop.shop_id} className="ml-2 mb-1">
                    {index + 1}. {shop.shop_name}
                    <span className="text-xs text-gray-400 ml-2">
                        ({shop.shop_id})
                    </span>
                </div>
            ))}
          </div>
          <div>
            <span className="font-medium">Vehicle Type:</span> {route.vehicle_type}
          </div>
          <div>
            <span className="font-medium">Distance:</span> {route.distance.toFixed(2)} km
          </div>
        </div>
      </div>
    );
  };

  const handleAddRoute = async (routeData) => {
    try {
        // Kiểm tra có ít nhất 2 shop
        if (!routeData.shops || routeData.shops.length < 2) {
            toast.error('At least 2 shops are required for a route');
            return;
        }

        // Format dữ liệu trước khi gửi
        const formattedData = {
            shops: routeData.shops.map((shop, index) => ({
                shop_id: shop.shop_id,
                order: index + 1  // Gán order theo thứ tự trong mảng
            })),
            vehicle_type_id: routeData.vehicle_type_id
        };

        const response = await mockService.addRoute(formattedData);

        if (response.success) {
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Route created successfully',
                timer: 1500,
                showConfirmButton: false
            });

            // Refresh routes list
            await fetchRoutes();
            setShowAddModal(false);
        }
    } catch (error) {
        console.error('Error creating route:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message || 'Failed to create route',
            confirmButtonText: 'OK'
        });
    }
  };

  const handleAssignRoute = async (route_id, delivery_staff_id) => {
    try {
      if (!route_id || !delivery_staff_id) {
        toast.error('Please select a delivery staff');
        return;
      }

      const response = await mockService.assignRoute(route_id, delivery_staff_id);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Route Assigned Successfully!',
          text: `Route has been assigned to ${response.data.delivery_staff_id.fullName || response.data.delivery_staff_id.username}`,
          showConfirmButton: false,
          timer: 1500
        });

        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning route:', error);
      Swal.fire({
        icon: 'error',
        title: 'Assignment Failed',
        text: error.message || 'Failed to assign route',
        confirmButtonText: 'OK'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-4 text-red-500">
            <h3 className="font-bold">Error loading data:</h3>
            <p>{error}</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Route Management</h2>
        
        {/* Status summary - Responsive */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 mb-4">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
            <span className="text-xs md:text-sm text-gray-600">
              Pending: {routes.filter(route => route.status === 'pending').length}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
            <span className="text-xs md:text-sm text-gray-600">
              Assigned: {routes.filter(route => route.status === 'assigned').length}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
            <span className="text-xs md:text-sm text-gray-600">
              Delivering: {routes.filter(route => route.status === 'delivering').length}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
            <span className="text-xs md:text-sm text-gray-600">
              Delivered: {routes.filter(route => route.status === 'delivered').length}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
            <span className="text-xs md:text-sm text-gray-600">
              Cancelled: {routes.filter(route => route.status === 'cancelled').length}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-500 mr-1.5"></span>
            <span className="text-xs md:text-sm text-gray-600">
              Failed: {routes.filter(route => route.status === 'failed').length}
            </span>
          </div>
        </div>

        {/* Add New Route Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Add New Route
          </button>
        </div>

        {/* Table for desktop, Cards for mobile */}
        <div className="hidden md:block"> {/* Desktop view */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shops
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance (km)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Staff
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routes.map((route) => (
                    <tr key={route._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {route.route_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {route.shops.map((shop, index) => (
                            <div key={shop.shop_id} className="mb-1">
                                {index + 1}. {shop.shop_name}
                                <span className="text-xs text-gray-400 ml-2">
                                    ({shop.shop_id})
                                </span>
                            </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.vehicle_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.distance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(route.status)}`}>
                          {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {route.status === 'pending' ? (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) { // Kiểm tra có giá trị được chọn
                                        handleAssignRoute(route._id, e.target.value);
                                    }
                                }}
                                value="" // Đặt giá trị mặc định
                                className="w-full text-sm border rounded py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" disabled>Select delivery staff...</option>
                                {deliveryStaff.map(staff => (
                                    <option 
                                        key={staff._id} 
                                        value={staff._id}
                                        disabled={staff.status === 'inactive'}
                                    >
                                        {staff.fullName || staff.username}
                                        {staff.status === 'inactive' && ' (Inactive)'}
                                        {staff.phone && ` - ${staff.phone}`}
                                    </option>
                                ))}
                            </select>
                        ) : route.delivery_staff_id ? (
                            <div>
                                <div className="font-medium">
                                    {route.delivery_staff_id.fullName || route.delivery_staff_id.username}
                                </div>
                                {route.delivery_staff_id.phone && (
                                    <div className="text-xs text-gray-500">
                                        {route.delivery_staff_id.phone}
                                    </div>
                                )}
                                {route.assigned_at && (
                                    <div className="text-xs text-gray-400">
                                        Assigned: {new Date(route.assigned_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(route)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FiEdit2 className="inline" />
                        </button>
                        <button 
                          onClick={() => isDeletable(route.status) && handleDelete(route._id, route.route_code)}
                          className={`transition-colors duration-200 ${
                            isDeletable(route.status)
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!isDeletable(route.status)}
                          title={
                            !isDeletable(route.status)
                              ? `Cannot delete route in ${route.status} status`
                              : 'Delete route'
                          }
                        >
                          <FiTrash2 className="inline w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="md:hidden"> {/* Mobile view */}
          {routes.map(route => (
            <RouteCard
              key={route._id}
              route={route}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeletable={isDeletable}
            />
          ))}
        </div>
      </div>

      {showEditModal && <EditModal />}
      {showAddModal && (
        <AddRouteModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRoute}
          vehicleTypes={vehicleTypes}
        />
      )}
    </div>
  );
};

export default RouteManagement;
