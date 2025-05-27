import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Notification from "../components/User-Manager/Notification";
import feedbackService from "../services/feedbackService";
import { useAuth } from '../contexts/AuthContext';
import PermissionDenied from "../components/PermissionDenied";

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    if (hasPermission()) {
      fetchFeedbacks();
    }
  }, []);

  const hasPermission = () => {
    if (currentUser?.role === 'administrator') {
      const permissions = currentUser?.permissionsList || [];
      return permissions.includes("full_access") || permissions.includes("view_reports");
    }
    return false;
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getAllFeedbacks();
      console.log('Fetched feedbacks:', data); // Debug log
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      showNotification("Failed to load feedbacks. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span 
        key={index} 
        className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  // Calculate average rating
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesRating = filterRating === 'all' || feedback.rating === parseInt(filterRating);
    const matchesSearch = searchTerm === '' || 
      feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.interventionId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRating && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {!hasPermission() ? (
        <div className="flex-1 ml-64">
          <PermissionDenied message="view feedback" />
        </div>
      ) : (
        <div className="flex-1 pt-16 md:pt-6 md:ml-64 p-4 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-600 rounded-lg shadow-sm mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Customer Feedback</h1>
                <p className="text-gray-600">
                  Review and manage customer feedback entries
                </p>
              </div>
            </div>
          </div>

          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
          />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-800">{feedbacks.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-800 mr-2">{averageRating}</p>
                    <div className="text-yellow-400">★</div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">5 Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {feedbacks.filter(f => f.rating === 5).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Ratings (1-2)</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {feedbacks.filter(f => f.rating <= 2).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                placeholder="Search by client name, intervention, or comment..."
                className="w-full bg-white border border-gray-200 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              className="bg-white border border-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                {searchTerm || filterRating !== 'all' 
                  ? 'No feedback matches your filters' 
                  : 'No feedback available'}
              </div>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {renderStars(feedback.rating)}
                        <span className="ml-2 text-gray-600 text-sm font-medium">
                          ({feedback.rating}/5)
                        </span>
                      </div>
                      
                      {/* Client Info */}
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {feedback.clientId?.name || 'Unknown Client'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {feedback.clientId?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-sm text-gray-500 mt-2 md:mt-0">
                      {new Date(feedback.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Comment */}
                  <div className="bg-gray-50 rounded-lg p-4 my-4">
                    <p className="text-gray-700 italic">
                      "{feedback.comment || 'No comment provided'}"
                    </p>
                  </div>
                  
                  {/* Intervention Info */}
                  <div className="border-t pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
                      <div className="flex items-center mb-2 md:mb-0">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-gray-600">
                          <span className="font-medium">Intervention:</span> {feedback.interventionId?.title || 'N/A'}
                        </span>
                      </div>
                      
                      {feedback.interventionId?.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {feedback.interventionId.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedback;