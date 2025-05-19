// services/requestService.js
// Simulates request service that would interact with backend APIs

// Mock data for requests
const MOCK_REQUESTS = [
  {
    id: 1,
    clientName: 'John Doe',
    clientId: 101,
    issue: 'Network connectivity issues',
    description: 'Cannot connect to WiFi network in office',
    priority: 'High',
    status: 'pending',
    createdAt: '2025-04-20T10:30:00Z',
    technicianId: null,
    technicianName: null
  },
  {
    id: 2,
    clientName: 'Jane Smith',
    clientId: 102,
    issue: 'Printer not working',
    description: 'Cannot print from any computer to the main office printer',
    priority: 'Medium',
    status: 'assigned',
    createdAt: '2025-04-19T14:45:00Z',
    technicianId: 201,
    technicianName: 'Mike Johnson'
  },
  {
    id: 3,
    clientName: 'Robert Brown',
    clientId: 103,
    issue: 'Software installation',
    description: 'Need latest version of design software installed',
    priority: 'Low',
    status: 'in-progress',
    createdAt: '2025-04-18T09:15:00Z',
    technicianId: 202,
    technicianName: 'Sarah Lee'
  },
  {
    id: 4,
    clientName: 'Emily Wilson',
    clientId: 104,
    issue: 'Email configuration',
    description: 'Cannot access company email on mobile device',
    priority: 'Medium',
    status: 'completed',
    createdAt: '2025-04-17T16:20:00Z',
    technicianId: 201,
    technicianName: 'Mike Johnson',
    completedAt: '2025-04-18T10:45:00Z'
  },
  {
    id: 5,
    clientName: 'David Clark',
    clientId: 105,
    issue: 'Hardware replacement',
    description: 'Laptop screen is cracked and needs replacement',
    priority: 'High',
    status: 'pending',
    createdAt: '2025-04-16T13:10:00Z',
    technicianId: null,
    technicianName: null
  }
];

// Store mock data in localStorage for persistence during session
if (!localStorage.getItem('mock_requests')) {
  localStorage.setItem('mock_requests', JSON.stringify(MOCK_REQUESTS));
}

export const requestService = {
  // Get all requests
  getRequests: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    return requests;
  },
  
  // Get requests filtered by status
  getRequestsByStatus: async (status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    
    if (status === 'all') {
      return requests;
    }
    
    return requests.filter(request => request.status === status);
  },
  
  // Get a specific request by ID
  getRequestById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    return requests.find(request => request.id === id) || null;
  },
  
  // Create a new request
  createRequest: async (requestData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    
    const newRequest = {
      id: Math.max(0, ...requests.map(r => r.id)) + 1,
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      technicianId: null,
      technicianName: null
    };
    
    const updatedRequests = [...requests, newRequest];
    localStorage.setItem('mock_requests', JSON.stringify(updatedRequests));
    
    return newRequest;
  },
  
  // Assign technician to a request
  assignTechnician: async (requestId, technicianId) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    const technicians = JSON.parse(localStorage.getItem('mock_users') || '[]')
      .filter(user => user.role === 'technician');
    
    const targetTechnician = technicians.find(tech => tech.id === Number(technicianId));
    
    if (!targetTechnician) {
      throw new Error('Technician not found');
    }
    
    const updatedRequests = requests.map(request => {
      if (request.id === Number(requestId)) {
        return {
          ...request,
          technicianId: Number(technicianId),
          technicianName: targetTechnician.name,
          status: 'assigned'
        };
      }
      return request;
    });
    
    localStorage.setItem('mock_requests', JSON.stringify(updatedRequests));
    
    return updatedRequests.find(request => request.id === Number(requestId));
  },
  
  // Update request status
  updateRequestStatus: async (requestId, status) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    
    const updatedRequests = requests.map(request => {
      if (request.id === Number(requestId)) {
        const updatedRequest = { ...request, status };
        
        if (status === 'completed') {
          updatedRequest.completedAt = new Date().toISOString();
        }
        
        return updatedRequest;
      }
      return request;
    });
    
    localStorage.setItem('mock_requests', JSON.stringify(updatedRequests));
    
    return updatedRequests.find(request => request.id === Number(requestId));
  },
  
  // Get counts for dashboard
  getPendingRequestsCount: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    return requests.filter(request => request.status === 'pending').length;
  },
  
  getCompletedRequestsCount: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    return requests.filter(request => request.status === 'completed').length;
  },
  
  getRecentRequests: async (limit = 5) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    
    // Sort by date (newest first) and take the first 'limit' items
    return [...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
};