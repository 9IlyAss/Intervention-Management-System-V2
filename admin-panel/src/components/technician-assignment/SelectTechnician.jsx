import React from 'react';

function SelectTechnician({ 
  technicians, 
  selectedRequest, 
  selectedTechnician, 
  handleTechnicianSelect, 
  searchQuery, 
  setSearchQuery,
  handleNextStep,
  handlePrevStep
}) {
  // Check if a technician's skills match with the request issue
  const getMatchScore = (technician) => {
    if (!selectedRequest) return 0;
    
    const issueKeywords = selectedRequest.issue.toLowerCase().split(' ');
    let score = 0;
    
    technician.skills.forEach(skill => {
      if (issueKeywords.some(keyword => keyword.includes(skill.toLowerCase()))) {
        score += 1;
      }
    });
    
    return score;
  };

  const filteredTechnicians = technicians.filter(tech => 
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get default avatar for technicians without profile image
  const getInitialsAvatar = (name) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Step 2: Select a Technician
        </h2>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <h3 className="font-medium text-indigo-800 mb-2">Selected Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Client</h4>
                <p className="font-medium">{selectedRequest.clientName}</p>
                <p className="text-sm text-gray-600">{selectedRequest.clientEmail}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                <p className="font-medium">{selectedRequest.location}</p>
                <p className="text-sm text-gray-600">ID: #{selectedRequest._id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Issue</h4>
                <p className="font-medium">{selectedRequest.issue}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search technicians by name, specialization or skills..."
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechnicians.length > 0 ? (
            // Sort technicians so that those with matching skills come first
            [...filteredTechnicians].sort((a, b) => getMatchScore(b) - getMatchScore(a)).map(tech => (
              <div 
                key={tech._id} 
                className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md
                  ${selectedTechnician?._id === tech._id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}
                `}
                onClick={() => handleTechnicianSelect(tech)}
              >
                <div className="flex items-start mb-3">
                  {tech.profileImage ? (
                    <img 
                      src={tech.profileImage} 
                      alt={tech.name} 
                      className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                    />
                  ) : (
                    <div className="bg-blue-100 text-blue-800 rounded-full h-10 w-10 flex items-center justify-center mr-3 flex-shrink-0">
                      {getInitialsAvatar(tech.name)}
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-medium text-gray-800">{tech.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded
                        ${tech.status === 'Available' ? 'bg-green-100 text-green-800' : ''}
                        ${tech.status === 'Busy' ? 'bg-amber-100 text-amber-800' : ''}
                        ${tech.status === 'Offline' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {tech.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tech.specialization}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {tech.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className={`text-xs px-2 py-1 rounded
                        ${selectedRequest?.issue.toLowerCase().includes(skill.toLowerCase())
                          ? 'bg-green-100 text-green-800 font-medium' 
                          : 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      {skill}
                      {selectedRequest?.issue.toLowerCase().includes(skill.toLowerCase()) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  <div>
                    <span className="font-medium">Active assignments:</span> {tech.activeAssignments}
                  </div>
                  <div>
                    <span className="font-medium">Avg. response:</span> {tech.avgResponseTime}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {tech.email}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {tech.phone}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(tech.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({tech.reviewCount} reviews)</span>
                </div>
                
                {getMatchScore(tech) > 0 && (
                  <div className="mt-3 text-xs text-green-600 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Skills match the request
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-600">No technicians found matching your criteria</p>
            </div>
          )}
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
          onClick={handleNextStep}
          disabled={!selectedTechnician}
          className={`py-2 px-6 rounded-lg font-medium transition-colors
            ${selectedTechnician
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          Continue to Confirmation
        </button>
      </div>
    </div>
  );
}

export default SelectTechnician;