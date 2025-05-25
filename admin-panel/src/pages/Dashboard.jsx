import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { requestService } from '../services/requestService';
import '../styles/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totals: {
      interventions: 0,
      clients: 0,
      technicians: 0
    },
    statusCounts: {
      completed: 0,
      inProgress: 0,
      issues: 0
    },
    timeline: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    averageRating: 0
    
  });
  
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch dashboard stats
        const dashboardStats = await requestService.getDashboardStats();
        setStats(dashboardStats);
        
        // Fetch and format recent interventions
        const interventions = await requestService.getrequests(5);
// Then map  to customize the format
    const formattedInterventions = interventions.map(intervention => ({
      _id: intervention._id,
      title: intervention.title,
      clientName: intervention.clientId?.name || null,
      technicianName: intervention.technicianId?.name || null,
      status: intervention.status,
      category :intervention.category,
      Date : intervention.createdAt
    }));
        setRecentRequests(formattedInterventions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  // Function to render the star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star} 
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
            
<div className="flex-1 pt-16 md:pt-6 md:ml-64 p-4 overflow-y-auto">
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
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Interventions */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 flex items-center transform hover:scale-105 transition-transform">
                <div className="rounded-full bg-white p-3 mr-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-100 uppercase font-medium">Total Interventions</p>
                  <p className="text-3xl font-bold text-white">{stats.totals.interventions}</p>
                </div>
              </div>
              
              {/* Total Clients & Technicians */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 flex items-center transform hover:scale-105 transition-transform">
                <div className="rounded-full bg-white p-3 mr-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-purple-100 uppercase font-medium">Total Clients & Techs</p>
                  <p className="text-3xl font-bold text-white">{stats.totals.clients} / {stats.totals.technicians}</p>
                </div>
              </div>
              
              {/* Intervention Status */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 flex items-center transform hover:scale-105 transition-transform">
                <div className="rounded-full bg-white p-3 mr-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-green-100 uppercase font-medium">Completed / In Progress / Issues</p>
                  <div className="flex space-x-2 mt-1">
                    <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                      <span className="text-xl font-bold text-white">{stats.statusCounts.completed}</span>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                      <span className="text-xl font-bold text-white">{stats.statusCounts.inProgress}</span>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                      <span className="text-xl font-bold text-white">{stats.statusCounts.issues}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Average Feedback Rating */}
              <div className="bg-orange-500 rounded-lg shadow-lg p-6 flex flex-col transform hover:scale-105 transition-transform">
                <div className="flex items-center mb-2">
                  <div className="rounded-full bg-white p-2 mr-3 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <p className="text-sm text-white uppercase font-medium">AVG. FEEDBACK RATING</p>
                </div>
                <div className="flex items-center mt-1">
                  <p className="text-3xl font-bold text-white mr-3">{stats.averageRating}</p>
                  <div className="bg-white bg-opacity-20 rounded-full px-2 py-1">
                    {renderStarRating(stats.averageRating)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Time Period Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Intervention Timeline</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 shadow-md transform hover:translate-y-1 transition-transform">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-white">Today</p>
                    <div className="rounded-full bg-white bg-opacity-30 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.timeline.today}</p>
                  <div className="mt-2 text-sm text-blue-100">
                    <span className={stats.timeline.today > 10 ? 'text-red-200' : 'text-green-200'}>
                      {stats.timeline.today > 10 ? '↑' : '↓'} {Math.abs(stats.timeline.today - 10)}% vs avg
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 shadow-md transform hover:translate-y-1 transition-transform">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-white">This Week</p>
                    <div className="rounded-full bg-white bg-opacity-30 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.timeline.thisWeek}</p>
                  <div className="mt-2 text-sm text-purple-100">
                    <span className={stats.timeline.thisWeek > 50 ? 'text-red-200' : 'text-green-200'}>
                      {stats.timeline.thisWeek > 50 ? '↑' : '↓'} {Math.abs(stats.timeline.thisWeek - 50)}% vs avg
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg p-6 shadow-md transform hover:translate-y-1 transition-transform">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-white">This Month</p>
                    <div className="rounded-full bg-white bg-opacity-30 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.timeline.thisMonth}</p>
                  <div className="mt-2 text-sm text-indigo-100">
                    <span className={stats.timeline.thisMonth > 200 ? 'text-red-200' : 'text-green-200'}>
                      {stats.timeline.thisMonth > 200 ? '↑' : '↓'} {Math.abs(stats.timeline.thisMonth - 200)}% vs avg
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Interventions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Recent Interventions</h2>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRequests && recentRequests.length > 0 ? (
                      recentRequests.map(request => (
                        <tr key={request._id || `request-${Math.random()}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{request._id ? request._id.substring(0, 6) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.clientName || 'Unknown Client'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.title || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                              ${request.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                              ${request.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                              ${!request.status ? 'bg-gray-100 text-gray-800' : ''}
                            `}>
                              {request.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.technicianName || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.category || 'General'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.Date)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No recent interventions found
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