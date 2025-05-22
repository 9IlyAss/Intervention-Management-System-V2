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
  // Filter technicians by name or skills
  const filteredTechnicians = technicians.filter(tech => 
    tech.name && tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tech.skills && Array.isArray(tech.skills) && tech.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Get initials for profile placeholder
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Step 2: Select a Technician
        </h2>
      </div>
      
      <div className="p-4 bg-gray-50">
        
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search technicians by name or skills..."
            className="w-full bg-white border border-gray-200 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Technicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechnicians.length > 0 ? (
            filteredTechnicians.map(tech => (
              <div 
                key={tech._id} 
                className={`border rounded-md p-4 cursor-pointer transition-all hover:shadow-md bg-white
                  ${selectedTechnician?._id === tech._id 
                    ? 'border-blue-600 ring-1 ring-blue-600' 
                    : 'border-gray-200 hover:border-blue-300'}
                `}
                onClick={() => handleTechnicianSelect(tech)}
              >
                {/* Profile Image and Name */}
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full mr-3 flex-shrink-0">
                    {tech.profileImage && tech.profileImage.startsWith('http') ? (
                      <img 
                        src={tech.profileImage} 
                        alt={tech.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-semibold flex items-center justify-center ${tech.profileImage ? 'hidden' : 'flex'}`}
                    >
                      {getInitials(tech.name)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{tech.name || 'Unknown Technician'}</h3>
                    {/* Rating */}
                    <div className="flex items-center mt-1">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {tech.avgRating ? tech.avgRating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Skills */}
                {tech.skills && tech.skills.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {tech.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Contact Info and Status */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{tech.email || 'No email'}</span>
                  </div>
                  
                  {tech.phone && (
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{tech.phone}</span>
                    </div>
                  )}
                  
                  {/* Availability Status */}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium
                      ${tech.status === 'Available' ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {tech.status === 'Available' ? '✓ Available' : '✗ Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-white rounded-md border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-600">No technicians found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={handlePrevStep}
          className="py-2.5 px-6 rounded-md font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Requests
        </button>
        <button
          onClick={handleNextStep}
          disabled={!selectedTechnician}
          className={`py-2.5 px-6 rounded-md font-medium transition-colors
            ${selectedTechnician
              ? 'bg-blue-600 text-white hover:bg-blue-700'
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