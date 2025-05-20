import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SelectRequest from '../components/technician-assignment/SelectRequest';
import SelectTechnician from '../components/technician-assignment/SelectTechnician';
import ConfirmAssignment from '../components/technician-assignment/ConfirmAssignment';
import { requestService } from '../services/requestService';
import { userService } from '../services/userService';
import '../styles/AssignTechnicians.css';

// Mock Data for Testing - Based on MongoDB Schema
const MOCK_REQUESTS = [
  {
    _id: '60a1234567890123456789a1',
    clientId: '60a0987654321098765432a1',
    clientName: 'Ahmed Hassan',
    clientEmail: 'ahmed.hassan@example.com',
    clientPhone: '+212-555-1234',
    issue: 'Network connectivity issues in conference room',
    status: 'Pending',
    priority: 'High',
    location: 'Main Office',
    createdAt: '2025-05-15T09:30:00.000Z',
    updatedAt: '2025-05-15T09:30:00.000Z'
  },
  {
    _id: '60a1234567890123456789a1',
    clientId: '60a0987654321098765432a1',
    clientName: 'Ahmed Hassan',
    clientEmail: 'ahmed.hassan@example.com',
    clientPhone: '+212-555-1234',
    clientprofile: "www.w3.somthing.com",
    issue: 'Network connectivity issues in conference room',
  
    location: 'Main Office',
    category: "it",

    createdAt: '2025-05-15T09:30:00.000Z',
  },
  {
    _id: '60a1234567890123456789a2',
    clientId: '60a0987654321098765432a2',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah.j@example.com',
    clientPhone: '+212-555-5678',
    issue: 'Printer not responding to print commands',
    status: 'Pending',
    priority: 'Normal',
    location: 'Finance Dept',
    createdAt: '2025-05-15T10:45:00.000Z',
    updatedAt: '2025-05-15T10:45:00.000Z'
  },
  {
    _id: '60a1234567890123456789a3',
    clientId: '60a0987654321098765432a3',
    clientName: 'Mohammed Al-Farsi',
    clientEmail: 'm.alfarsi@example.com',
    clientPhone: '+212-555-9012',
    issue: 'Email sync issues on mobile devices',
    status: 'In Progress',
    priority: 'Low',
    location: 'Remote',
    createdAt: '2025-05-16T08:15:00.000Z',
    updatedAt: '2025-05-16T09:20:00.000Z'
  }
];

const MOCK_TECHNICIANS = [
  {
    _id: '60a1234567890123456789b1',
    name: 'Karim Bensouda',
    email: 'karim.bensouda@example.com',
    phone: '+212-555-2468',
    profileImage: '/images/technicians/karim.jpg',
    specialization: 'Network Infrastructure',
    status: 'Available',
    activeAssignments: 1,
    avgrating: 4.8,
    reviewCount: 142,
    skills: ['Network', 'VPN', 'Router Configuration']
  },
  {
    _id: '60a1234567890123456789b2',
    name: 'Nadia Lahlou',
    email: 'nadia.lahlou@example.com',
    phone: '+212-555-1357',
    profileImage: '/images/technicians/nadia.jpg',
    role: 'technician',
    specialization: 'Hardware Support',
    status: 'Busy',
    activeAssignments: 2,
    rating: 4.6,
    reviewCount: 98,
    avgResponseTime: '22 min',
    skills: ['Printers', 'Hardware', 'PC Repair']
  },
  {
    _id: '60a1234567890123456789b3',
    name: 'Youssef El Mansouri',
    email: 'youssef.elmansouri@example.com',
    phone: '+212-555-3690',
    profileImage: '/images/technicians/youssef.jpg',
    role: 'technician',
    specialization: 'Software Support',
    status: 'Available',
    activeAssignments: 0,
    rating: 4.9,
    reviewCount: 156,
    avgResponseTime: '12 min',
    skills: ['Software', 'Email', 'Mobile', 'Application Troubleshooting']
  }
];

