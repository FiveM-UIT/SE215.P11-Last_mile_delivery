import { 
  mockShops, 
  mockRoutes, 
  mockVehicles, 
  mockDeliveryStaff,
  mockActivities,
  mockProvinces,
  mockDistricts,
  mockWards
} from '../mockData';

// Hàm helper để tạo delay giả lập API call
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // Shop services
  getShops: async (page = 1, limit = 10, search = '') => {
    await delay(500);
    let filteredShops = [...mockShops];
    
    if (search) {
      filteredShops = filteredShops.filter(shop => 
        shop.shop_name.toLowerCase().includes(search.toLowerCase()) ||
        shop.shop_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredShops.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      success: true,
      data: filteredShops.slice(start, end),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    };
  },

  // Route services
  getRoutes: async () => {
    await delay(500);
    return {
      success: true,
      data: mockRoutes
    };
  },

  // Vehicle services
  getVehicles: async () => {
    await delay(500);
    return {
      success: true,
      data: mockVehicles
    };
  },

  // Location services
  getProvinces: async () => {
    await delay(300);
    return {
      success: true,
      data: mockProvinces
    };
  },

  getDistricts: async (provinceId) => {
    await delay(300);
    const districts = mockDistricts.filter(d => d.province_id === provinceId);
    return {
      success: true,
      data: districts
    };
  },

  getWards: async (districtId) => {
    await delay(300);
    const wards = mockWards.filter(w => w.district_id === districtId);
    return {
      success: true,
      data: wards
    };
  },

  // Activity services
  getActivities: async () => {
    await delay(300);
    return {
      success: true,
      data: mockActivities
    };
  },

  // Delivery staff services
  getDeliveryStaff: async () => {
    await delay(300);
    return {
      success: true,
      data: mockDeliveryStaff
    };
  },

  // Shop CRUD operations
  createShop: async (shopData) => {
    await delay(500);
    const newShop = {
      _id: String(mockShops.length + 1),
      ...shopData
    };
    mockShops.push(newShop);
    return {
      success: true,
      data: newShop
    };
  },

  updateShop: async (id, shopData) => {
    await delay(500);
    const index = mockShops.findIndex(shop => shop._id === id);
    if (index !== -1) {
      mockShops[index] = { ...mockShops[index], ...shopData };
      return {
        success: true,
        data: mockShops[index]
      };
    }
    throw new Error('Shop not found');
  },

  deleteShop: async (id) => {
    await delay(500);
    const index = mockShops.findIndex(shop => shop._id === id);
    if (index !== -1) {
      mockShops.splice(index, 1);
      return {
        success: true
      };
    }
    throw new Error('Shop not found');
  },

  // Route CRUD operations
  createRoute: async (routeData) => {
    await delay(500);
    const newRoute = {
      _id: String(mockRoutes.length + 1),
      route_code: `RT${String(mockRoutes.length + 1).padStart(3, '0')}`,
      ...routeData,
      status: 'pending'
    };
    mockRoutes.push(newRoute);
    return {
      success: true,
      data: newRoute
    };
  },

  deleteRoute: async (id) => {
    await delay(500);
    const index = mockRoutes.findIndex(route => route._id === id);
    if (index !== -1) {
      mockRoutes.splice(index, 1);
      return {
        success: true
      };
    }
    throw new Error('Route not found');
  },

  updateRoute: async (id, routeData) => {
    await delay(500);
    const index = mockRoutes.findIndex(route => route._id === id);
    if (index !== -1) {
      mockRoutes[index] = { ...mockRoutes[index], ...routeData };
      return {
        success: true,
        data: mockRoutes[index]
      };
    }
    throw new Error('Route not found');
  },

  assignRoute: async (route_id, delivery_staff_id) => {
    await delay(500);
    const route = mockRoutes.find(r => r._id === route_id);
    const staff = mockDeliveryStaff.find(s => s._id === delivery_staff_id);
    
    if (!route || !staff) {
      throw new Error('Route or staff not found');
    }

    route.status = 'assigned';
    route.delivery_staff_id = staff;
    route.assigned_at = new Date().toISOString();

    return {
      success: true,
      data: route
    };
  },

  // Vehicle CRUD operations
  createVehicle: async (vehicleData) => {
    await delay(500);
    const newVehicle = {
      _id: String(mockVehicles.length + 1),
      ...vehicleData
    };
    mockVehicles.push(newVehicle);
    return {
      success: true,
      data: newVehicle
    };
  },

  deleteVehicle: async (id) => {
    await delay(500);
    const index = mockVehicles.findIndex(vehicle => vehicle._id === id);
    if (index !== -1) {
      mockVehicles.splice(index, 1);
      return {
        success: true
      };
    }
    throw new Error('Vehicle not found');
  },

  updateVehicle: async (id, vehicleData) => {
    await delay(500);
    const index = mockVehicles.findIndex(vehicle => vehicle._id === id);
    if (index !== -1) {
      mockVehicles[index] = { ...mockVehicles[index], ...vehicleData };
      return {
        success: true,
        data: mockVehicles[index]
      };
    }
    throw new Error('Vehicle not found');
  },

  // Thêm các services mới
  getUserProfile: async () => {
    await delay(300);
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      success: true,
      data: user
    };
  },

  getDashboardStats: async () => {
    await delay(500);
    return {
      success: true,
      data: {
        shops: mockShops.length,
        routes: mockRoutes.length,
        vehicles: mockVehicles.length,
        deliveryStaff: mockDeliveryStaff.filter(d => d.status === 'active').length
      }
    };
  },

  getNotifications: async () => {
    await delay(300);
    return {
      success: true,
      data: mockActivities
    };
  },

  claimRoute: async (routeId, staffId) => {
    await delay(500);
    const route = mockRoutes.find(r => r._id === routeId);
    const staff = mockUsers.find(u => u._id === staffId);
    
    if (!route || !staff) {
      throw new Error('Route or staff not found');
    }

    if (route.status !== 'pending') {
      throw new Error('Route is not available for claiming');
    }

    route.status = 'assigned';
    route.delivery_staff_id = staff;
    route.assigned_at = new Date().toISOString();

    return {
      success: true,
      data: route
    };
  },

  updateRouteStatus: async (routeId, newStatus) => {
    await delay(500);
    const route = mockRoutes.find(r => r._id === routeId);
    
    if (!route) {
      throw new Error('Route not found');
    }

    const validStatuses = ['pending', 'assigned', 'delivering', 'delivered', 'failed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    route.status = newStatus;
    if (newStatus === 'delivered' || newStatus === 'failed') {
      route.completed_at = new Date().toISOString();
    }

    return {
      success: true,
      data: route
    };
  },

  getRoute: async (id) => {
    await delay(500);
    const route = mockRoutes.find(r => r._id === id);
    
    if (!route) {
      throw new Error('Route not found');
    }

    // Thêm chi tiết shop cho mỗi điểm dừng
    route.shops = route.shops.map(shop => ({
      ...shop,
      shop_details: mockShops.find(s => s.shop_id === shop.shop_id)
    }));

    return {
      success: true,
      data: route
    };
  },

  getCustomerRoute: async (routeCode) => {
    await delay(500);
    const route = mockRoutes.find(r => r.route_code === routeCode);
    
    if (!route) {
      throw new Error('Route not found');
    }

    return {
      success: true,
      data: route
    };
  },

  getRouteStatus: async (routeCode) => {
    await delay(300);
    const route = mockRoutes.find(r => r.route_code === routeCode);
    
    if (!route) {
      throw new Error('Route not found');
    }

    return {
      success: true,
      data: {
        status: route.status,
        delivery_staff: route.delivery_staff_id,
        last_updated: new Date().toISOString()
      }
    };
  },

  updateProfile: async (profileData) => {
    await delay(500);
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not found');
    }

    const user = JSON.parse(userStr);
    const updatedUser = {
      ...user,
      ...profileData
    };

    // Cập nhật user trong mockUsers
    const userIndex = mockUsers.findIndex(u => u._id === user._id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser;
    }

    return {
      success: true,
      data: updatedUser
    };
  },

  submitRating: async (routeCode, ratingData) => {
    await delay(500);
    const route = mockRoutes.find(r => r.route_code === routeCode);
    
    if (!route) {
      throw new Error('Route not found');
    }

    route.rating = {
      ...ratingData,
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      data: route
    };
  },

  getDriverLocation: async (routeCode) => {
    await delay(300);
    const route = mockRoutes.find(r => r.route_code === routeCode);
    
    if (!route) {
      throw new Error('Route not found');
    }

    // Simulate random movement around current location
    const randomOffset = () => (Math.random() - 0.5) * 0.001; // About 100m
    
    route.current_location = {
      ...route.current_location,
      latitude: route.current_location.latitude + randomOffset(),
      longitude: route.current_location.longitude + randomOffset(),
      updated_at: new Date().toISOString(),
      heading: (route.current_location.heading + Math.random() * 20 - 10) % 360 // Random heading change
    };

    return {
      success: true,
      data: route.current_location
    };
  }
}; 