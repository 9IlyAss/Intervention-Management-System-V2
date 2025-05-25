import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiBars3BottomRight } from 'react-icons/hi2';
import { IoMdClose } from 'react-icons/io';
import logo from "../assets/logo.jpg";

function Sidebar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/Requests', label: 'All Requests', icon: 'fas fa-list-alt' },
    { path: '/assign-technicians', label: 'Assign Technicians', icon: 'fas fa-user-cog' },
    { path: '/manage-users', label: 'Manage Users', icon: 'fas fa-users' },
    { path: '/support', label: 'Support', icon: 'fas fa-headset' }
  ];

  const renderMenuLinks = (onClick) => (
    <ul className="space-y-2">
      {menuItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            onClick={onClick}
            className={`flex items-center p-3 rounded-lg transition-all ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <i className={`${item.icon} mr-3`}></i>
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Top bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow-md">
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="GDS Logo" 
            className="h-8 object-contain mr-2"
          />
          <span className="text-xl font-bold">IMS</span>
        </div>
        <button onClick={toggleDrawer}>
          <HiBars3BottomRight className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-lg z-20">
        <div className="flex flex-col items-center justify-center h-28 border-b border-gray-700 p-4">
          <img 
            src={logo} 
            alt="GDS Logo" 
            className="h-16 object-contain"
          />
        </div>
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
        <nav className="mt-5 px-4">{renderMenuLinks()}</nav>
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

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed top-0 left-0 w-64 h-full bg-gray-900 text-white z-40 shadow-lg transform transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="GDS Logo" 
              className="h-8 object-contain mr-2"
            />
            <span className="text-xl font-bold">IMS</span>
          </div>
          <button onClick={toggleDrawer}>
            <IoMdClose className="h-6 w-6 text-white" />
          </button>
        </div>
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
        <nav className="p-4">{renderMenuLinks(toggleDrawer)}</nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={() => {
              toggleDrawer();
              handleLogout();
            }}
            className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-red-500 hover:text-white transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-3"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;