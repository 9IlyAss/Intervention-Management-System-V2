import React from 'react';

function SelectRequest({ 
  pendingRequests, 
  selectedRequest, 
  handleRequestSelect, 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus,
  handleNextStep
}) {
  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch = request.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          request.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request._id.includes(searchQuery);
    
    const matchesFilter = filterStatus === 'All' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Format MongoDB ObjectId to be more readable
  const formatRequestId = (id) => {
    return id.slice(-6).toUpperCase();
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Step 1: Select a Service Request
        </h2>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search requests by client name, issue or ID..."
              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            className="bg-white border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Problematic">Problematic</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(request => (
              <div 
                key={request._id} 
                className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md
                  ${selectedRequest?._id === request._id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'}
                `}
                onClick={() => handleRequestSelect(request)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                    #{formatRequestId(request._id)}
                  </span>
                  <div className="flex space-x-1">
                    <span className={`text-xs px-2 py-1 rounded
                      ${request.status === 'Pending' ? 'bg-amber-100 text-amber-800' : ''}
                      ${request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                      ${request.status === 'Problematic' ? 'bg-red-100 text-red-800' : ''}
                      ${request.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                      ${request.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {request.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded
                      ${request.priority === 'High' ? 'bg-red-100 text-red-800' : ''}
                      ${request.priority === 'Normal' ? 'bg-blue-100 text-blue-800' : ''}
                      ${request.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {request.priority}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-800 mb-1">{request.clientName}</h3>
                <p className="text-sm text-gray-600 mb-3">{request.issue}</p>
                
                <div className="flex items-center mb-2 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {request.clientEmail}
                </div>
                
                <div className="flex items-center mb-2 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {request.clientPhone}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(request.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {request.location}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600">No requests found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
        <button
          onClick={handleNextStep}
          disabled={!selectedRequest}
          className={`py-2 px-6 rounded-lg font-medium transition-colors
            ${selectedRequest
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          Continue to Select Technician
        </button>
      </div>
    </div>
  );
}

export default SelectRequest;