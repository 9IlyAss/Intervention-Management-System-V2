// pages/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { userService } from '../services/userService';
import '../styles/ManageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'client',
    specialization: '',
    phone: ''
  });
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await userService.getUsers(filterRole);
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [filterRole]);
  
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const addedUser = await userService.createUser(newUser);
      setUsers([...users, addedUser]);
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        email: '',
        role: 'client',
        specialization: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };
  
  return (
    <div className="manage-users-container">
      <Sidebar />
      <div className="main-content">
        <h1>Manage Users</h1>
        
        <div className="controls">
          <div className="filter-controls">
            <label htmlFor="role-filter">Filter by role:</label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="technician">Technicians</option>
              <option value="client">Clients</option>
            </select>
          </div>
          
          <button 
            className="add-user-btn"
            onClick={() => setShowAddUserModal(true)}
          >
            Add New User
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-users">No users found.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.phone}</td>
                      <td>{user.specialization || 'N/A'}</td>
                      <td className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => alert(`Edit user ${user.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add New User</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowAddUserModal(false)}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    required
                  >
                    <option value="client">Client</option>
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
                
                {newUser.role === 'technician' && (
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      type="text"
                      id="specialization"
                      value={newUser.specialization}
                      onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                    />
                  </div>
                )}
                
                <div className="modal-buttons">
                  <button type="button" onClick={() => setShowAddUserModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;