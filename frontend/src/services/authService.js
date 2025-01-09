import { mockUsers } from '../mockData';

const authService = {
  login: async (username, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.username === username);
    if (user) {
      localStorage.setItem('token', 'mock-token-' + user._id);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));
      return user.role;
    }
    throw new Error('Invalid credentials');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getCurrentUserRole: () => {
    return localStorage.getItem('role');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      _id: String(mockUsers.length + 1),
      createdAt: new Date().toISOString(),
      status: 'active',
      avatar: 'https://res.cloudinary.com/dntdeq1gh/image/upload/v1735759491/avatars/default.jpg',
      ...userData
    };
    mockUsers.push(newUser);
    return {
      success: true,
      data: newUser
    };
  }
};

export default authService;
