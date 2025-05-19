// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { requestService } from '../services/requestService';
import { userService } from '../services/userService';
import '../styles/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalTechnicians: 0,
    totalUsers: 0,
    completedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch statistics
        const pendingRequests = await requestService.getPendingRequestsCount();
        const totalTechnicians = await userService.getTechniciansCount();
        const totalUsers = await userService.getUsersCount();
        const completedRequests = await requestService.getCompletedRequestsCount();
        
        setStats({
          pendingRequests,
          totalTechnicians,
          totalUsers,
          completedRequests
        });
        
        // Fetch recent requests
        const recent = await requestService.getRecentRequests(5);
        setRecentRequests(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
            <button 
              className="bg-white p-2 rounded-full shadow hover:shadow-md transition-shadow"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt text-gray-500"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
            <span className="ml-3 text-lg text-gray-600">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex items-center transform hover:scale-105 transition-transform">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <i className="fas fa-clock text-purple-700 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex items-center transform hover:scale-105 transition-transform">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <i className="fas fa-user-cog text-blue-700 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">Total Technicians</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalTechnicians}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex items-center transform hover:scale-105 transition-transform">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <i className="fas fa-users text-green-700 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex items-center transform hover:scale-105 transition-transform">
                <div className="rounded-full bg-amber-100 p-3 mr-4">
                  <i className="fas fa-check-circle text-amber-700 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">Completed Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.completedRequests}</p>
                </div>
              </div>
            </div>
            
            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View All <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRequests.length > 0 ? (
                      recentRequests.map(request => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{request.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.clientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.issue}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                              ${request.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                              ${request.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-purple-600 hover:text-purple-900 mr-3">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No recent requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;