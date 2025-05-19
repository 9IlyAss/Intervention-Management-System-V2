// pages/AssignTechnicians.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { requestService } from '../services/requestService';
import { userService } from '../services/userService';
import '../styles/AssignTechnicians.css';

function AssignTechnicians() {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all requests and technicians
        const allRequests = await requestService.getRequestsByStatus(filterStatus);
        const allTechnicians = await userService.getTechnicians();
        
        setRequests(allRequests);
        setTechnicians(allTechnicians);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [filterStatus]);
  
  const handleAssignTechnician = async (requestId, technicianId) => {
    try {
      await requestService.assignTechnician(requestId, technicianId);
      
      // Update the requests list
      setRequests(requests.map(request => {
        if (request.id === requestId) {
          const assignedTechnician = technicians.find(tech => tech.id === technicianId);
          return {
            ...request,
            technicianId,
            technicianName: assignedTechnician ? assignedTechnician.name : 'Unknown',
            status: 'assigned'
          };
        }
        return request;
      }));
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };
  
  return (
    <div className="assign-technicians-container">
      <Sidebar />
      <div className="main-content">
        <h1>Assign Technicians</h1>
        
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>
        </div>
        
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Assigned To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-requests">No requests found.</td>
                  </tr>
                ) : (
                  requests.map(request => (
                    <tr key={request.id}>
                      <td>{request.id}</td>
                      <td>{request.clientName}</td>
                      <td>{request.issue}</td>
                      <td>
                        <span className={`priority-badge ${request.priority.toLowerCase()}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>{request.technicianName || 'Unassigned'}</td>
                      <td>
                        {request.status === 'pending' && (
                          <select
                            className="technician-select"
                            onChange={(e) => handleAssignTechnician(request.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>Select Technician</option>
                            {technicians.map(tech => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name} - {tech.specialization}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {request.status !== 'pending' && (
                          <button 
                            className="view-details-btn"
                            onClick={() => alert(`View details for request ${request.id}`)}
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignTechnicians;