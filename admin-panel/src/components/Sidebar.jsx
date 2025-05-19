// components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is handled by the AuthContext after successful logout
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-lg z-10">
      {/* Logo and App Name */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">IMS</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold shadow-lg">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3">
            <p className="font-medium truncate">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-gray-400">{currentUser?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-5 px-4">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/" 
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-tachometer-alt mr-3"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/assign-technicians" 
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive('/assign-technicians') 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-user-cog mr-3"></i>
              <span>Assign Technicians</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/manage-users" 
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive('/manage-users') 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-users mr-3"></i>
              <span>Manage Users</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/support" 
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive('/support') 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-headset mr-3"></i>
              <span>Support</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/reports" 
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive('/reports') 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-chart-bar mr-3"></i>
              <span>Reports</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-red-500 hover:text-white transition-colors"
        >
          <i className="fas fa-sign-out-alt mr-3"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;