function AssignmentWizard() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Assignment details based on our MongoDB schema
  const [assignmentData, setAssignmentData] = useState({
    scheduledDate: '',
    assignmentNotes: '',
    priority: 'Normal',
    estimatedResolutionTime: '1-2 hours',
    followUpRequired: true,
    requiredEquipment: [],
    notificationsSent: {
      client: true,
      technician: true,
      manager: false
    }
  });

  useEffect(() => {
    // Simulate API fetch with mock data
    const fetchData = async () => {
      try {
        // In production, these would be actual API calls
        // const requestsResponse = await requestService.getPendingRequests();
        // const techniciansResponse = await userService.getTechnicians();
        
        // Using mock data for now
        setTimeout(() => {
          setPendingRequests(MOCK_REQUESTS);
          setTechnicians(MOCK_TECHNICIANS);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotification({
          show: true,
          message: 'Failed to load data. Please try again.',
          type: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Set default scheduled date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAssignmentData(prev => ({
      ...prev,
      scheduledDate: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    // Default priority to the request's priority
    setAssignmentData(prev => ({
      ...prev,
      priority: request.priority
    }));
  };

  const handleTechnicianSelect = (technician) => {
    setSelectedTechnician(technician);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedRequest) {
      showNotification('Please select a service request', 'warning');
      return;
    }
    
    if (currentStep === 2 && !selectedTechnician) {
      showNotification('Please select a technician', 'warning');
      return;
    }
    
    setCurrentStep(prevStep => prevStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const handleAssignmentDataChange = (field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type, checked) => {
    setAssignmentData(prev => ({
      ...prev,
      notificationsSent: {
        ...prev.notificationsSent,
        [type]: checked
      }
    }));
  };

  const handleEquipmentChange = (equipment, checked) => {
    setAssignmentData(prev => {
      const currentEquipment = [...prev.requiredEquipment];
      
      if (checked && !currentEquipment.includes(equipment)) {
        return {
          ...prev,
          requiredEquipment: [...currentEquipment, equipment]
        };
      } else if (!checked && currentEquipment.includes(equipment)) {
        return {
          ...prev,
          requiredEquipment: currentEquipment.filter(item => item !== equipment)
        };
      }
      
      return prev;
    });
  };

  const handleAssign = async () => {
    try {
      setLoading(true);
      
      // Prepare assignment data matching our MongoDB schema
      const assignmentRequestData = {
        requestId: selectedRequest._id,
        technicianId: selectedTechnician._id,
        scheduledDate: assignmentData.scheduledDate,
        assignmentNotes: assignmentData.assignmentNotes,
        priority: assignmentData.priority,
        estimatedResolutionTime: assignmentData.estimatedResolutionTime,
        followUpRequired: assignmentData.followUpRequired,
        requiredEquipment: assignmentData.requiredEquipment,
        notificationsSent: assignmentData.notificationsSent
      };
      
      // In production, this would be an actual API call
      // await requestService.assignTechnician(assignmentRequestData);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update UI - remove the assigned request from the list
      setPendingRequests(prevRequests => 
        prevRequests.filter(req => req._id !== selectedRequest._id)
      );
      
      showNotification(`Technician ${selectedTechnician.name} assigned to request #${selectedRequest._id.slice(-6)} successfully`, 'success');
      
      // Reset the wizard
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedRequest(null);
        setSelectedTechnician(null);
        
        // Reset assignment data
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        setAssignmentData({
          scheduledDate: tomorrow.toISOString().split('T')[0],
          assignmentNotes: '',
          priority: 'Normal',
          estimatedResolutionTime: '1-2 hours',
          followUpRequired: true,
          requiredEquipment: [],
          notificationsSent: {
            client: true,
            technician: true,
            manager: false
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Error assigning technician:', error);
      showNotification('Failed to assign technician. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Assign Technicians</h1>
              <p className="text-gray-600">Three-step wizard to assign technicians to service requests</p>
            </div>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center space-x-1 w-full md:w-auto">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm hidden md:inline">Select Request</span>
            </div>
            
            <div className={`w-5 h-0.5 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm hidden md:inline">Select Technician</span>
            </div>
            
            <div className={`w-5 h-0.5 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm hidden md:inline">Confirm Assignment</span>
            </div>
          </div>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-lg flex items-center border-l-4 shadow-sm animate-fadeIn
            ${notification.type === 'success' ? 'bg-green-50 border-l-green-500 text-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-l-red-500 text-red-800' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 border-l-yellow-500 text-yellow-800' : ''}
          `}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-3
                ${notification.type === 'success' ? 'text-green-500' : ''}
                ${notification.type === 'error' ? 'text-red-500' : ''}
                ${notification.type === 'warning' ? 'text-yellow-500' : ''}
              `} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {notification.type === 'success' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {notification.type === 'error' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {notification.type === 'warning' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
            </svg>
            <div>
              <span className="font-medium">{notification.type === 'success' ? 'Success: ' : notification.type === 'error' ? 'Error: ' : 'Warning: '}</span>
              {notification.message}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <span className="text-gray-700">Loading data...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Step 1: Select Request */}
            {currentStep === 1 && (
              <SelectRequest 
                pendingRequests={pendingRequests}
                selectedRequest={selectedRequest}
                handleRequestSelect={handleRequestSelect}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                handleNextStep={handleNextStep}
              />
            )}
            
            {/* Step 2: Select Technician */}
            {currentStep === 2 && (
              <SelectTechnician
                technicians={technicians}
                selectedRequest={selectedRequest}
                selectedTechnician={selectedTechnician}
                handleTechnicianSelect={handleTechnicianSelect}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleNextStep={handleNextStep}
                handlePrevStep={handlePrevStep}
              />
            )}
            
            {/* Step 3: Confirm Assignment */}
            {currentStep === 3 && (
              <ConfirmAssignment
                selectedRequest={selectedRequest}
                selectedTechnician={selectedTechnician}
                assignmentData={assignmentData}
                handleAssignmentDataChange={handleAssignmentDataChange}
                handleNotificationChange={handleNotificationChange}
                handleEquipmentChange={handleEquipmentChange}
                handlePrevStep={handlePrevStep}
                handleAssign={handleAssign}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentWizard;