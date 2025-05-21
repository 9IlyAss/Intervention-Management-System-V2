import React from 'react';

function ConfirmAssignment({
  selectedRequest,
  selectedTechnician,
  handlePrevStep,
  handleAssign
}) {
  // Format MongoDB ObjectId to be more readable
  const formatId = (id) => {
    return id.slice(-6).toUpperCase();
  };

  return (
    <div>
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Step 3: Confirm Assignment
        </h2>
      </div>
      
      <div className="p-10 flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-md p-8 border border-gray-200 shadow-sm mb-8 text-center max-w-xl mx-auto">
          <svg className="h-14 w-14 text-blue-600 mx-auto mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          
          <h3 className="text-xl font-medium text-gray-800 mb-4">Confirm Assignment</h3>
          
          <p className="text-gray-600 mb-8 text-lg">
            Are you sure you want to assign <span className="font-semibold text-blue-700">{selectedTechnician.name}</span> to handle request #{formatId(selectedRequest._id)} from <span className="font-semibold text-gray-800">{selectedRequest.clientName}</span>?
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <button
              onClick={handlePrevStep}
              className="py-2.5 px-6 rounded-md font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAssign}
              className="py-2.5 px-6 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmAssignment;