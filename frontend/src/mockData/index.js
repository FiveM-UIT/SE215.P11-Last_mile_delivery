export const mockShops = [
  {
    _id: '1',
    shop_id: 'SHOP001',
    shop_name: 'Circle K Nguyễn Huệ',
    country_id: 'VN',
    province_id: '01',
    district_id: '001',
    ward_code: 'W001',
    street: '123 Nguyễn Huệ',
    latitude: 10.762622,
    longitude: 106.660172,
    shop_type: 'retail',
    status: 'active'
  },
  {
    _id: '2',
    shop_id: 'SHOP002',
    shop_name: 'FamilyMart Lê Lợi',
    country_id: 'VN',
    province_id: '01',
    district_id: '001',
    ward_code: 'W001',
    street: '456 Lê Lợi',
    latitude: 10.763622,
    longitude: 106.661172,
    shop_type: 'retail',
    status: 'active'
  },
  {
    _id: '3',
    shop_id: 'SHOP003',
    shop_name: 'VinMart Đồng Khởi',
    country_id: 'VN',
    province_id: '01',
    district_id: '001',
    ward_code: 'W002',
    street: '789 Đồng Khởi',
    latitude: 10.764622,
    longitude: 106.662172,
    shop_type: 'wholesale',
    status: 'inactive'
  }
];

export const mockRoutes = [
  {
    _id: '1',
    route_code: 'RT001',
    shops: [
      {
        shop_id: 'SHOP001',
        shop_name: 'Circle K Nguyễn Huệ',
        order: 1
      },
      {
        shop_id: 'SHOP002',
        shop_name: 'FamilyMart Lê Lợi',
        order: 2
      }
    ],
    vehicle_type: 'Bike',
    vehicle_type_id: 'BIKE',
    status: 'pending',
    distance: 5.2,
    delivery_staff_id: null
  },
  {
    _id: '3',
    route_code: 'RT003',
    shops: [
      {
        shop_id: 'SHOP001',
        shop_name: 'Circle K Nguyễn Huệ',
        order: 1,
        latitude: 10.762622,
        longitude: 106.660172
      },
      {
        shop_id: 'SHOP003',
        shop_name: 'VinMart Đồng Khởi',
        order: 2,
        latitude: 10.764622,
        longitude: 106.662172
      }
    ],
    vehicle_type: 'Bike',
    vehicle_type_id: 'BIKE',
    status: 'delivering',
    distance: 4.8,
    delivery_staff_id: {
      _id: "676fbc89e9df95663f54ced3",
      username: "delivery",
      fullName: "Nguyễn Hân Hoan",
      avatar: "https://res.cloudinary.com/dntdeq1gh/image/upload/v1735899336/avatars/seo1nqel37lvlamrlhwb.jpg",
      phone: "0987654321"
    },
    assigned_at: "2024-03-20T08:00:00.000Z",
    current_location: {
      latitude: 10.763622,
      longitude: 106.661172,
      updated_at: new Date().toISOString(),
      heading: 45,
      speed: 20,
      completed_stops: [1],
      next_stop: 2
    }
  },
  {
    _id: '4',
    route_code: 'RT004',
    shops: [
      {
        shop_id: 'SHOP002',
        shop_name: 'FamilyMart Lê Lợi',
        order: 1
      },
      {
        shop_id: 'SHOP001',
        shop_name: 'Circle K Nguyễn Huệ',
        order: 2
      }
    ],
    vehicle_type: 'Car',
    vehicle_type_id: 'CAR',
    status: 'delivered',
    distance: 6.3,
    delivery_staff_id: {
      _id: "676fbc89e9df95663f54ced3",
      username: "delivery",
      fullName: "Delivery Staff",
      phone: "0987654321"
    },
    assigned_at: "2024-03-19T10:00:00.000Z",
    completed_at: "2024-03-19T11:30:00.000Z"
  },
  {
    _id: '5',
    route_code: 'RT005',
    shops: [
      {
        shop_id: 'SHOP003',
        shop_name: 'VinMart Đồng Khởi',
        order: 1
      },
      {
        shop_id: 'SHOP002',
        shop_name: 'FamilyMart Lê Lợi',
        order: 2
      }
    ],
    vehicle_type: 'Bike',
    vehicle_type_id: 'BIKE',
    status: 'failed',
    distance: 3.7,
    delivery_staff_id: {
      _id: "676fbc89e9df95663f54ced3",
      username: "delivery",
      fullName: "Delivery Staff",
      phone: "0987654321"
    },
    assigned_at: "2024-03-18T14:00:00.000Z",
    completed_at: "2024-03-18T15:45:00.000Z"
  },
  {
    _id: '6',
    route_code: 'RT006',
    shops: [
      {
        shop_id: 'SHOP001',
        shop_name: 'Circle K Nguyễn Huệ',
        order: 1
      },
      {
        shop_id: 'SHOP002',
        shop_name: 'FamilyMart Lê Lợi',
        order: 2
      },
      {
        shop_id: 'SHOP003',
        shop_name: 'VinMart Đồng Khởi',
        order: 3
      }
    ],
    vehicle_type: 'Car',
    vehicle_type_id: 'CAR',
    status: 'assigned',
    distance: 8.5,
    delivery_staff_id: {
      _id: "676fbc89e9df95663f54ced3",
      username: "delivery",
      fullName: "Delivery Staff",
      phone: "0987654321"
    },
    assigned_at: "2024-03-20T09:30:00.000Z"
  }
];

export const mockVehicles = [
  {
    _id: '1',
    code: 'BIKE',
    name: 'Motorcycle',
    description: 'Standard motorcycle for delivery',
    status: 'active'
  },
  {
    _id: '2',
    code: 'CAR',
    name: 'Car',
    description: 'Standard car for larger deliveries',
    status: 'active'
  },
  {
    _id: '3',
    code: 'TRUCK',
    name: 'Truck',
    description: 'Large truck for wholesale deliveries',
    status: 'inactive'
  }
];

export const mockDeliveryStaff = [
  {
    _id: '1',
    username: 'driver1',
    fullName: 'John Driver',
    phone: '0123456789',
    avatar: "https://res.cloudinary.com/dntdeq1gh/image/upload/v1735899336/avatars/seo1nqel37lvlamrlhwb.jpg",
    status: 'active'
  },
  {
    _id: '2',
    username: 'driver2',
    fullName: 'Jane Driver',
    phone: '0987654321',
    avatar:"https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
    status: 'active'
  },
  {
    _id: '3',
    username: 'driver3',
    fullName: 'Bob Driver',
    phone: '0123498765',
    avatar:"https://res.cloudinary.com/dntdeq1gh/image/upload/v1735983567/avatars/ewyhcio7zuiqvcuoyjdv.jpg",
    status: 'inactive'
  }
];

export const mockActivities = [
  {
    _id: '1',
    type: 'CREATE',
    description: 'Created new shop SHOP001',
    performedBy: 'admin',
    timeAgo: '2 hours ago'
  },
  {
    _id: '2',
    type: 'UPDATE',
    description: 'Updated route RT001',
    performedBy: 'admin',
    timeAgo: '1 hour ago'
  },
  {
    _id: '3',
    type: 'DELETE',
    description: 'Deleted vehicle type SCOOTER',
    performedBy: 'admin',
    timeAgo: '30 minutes ago'
  }
];

export const mockProvinces = [
  {
    province_id: '01',
    name: 'Hà Nội'
  },
  {
    province_id: '79',
    name: 'TP Hồ Chí Minh'
  },
  {
    province_id: '48',
    name: 'Đà Nẵng'
  }
];

export const mockDistricts = [
  {
    district_id: '001',
    name: 'Ba Đình',
    province_id: '01'
  },
  {
    district_id: '002',
    name: 'Hoàn Kiếm',
    province_id: '01'
  },
  {
    district_id: '003',
    name: 'Quận 1',
    province_id: '79'
  }
];

export const mockWards = [
  {
    ward_code: 'W001',
    name: 'Phúc Xá',
    district_id: '001'
  },
  {
    ward_code: 'W002',
    name: 'Trúc Bạch',
    district_id: '001'
  },
  {
    ward_code: 'W003',
    name: 'Bến Nghé',
    district_id: '003'
  }
];

export const mockUsers = [
  {
    _id: "676fbc89e9df95663f54ced2",
    username: "admin",
    password: "$2b$10$L44ZGRK7I/Kp87vSo5toBeBQlkEJp5MYeQXGWgDXmPMdEweyc6LnS",
    role: "Admin",
    createdAt: "2024-12-28T08:53:29.245Z",
    avatar: "https://res.cloudinary.com/dntdeq1gh/image/upload/v1735759491/avatars/zrtqaf98gj6qkahujioh.jpg",
    email: "admin@example.com",
    fullName: "Admin User",
    phone: "0362370421",
    status: "active"
  },
  {
    _id: "676fbc89e9df95663f54ced3",
    username: "delivery",
    password: "$2b$10$L44ZGRK7I/Kp87vSo5toBeBQlkEJp5MYeQXGWgDXmPMdEweyc6LnS",
    role: "DeliveryStaff",
    createdAt: "2024-12-28T08:53:29.245Z",
    avatar: "https://res.cloudinary.com/dntdeq1gh/image/upload/v1735899336/avatars/seo1nqel37lvlamrlhwb.jpg",
    email: "staff@example.com", 
    fullName: "Delivery Staff",
    phone: "0987654321",
    status: "active"
  },
  {
    _id: "676fbc89e9df95663f54ced4",
    username: "customer",
    password: "$2b$10$L44ZGRK7I/Kp87vSo5toBeBQlkEJp5MYeQXGWgDXmPMdEweyc6LnS",
    role: "Customer",
    createdAt: "2024-12-28T08:53:29.245Z",
    avatar: "https://res.cloudinary.com/dntdeq1gh/image/upload/v1735899336/avatars/seo1nqel37lvlamrlhwb.jpg",
    email: "customer@example.com",
    fullName: "Customer User",
    phone: "0123456789",
    status: "active"
  }
]; 