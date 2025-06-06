import React from "react";

function SelectRequest({
  pendingRequests,
  selectedRequest,
  handleRequestSelect,
  searchQuery,
  setSearchQuery,
  handleNextStep,
}) {
  // Safely filter requests, checking if category exists before trying to access it
  const filteredRequests = pendingRequests.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      request.clientName.toLowerCase().includes(searchLower) ||
      request.issue.toLowerCase().includes(searchLower) ||
      request._id.includes(searchLower) ||
      (request.category && request.category.toLowerCase().includes(searchLower))
    );
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

  // Get category color class
  const getCategoryColorClass = (category) => {
    if (!category) return "bg-gray-100 text-gray-700";

    switch (category.toLowerCase()) {
      case "it services":
        return "bg-blue-100 text-blue-700"; // IT Services
      case "surveillance":
        return "bg-purple-100 text-purple-700"; // Surveillance
      case "telephony":
        return "bg-green-100 text-green-700"; // Telephony
      case "printers":
        return "bg-orange-100 text-orange-700"; // Printers
      case "software":
        return "bg-red-100 text-red-700"; // Software
      case "office":
        return "bg-cyan-100 text-cyan-700"; // Office Supplies
      case "maintenance":
        return "bg-slate-100 text-slate-700"; // Maintenance
      case "alarms":
        return "bg-pink-100 text-pink-700"; // Alarms
      case "sound":
        return "bg-amber-100 text-amber-700"; // Sound Systems
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Step 1: Select a Service Request
        </h2>
      </div>

      <div className="p-4 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search requests by client name, issue, category, or ID..."
              className="w-full bg-white border border-gray-200 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <select
            className="bg-white border border-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            onChange={(e) =>
              setSearchQuery(e.target.value !== "all" ? e.target.value : "")
            }
            defaultValue="all"
          >
            <option value="all">All Categories</option>
            <option value="it">IT</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="email">Email</option>
            <option value="network">Network</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`border rounded-md p-4 cursor-pointer transition-all hover:shadow-md bg-white
                  ${
                    selectedRequest && selectedRequest._id === request._id
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-gray-200 hover:border-blue-300"
                  }
                `}
                onClick={() => handleRequestSelect(request)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                    #{formatRequestId(request._id)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded capitalize ${getCategoryColorClass(
                      request.category
                    )}`}
                  >
                    {request.category || "General"}
                  </span>
                </div>

                {/* Client Info with Profile Image */}
                <div className="flex items-center mb-3">
                  {/* Profile Image */}
                  <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0">
                    {request.clientProfile &&
                    request.clientProfile.startsWith("http") ? (
                      <img
                        src={request.clientProfile}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    {/* Initials fallback */}
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-semibold flex items-center justify-center ${
                        request.clientProfile ? "hidden" : "flex"
                      }`}
                      style={{
                        display: request.clientProfile ? "none" : "flex",
                      }}
                    >
                      {getInitials(request.clientName)}
                    </div>
                  </div>

                  {/* Client Name and Issue */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {request.clientName}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {request.issue}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{request.clientEmail}</span>
                  </div>

                  {request.clientPhone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="truncate">{request.clientPhone}</span>
                    </div>
                  )}
                </div>

                {/* Date and Location */}
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="truncate">{request.location}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-white rounded-md border border-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-600">
                No requests found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4 flex justify-end">
        <button
          onClick={handleNextStep}
          disabled={!selectedRequest}
          className={`py-2.5 px-6 rounded-md font-medium transition-colors
            ${
              selectedRequest
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          Continue to Select Technician
        </button>
      </div>
    </div>
  );
}

export default SelectRequest;
