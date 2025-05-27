import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserTable from "../components/User-Manager/UserTable";
import UserFormModal from "../components/User-Manager/UserFormModal";
import Notification from "../components/User-Manager/Notification";
import { userService } from "../services/userService";
import { useAuth } from '../contexts/AuthContext';
import PermissionDenied from "../components/PermissionDenied";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const { currentUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "client",
    password: "",
    confirmPassword: "",
    permissionsList: [],
    skillsList: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const hasPermission = () => {
    // Check various permission structures
    const permissions = currentUser?.permissionsList || [];
    if (permissions.includes("full_access", "manage_users")) return true;
    return false;
  };

  const isAuthorized = hasPermission();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to load users. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name &&
        user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone &&
        user.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  // Edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);

    const formInitData = {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      password: "",
      confirmPassword: "",
    };

    if (user.role === "administrator") {
      formInitData.permissionsList = user.permissionsList || [];
    } else if (user.role === "technician") {
      formInitData.skillsList = user.skillsList || [];
    }

    setFormData(formInitData);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  // Create new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "client",
      password: "",
      confirmPassword: "",
      permissionsList: [],
      skillsList: [],
    });
    setIsEditing(false);
    setShowCreateModal(true);
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true);
        await userService.deleteUser(userId);
        setUsers(users.filter((user) => user._id !== userId));
        showNotification("User deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        showNotification("Failed to delete user", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Save user
  const handleSaveUser = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.phone
    ) {
      showNotification("Please fill in all required fields", "warning");
      return;
    }

    if (!isEditing && (!formData.password || formData.password.length < 8)) {
      showNotification("Password must be at least 8 characters", "warning");
      return;
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      showNotification("Passwords do not match", "warning");
      return;
    }

    try {
      setLoading(true);

      const userData = { ...formData };
      delete userData.confirmPassword;

      // Clean up role-specific fields
      if (userData.role !== "administrator") {
        delete userData.permissionsList;
      }

      if (userData.role !== "technician") {
        delete userData.skillsList;
        delete userData.status;
      }

      if (isEditing) {
        await userService.updateUser(selectedUser._id, userData);
        await fetchUsers();
        showNotification("User updated successfully", "success");
      } else {
        await userService.createUser(userData);
        await fetchUsers(); // Refresh the list to get the new user with all fields
        showNotification("User created successfully", "success");
      }

      setShowCreateModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
      showNotification("Failed to save user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
            {!isAuthorized ? (
              <div className="flex-1 ml-64">
                <PermissionDenied message="the technician assignment feature" />
              </div>
            ) : (
      <div className="flex-1 pt-16 md:pt-6 md:ml-64 p-4 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg shadow-sm mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
              <p className="text-gray-600">
                Create, edit and manage user accounts
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create User
            </button>
          </div>
        </div>

        {/* Notification */}
        <Notification
          show={notification.show}
          message={notification.message}
          type={notification.type}
        />

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search users by name, email or phone..."
              className="w-full bg-white border border-gray-200 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
        <UserTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          loading={loading}
        />
      </div>
)}
      {/* Create/Edit Modal */}
      <UserFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSaveUser}
        isEditing={isEditing}
        loading={loading}
      />
      
    </div>
  );
}

export default ManageUsers;
