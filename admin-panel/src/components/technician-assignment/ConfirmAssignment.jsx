import React from 'react';

function ConfirmAssignment({
  selectedRequest,
  selectedTechnician,
  scheduledDate,
  setScheduledDate,
  priority,
  setPriority,
  assignmentNotes,
  setAssignmentNotes,
  handlePrevStep,
  handleAssign
}) {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Step 3: Confirm Assignment
        </h2>
      </div>
      
      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Assignment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Request Information */}
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <h4 className="font-medium text-indigo-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Request Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Request ID:</span>
                  <span className="font-medium">#{selectedRequest.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{selectedRequest.clientName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{selectedRequest.clientEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{selectedRequest.location}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Issue:</span>
                  <span className="font-medium block">{selectedRequest.issue}</span>
                </div>
              </div>
            </div>
            
            {/* Technician Information */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Technician Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{selectedTechnician.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-medium">{selectedTechnician.specialization}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`text-xs px-2 py-1 rounded
                    ${selectedTechnician.status === 'Available' ? 'bg-green-100 text-green-800' : ''}
                    ${selectedTechnician.status === 'Busy' ? 'bg-amber-100 text-amber-800' : ''}
                    ${selectedTechnician.status === 'Offline' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {selectedTechnician.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Assignments:</span>
                  <span className="font-medium">{selectedTechnician.activeAssignments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <div className="flex items-center mr-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(selectedTechnician.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs">({selectedTechnician.reviewCount})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Assignment Configuration */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Assignment Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date
              </label>
              <input
                type="date"
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes
              </label>
              <textarea
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm h-32"
                placeholder="Enter any additional notes or instructions for the technician..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Settings</h3>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-4">
              <input 
                id="notify-client" 
                type="checkbox" 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="notify-client" className="ml-2 block text-sm text-gray-700">
                Notify client about technician assignment
              </label>
            </div>
            
            <div className="flex items-center mb-4">
              <input 
                id="notify-technician" 
                type="checkbox" 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="notify-technician" className="ml-2 block text-sm text-gray-700">
                Notify technician about new assignment
              </label>
            </div>
            
            <div className="flex items-center">
              <input 
                id="notify-manager" 
                type="checkbox" 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="notify-manager" className="ml-2 block text-sm text-gray-700">
                Notify department manager
              </label>
            </div>
          </div>
        </div>
        
        {/* Additional Options */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Resolution Time
              </label>
              <select
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                defaultValue="1-2 hours"
              >
                <option value="less than 1 hour">Less than 1 hour</option>
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-4 hours">2-4 hours</option>
                <option value="4+ hours">4+ hours</option>
                <option value="multi-day">Multi-day project</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Required
              </label>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center">
                  <input
                    id="follow-up-yes"
                    name="follow-up"
                    type="radio"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="follow-up-yes" className="ml-2 block text-sm text-gray-700">
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="follow-up-no"
                    name="follow-up"
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="follow-up-no" className="ml-2 block text-sm text-gray-700">
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Required Equipment */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Required Equipment</h3>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input 
                  id="equipment-laptop" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="equipment-laptop" className="ml-2 block text-sm text-gray-700">
                  Diagnostic Laptop
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="equipment-tools" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="equipment-tools" className="ml-2 block text-sm text-gray-700">
                  Toolkit
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="equipment-network" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="equipment-network" className="ml-2 block text-sm text-gray-700">
                  Network Analyzer
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="equipment-cables" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="equipment-cables" className="ml-2 block text-sm text-gray-700">
                  Spare Cables
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="equipment-parts" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="equipment-parts" className="ml-2 block text-sm text-gray-700">
                  Replacement Parts
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="equipment-software" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="equipment-software" className="ml-2 block text-sm text-gray-700">
                  Recovery Software
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-100 mb-6">
          <h3 className="font-medium text-green-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Assignment Summary
          </h3>
          <p className="text-green-700">
            You are about to assign <strong>{selectedTechnician.name}</strong> to handle the request #{selectedRequest.id} from <strong>{selectedRequest.clientName}</strong>. 
            The technician will be notified and scheduled to address this issue on <strong>{new Date(scheduledDate).toLocaleDateString()}</strong> with a <strong>{priority.toLowerCase()}</strong> priority level.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={handlePrevStep}
          className="py-2 px-6 rounded-lg font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleAssign}
          className="py-2 px-6 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Confirm Assignment
        </button>
      </div>
    </div>
  );
}

export default ConfirmAssignment;