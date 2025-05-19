// services/userService.js
// Simulates user service that would interact with backend APIs

// Mock data for users
const MOCK_USERS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    phone: '555-1000',
    specialization: null
  },
  {
    id: 201,
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    role: 'technician',
    phone: '555-1001',
    specialization: 'Network Infrastructure'
  },
  {
    id: 202,
    name: 'Sarah Lee',
    email: 'sarah.l@example.com',
    role: 'technician',
    phone: '555-1002',
    specialization: 'Software Installation'
  },
  {
    id: 203,
    name: 'David Chen',
    email: 'david.c@example.com',
    role: 'technician',
    phone: '555-1003',
    specialization: 'Hardware Repair'
  },
  {
    id: 101,
    name: 'John Doe',
    email: 'john.d@example.com',
    role: 'client',
    phone: '555-2001',
    specialization: null
  },
  {
    id: 102,
    name: 'Jane Smith',
    email: 'jane.s@example.com',
    role: 'client',
    phone: '555-2002',
    specialization: null
  },
  {
    id: 103,
    name: 'Robert Brown',
    email: 'robert.b@example.com',
    role: 'client',
    phone: '555-2003',
    specialization: null
  },
  {
    id: 104,
    name: 'Emily Wilson',
    email: 'emily.w@example.com',
    role: 'client',
    phone: '555-2004',
    specialization: null
  },
  {
    id: 105,
    name: 'David Clark',
    email: 'david.clark@example.com',
    role: 'client',
    phone: '555-2005',
    specialization: null
  }
];

// Store mock data in localStorage for persistence during session
if (!localStorage.getItem('mock_users')) {
  localStorage.setItem('mock_users', JSON.stringify(MOCK_USERS));
}

export const userService = {
  // Get all users or filtered by role
  getUsers: async (role = 'all') => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    if (role === 'all') {
      return users;
    }
    
    return users.filter(user => user.role === role);
  },
  
  // Get technicians only
  getTechnicians: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.filter(user => user.role === 'technician');
  },
  
  // Get a specific user by ID
  getUserById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.find(user => user.id === Number(id)) || null;
  },
  
  // Create a new user
  createUser: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    const newUser = {
      id: Math.max(0, ...users.map(u => u.id)) + 1,
      ...userData
    };
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
    
    return newUser;
  },
  
  // Update a user
  updateUser: async (id, userData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    const updatedUsers = users.map(user => {
      if (user.id === Number(id)) {
        return { ...user, ...userData };
      }
      return user;
    });
    
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
    
    return updatedUsers.find(user => user.id === Number(id));
  },
  
  // Delete a user
  deleteUser: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    const updatedUsers = users.filter(user => user.id !== Number(id));
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
    
    return { success: true };
  },
  
  // Get counts for dashboard
  getTechniciansCount: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.filter(user => user.role === 'technician').length;
  },
  
  getUsersCount: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.filter(user => user.role === 'client').length;
  }
};