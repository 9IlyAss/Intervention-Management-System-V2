import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { requestService } from '../services/requestService';

function AllRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await requestService.getrequests();
      setRequests(data);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.clientId.name && request.clientId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.clientId.email && request.clientId.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.title && request.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.location && request.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
const getStatusBadgeColor = (status) => {
  switch(status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'IT Services': 'bg-blue-100 text-blue-700',
      'Surveillance': 'bg-purple-100 text-purple-700',
      'Telephony': 'bg-green-100 text-green-700',
      'Printers': 'bg-orange-100 text-orange-700',
      'Software': 'bg-red-100 text-red-700',
      'Office': 'bg-cyan-100 text-cyan-700',
      'Maintenance': 'bg-slate-100 text-slate-700',
      'Alarms': 'bg-pink-100 text-pink-700',
      'Sound': 'bg-amber-100 text-amber-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };



  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Get unique categories from requests
  const categories = [...new Set(requests.map(r => r.category).filter(Boolean))];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg shadow-sm mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">All Requests</h1>
              <p className="text-gray-600">View and manage all intervention requests</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total Requests:</span>
            <span className="text-lg font-semibold text-gray-800">{filteredRequests.length}</span>
          </div>
        </div>

{/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  {/* Pending */}
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">Pending</p>
        <p className="text-2xl font-bold text-yellow-600">
          {requests.filter(r => r.status === 'Pending').length}
        </p>
      </div>
      <div className="p-3 bg-yellow-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </div>
  
  {/* In Progress */}
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">In Progress</p>
        <p className="text-2xl font-bold text-blue-600">
          {requests.filter(r => r.status === 'In Progress').length}
        </p>
      </div>
      <div className="p-3 bg-blue-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </div>
  </div>
  
  {/* Completed */}
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">Completed</p>
        <p className="text-2xl font-bold text-green-600">
          {requests.filter(r => r.status === 'Completed').length}
        </p>
      </div>
      <div className="p-3 bg-green-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </div>
  
  {/* Cancelled */}
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">Cancelled</p>
        <p className="text-2xl font-bold text-red-600">
          {requests.filter(r => r.status === 'Cancelled').length}
        </p>
      </div>
      <div className="p-3 bg-red-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>
  </div>
</div>
        
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by client name, email, issue, or location..."
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
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value)}
>
  <option value="all">All Status</option>
  <option value="Pending">Pending</option>
  <option value="In Progress">In Progress</option>
  <option value="Completed">Completed</option>
  <option value="Cancelled">Cancelled</option>
</select>
          
          <select
            className="bg-white border border-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* Requests Table */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{request._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.clientId.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{request.clientId.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.title || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(request.category)}`}>
                          {request.category || 'General'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(request.status)}`}>
                          {request.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button 
                          onClick={() => handleViewDetails(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600">No requests found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Request Details - #{selectedRequest._id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Client Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Client Information</h4>
                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRequest.clientId.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRequest.clientId.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRequest.clientId.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Request Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Request Details</h4>
                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(selectedRequest.category)}`}>
                      {selectedRequest.category || 'General'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(selectedRequest.status)}`}>
                      {selectedRequest.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRequest.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {/* Issue Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Description</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-900">
                    {selectedRequest.title || 'No description provided'}
                  </p>
                  {selectedRequest.description && selectedRequest.description !== selectedRequest.issue && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedRequest.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Assigned Technician */}
              {selectedRequest.technicianId && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Technician</h4>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-sm text-gray-900">
                      {selectedRequest.technicianId.name || 'Technician ID: ' + selectedRequest.technicianId}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllRequests;