import React, { useState, useEffect, useContext } from 'react';
import { mockService } from '../../services/mockService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck, FiHash } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { AdminContext } from '../../contexts/AdminContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Swal from 'sweetalert2';

const VehicleManagement = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    status: 'active'
  });
  const { fetchStats, fetchActivities } = useContext(AdminContext);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [statusFilter, setStatusFilter] = useState('all');
  const { updateNotifications } = useNotifications();

  useEffect(() => {
    if (selectedVehicle) {
      setFormData({
        code: selectedVehicle.code,
        name: selectedVehicle.name,
        description: selectedVehicle.description || '',
        status: selectedVehicle.status
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        status: 'active'
      });
    }
  }, [selectedVehicle]);

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const response = await mockService.getVehicles();
      setVehicleTypes(response.data);
      setLoading(false);
      
      const activitiesResponse = await mockService.getNotifications();
      if (activitiesResponse.success) {
        updateNotifications(activitiesResponse.data);
      }
    } catch (err) {
      setError('Error fetching vehicle types');
      setLoading(false);
      toast.error('Failed to load vehicle types');
      console.error('Error:', err);
    }
  };

  const filteredVehicles = vehicleTypes.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredVehicles.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredVehicles.length / entriesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      code: vehicle.code,
      name: vehicle.name,
      description: vehicle.description || '',
      status: vehicle.status
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await mockService.deleteVehicle(id);
        
        if (response.success) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Vehicle type has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          await Promise.all([
            fetchVehicleTypes(),
            fetchStats(),
            fetchActivities()
          ]);
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to delete vehicle type',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: 'Processing...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      if (selectedVehicle) {
        const response = await mockService.updateVehicle(selectedVehicle._id, formData);
        if (response.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Vehicle type updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
        }
      } else {
        const response = await mockService.createVehicle(formData);
        if (response.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Vehicle type added successfully',
            timer: 1500,
            showConfirmButton: false
          });
        }
      }

      setShowAddModal(false);
      setSelectedVehicle(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        status: 'active'
      });
      
      await Promise.all([
        fetchVehicleTypes(),
        fetchStats(),
        fetchActivities()
      ]);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'Failed to update vehicle type',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleClose = () => {
    setShowAddModal(false);
    setSelectedVehicle(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      status: 'active'
    });
  };

  const getVehicleStats = () => {
    const stats = {
      total: vehicleTypes.length,
      active: vehicleTypes.filter(v => v.status === 'active').length,
      inactive: vehicleTypes.filter(v => v.status === 'inactive').length
    };
    return stats;
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Vehicle Type Management</h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Stats Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                <span className="text-sm text-gray-600">
                  Active: <span className="font-semibold text-green-600">{getVehicleStats().active}</span>
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                <span className="text-sm text-gray-600">
                  Inactive: <span className="font-semibold text-red-600">{getVehicleStats().inactive}</span>
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{getVehicleStats().total}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Filter and Search Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <div className="inline-flex rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border 
                    ${statusFilter === 'all'
                      ? 'bg-blue-50 text-blue-600 border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors duration-200`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 text-sm font-medium border-y 
                    ${statusFilter === 'active'
                      ? 'bg-green-50 text-green-600 border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors duration-200`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border 
                    ${statusFilter === 'inactive'
                      ? 'bg-red-50 text-red-600 border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors duration-200`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search vehicles..."
                className="w-full sm:max-w-xs pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setSelectedVehicle(null);
                setShowAddModal(true);
              }}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <FiPlus className="mr-2" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      ) : error ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchVehicleTypes}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        /* Vehicle Types Table */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th scope="col" className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th scope="col" className="hidden md:table-cell px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-gray-100 p-3 mb-4">
                          <FiSearch className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-600 mb-1">No vehicles found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentEntries.map((vehicle, index) => (
                    <tr 
                      key={vehicle._id}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 px-2 py-1 bg-blue-50 rounded">{vehicle.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">{vehicle.name}</span>
                          <span className="text-xs text-gray-500 md:hidden">{vehicle.description}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {vehicle.description || 'No description available'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${vehicle.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                            ${vehicle.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`
                          }></span>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="group relative p-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                            title="Edit"
                          >
                            <FiEdit2 className="h-4 w-4 text-indigo-600" />
                            <span className="absolute hidden group-hover:block -top-8 -left-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md">
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle._id)}
                            className="group relative p-1.5 rounded-lg hover:bg-red-50 transition-all duration-200"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4 text-red-600" />
                            <span className="absolute hidden group-hover:block -top-8 -left-3 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md">
                              Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Section */}
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{indexOfFirstEntry + 1}</span> to{' '}
                <span className="font-medium text-gray-900">
                  {Math.min(indexOfLastEntry, filteredVehicles.length)}
                </span> of{' '}
                <span className="font-medium text-gray-900">{filteredVehicles.length}</span> entries
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-gray-500 bg-white border border-gray-300
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    transition-all duration-200"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      type="button"
                      onClick={() => handlePageChange(index + 1)}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                        ${currentPage === index + 1
                          ? 'text-white bg-blue-600 border border-transparent hover:bg-blue-700'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        transition-all duration-200`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-gray-700 bg-white border border-gray-300
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Component */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="animate-modal-slide-down relative top-10 mx-auto p-6 w-full max-w-md shadow-2xl rounded-2xl bg-white border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedVehicle ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedVehicle 
                    ? 'Update the information of existing vehicle type' 
                    : 'Fill in the information to create a new vehicle type'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
              >
                <FiX className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Form Component */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Code
                  <span className="text-red-500 ml-1 text-lg">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all duration-200 
                      ${selectedVehicle 
                        ? 'bg-gray-50 cursor-not-allowed' 
                        : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400'
                      }`}
                    value={formData.code}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      code: e.target.value.toUpperCase()
                    })}
                    required
                    placeholder="e.g., BIKE, CAR, TRUCK"
                    style={{ textTransform: 'uppercase' }}
                    readOnly={selectedVehicle ? true : false}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">
                      <FiHash className="h-5 w-5" />
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 italic">
                  {selectedVehicle 
                    ? "Vehicle code cannot be modified after creation"
                    : "A unique identifier for the vehicle type (automatically uppercase)"}
                </p>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Name
                  <span className="text-red-500 ml-1 text-lg">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Motorcycle, Delivery Van"
                />
                <p className="mt-2 text-xs text-gray-500 italic">
                  The display name for this vehicle type
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
                  Description
                  <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Enter a detailed description of the vehicle type..."
                />
                <p className="mt-2 text-xs text-gray-500 italic">
                  Optional: Provide additional details about this vehicle type
                </p>
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    className="appearance-none w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200 bg-white cursor-pointer"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">🟢 Active</option>
                    <option value="inactive">🔴 Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 italic">
                  Set whether this vehicle type is currently active
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end items-center gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center"
                >
                  {selectedVehicle ? (
                    <>
                      <FiCheck className="mr-2" />
                      Update Vehicle
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" />
                      Add Vehicle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
