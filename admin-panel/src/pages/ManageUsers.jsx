import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { userService } from '../services/userService';

// Mock User Data based on your specific Mongoose model
const MOCK_USERS = [
  {
    _id: '60a1234567890123456789d1',
    name: 'Ibrahim Khalid',
    email: 'ibrahim.k@example.com',
    phone: '+212-555-1111',
    profileImage: '/images/users/ibrahim.jpg',
    role: 'administrator',
    permissionsList: ['full_access', 'assign_technician', 'manage_users', 'view_reports'],
    createdAt: '2024-12-01T10:00:00.000Z'
  },
  {
    _id: '60a1234567890123456789d2',
    name: 'Fatima Zahra',
    email: 'fatima.z@example.com',
    phone: '+212-555-2222',
    profileImage: '/images/users/fatima.jpg',
    role: 'administrator',
    permissionsList: ['assign_technician', 'view_reports'],
    createdAt: '2025-01-15T14:30:00.000Z'
  },
  {
    _id: '60a1234567890123456789b1',
    name: 'Karim Bensouda',
    email: 'karim.bensouda@example.com',
    phone: '+212-555-2468',
    profileImage: '/images/technicians/karim.jpg',
    role: 'technician',
    skillsList: ['Network', 'VPN', 'Router Configuration'],
    status: 'Available',
    assignedInterventionsList: ['61a1234567890123456789e1', '61a1234567890123456789e2'],
    createdAt: '2025-01-05T09:15:00.000Z'
  },
  {
    _id: '60a1234567890123456789b2',
    name: 'Nadia Lahlou',
    email: 'nadia.lahlou@example.com',
    phone: '+212-555-1357',
    profileImage: '/images/technicians/nadia.jpg',
    role: 'technician',
    skillsList: ['Printers', 'Hardware', 'PC Repair'],
    status: 'Unavailable',
    assignedInterventionsList: ['61a1234567890123456789e3'],
    createdAt: '2025-01-10T11:20:00.000Z'
  },
  {
    _id: '60a1234567890123456789c1',
    name: 'Omar Tazi',
    email: 'omar.t@example.com',
    phone: '+212-555-3333',
    profileImage: null,
    role: 'client',
    interventionsList: ['61a1234567890123456789e1', '61a1234567890123456789e4'],
    createdAt: '2025-02-10T11:45:00.000Z'
  }
];

// Admin permissions based on your model
const ADMIN_PERMISSIONS = ['assign_technician', 'manage_users', 'view_reports'];

// Technician skills options
const SKILL_OPTIONS = [
  'Network', 'VPN', 'Router Configuration', 'Printers', 'Hardware', 
  'PC Repair', 'Software Installation', 'Operating Systems', 'Mobile Devices', 
  'Cloud Services', 'Email Configuration', 'Database Management', 'Security'
];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Form state for creating/editing user - matches your MongoDB schema
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client',
    password: '',
    confirmPassword: '',
    // Role-specific fields
    permissionsList: [], // For administrators
    skillsList: [], // For technicians
    status: 'Available' // For technicians
  });

  useEffect(() => {
    // Simulate API fetch
    const fetchUsers = async () => {
      try {
        // In production: const response = await userService.getAllUsers();
        setTimeout(() => {
          setUsers(MOCK_USERS);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        setNotification({
          show: true,
          message: 'Failed to load users. Please try again.',
          type: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle role change - reset appropriate fields
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData(prev => {
      const newData = {
        ...prev,
        role
      };
      
      // Reset role-specific fields
      if (role === 'administrator') {
        newData.permissionsList = [];
        newData.skillsList = undefined;
        newData.status = undefined;
      } else if (role === 'technician') {
        newData.permissionsList = undefined;
        newData.skillsList = [];
        newData.status = 'Available';
      } else if (role === 'client') {
        newData.permissionsList = undefined;
        newData.skillsList = undefined;
        newData.status = undefined;
      }
      
      return newData;
    });
  };

  // Handle admin permission checkbox changes
  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      if (!prev.permissionsList) return prev;
      
      if (prev.permissionsList.includes(permission)) {
        return {
          ...prev,
          permissionsList: prev.permissionsList.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissionsList: [...prev.permissionsList, permission]
        };
      }
    });
  };

  // Handle technician skill selection
  const handleSkillChange = (skill) => {
    setFormData(prev => {
      if (!prev.skillsList) return prev;
      
      if (prev.skillsList.includes(skill)) {
        return {
          ...prev,
          skillsList: prev.skillsList.filter(s => s !== skill)
        };
      } else {
        return {
          ...prev,
          skillsList: [...prev.skillsList, skill]
        };
      }
    });
  };

  // Handle technician status change
  const handleStatusChange = (e) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.value
    }));
  };

  // Edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    
    // Initialize form data based on user role
    const formInitData = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
      confirmPassword: '',
    };
    
    // Add role-specific fields
    if (user.role === 'administrator') {
      formInitData.permissionsList = user.permissionsList || [];
    } else if (user.role === 'technician') {
      formInitData.skillsList = user.skillsList || [];
      formInitData.status = user.status || 'Available';
    }
    
    setFormData(formInitData);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  // Create new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'client',
      password: '',
      confirmPassword: '',
      permissionsList: [],
      skillsList: [],
      status: 'Available'
    });
    setIsEditing(false);
    setShowCreateModal(true);
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        // In production: await userService.deleteUser(userId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update UI
        setUsers(users.filter(user => user._id !== userId));
        showNotification('User deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Save user (create or update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.role || !formData.phone) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }
    
    if (!isEditing && (!formData.password || formData.password.length < 8)) {
      showNotification('Password must be at least 8 characters', 'warning');
      return;
    }
    
    if (!isEditing && formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      
      // Remove confirmPassword before sending to API
      const userData = { ...formData };
      delete userData.confirmPassword;
      
      // Only include role-specific fields
      if (userData.role !== 'administrator') {
        delete userData.permissionsList;
      }
      
      if (userData.role !== 'technician') {
        delete userData.skillsList;
        delete userData.status;
      }
      
      if (isEditing) {
        // Update existing user
        // In production: await userService.updateUser(selectedUser._id, userData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update UI
        setUsers(users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, ...userData } 
            : user
        ));
        
        showNotification('User updated successfully', 'success');
      } else {
        // Create new user
        // In production: const newUser = await userService.createUser(userData);
        
        // Simulate API call and new user creation
        await new Promise(resolve => setTimeout(resolve, 800));
        const newUser = {
          _id: 'new_' + Date.now(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        
        // Update UI
        setUsers([...users, newUser]);
        
        showNotification('User created successfully', 'success');
      }
      
      // Close modal
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification('Failed to save user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'administrator':
        return 'bg-purple-100 text-purple-800';
      case 'technician':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get technician status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-6 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg shadow-sm mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
              <p className="text-gray-600">Create, edit and manage user accounts</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </button>
          </div>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-md flex items-center border-l-4 shadow-sm animate-fadeIn
            ${notification.type === 'success' ? 'bg-green-50 border-l-green-500 text-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-l-red-500 text-red-800' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 border-l-yellow-500 text-yellow-800' : ''}
          `}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-3
                ${notification.type === 'success' ? 'text-green-500' : ''}
                ${notification.type === 'error' ? 'text-red-500' : ''}
                ${notification.type === 'warning' ? 'text-yellow-500' : ''}
              `} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {notification.type === 'success' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {notification.type === 'error' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {notification.type === 'warning' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
            </svg>
            <div>
              <span className="font-medium">{notification.type === 'success' ? 'Success: ' : notification.type === 'error' ? 'Error: ' : 'Note: '}</span>
              {notification.message}
            </div>
          </div>
        )}
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search users by name, email or phone..."
              className="w-full bg-white border border-gray-200 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            className="bg-white border border-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="administrator">Administrators</option>
            <option value="technician">Technicians</option>
            <option value="client">Clients</option>
          </select>
        </div>
        
        {/* Users Table */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profileImage ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={user.profileImage} alt={user.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                                {getInitials(user.name)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        {user.role === 'technician' && user.status && (
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                            {user.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'administrator' && user.permissionsList && (
                          <div className="flex flex-wrap gap-1">
                            {user.permissionsList.map((permission, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {permission.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {user.role === 'technician' && user.skillsList && (
                          <div className="flex flex-wrap gap-1">
                            {user.skillsList.map((skill, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {user.role === 'client' && (
                          <span className="text-sm text-gray-500">
                            {user.interventionsList ? `${user.interventionsList.length} interventions` : 'No interventions'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600">No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Create/Edit User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit User' : 'Create New User'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="administrator">Administrator</option>
                    <option value="technician">Technician</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                
                {/* Password - only required for new users */}
                {!isEditing && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!isEditing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!isEditing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                
                {/* Password field for editing users - optional */}
                {isEditing && (
                  <div className="md:col-span-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password (leave empty to keep current)
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Only fill this if you want to change the password</p>
                  </div>
                )}
              </div>
              
              {/* Role-specific fields */}
              {formData.role === 'administrator' && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Administrator Permissions</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                    {ADMIN_PERMISSIONS.map((permission, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`permission-${permission}`}
                          checked={formData.permissionsList?.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-700">
                          {permission.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select permissions for this administrator</p>
                </div>
              )}
              
              {formData.role === 'technician' && (
                <div className="mb-6 space-y-4">
                  {/* Technician Status */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technician Status</h4>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="status-available"
                          name="status"
                          value="Available"
                          checked={formData.status === 'Available'}
                          onChange={handleStatusChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <label htmlFor="status-available" className="ml-2 block text-sm text-gray-700">
                          Available
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="status-unavailable"
                          name="status"
                          value="Unavailable"
                          checked={formData.status === 'Unavailable'}
                          onChange={handleStatusChange}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <label htmlFor="status-unavailable" className="ml-2 block text-sm text-gray-700">
                          Unavailable
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Technician Skills */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technician Skills</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                      <div className="grid grid-cols-2 gap-2">
                        {SKILL_OPTIONS.map((skill, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`skill-${index}`}
                              checked={formData.skillsList?.includes(skill)}
                              onChange={() => handleSkillChange(skill)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`skill-${index}`} className="ml-2 block text-sm text-gray-700">
                              {skill}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select skills for this technician</p>
                  </div>
                </div>
              )}
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;