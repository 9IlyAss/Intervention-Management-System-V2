import React, { useState, useEffect } from "react";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  User,
  Search,
  Send,
  Clock,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { supportService } from "../services/supportService";
import { useAuth } from "../contexts/AuthContext";

const Support = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'new', 'resolved'

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);

      const allRequests = await supportService.getAllSupportRequests();
      setSupportRequests(allRequests);
    } catch (error) {
      console.error("Error fetching support requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setResponseMessage("");
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !selectedRequest) return;

    try {
      setSending(true);
      await supportService.respondToRequest(
        selectedRequest._id,
        responseMessage
      );
      alert("Response sent successfully and request marked as resolved");

      // Refresh the list
      await fetchSupportRequests();
      setSelectedRequest(null);
      setResponseMessage("");
    } catch (error) {
      console.error("Error sending response:", error);
      alert("Failed to send response: " + (error.error || error.message));
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = supportRequests.filter((req) => {
    const matchesSearch =
      req.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

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
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Support Center
              </h1>
              <p className="text-gray-600">
                Manage and respond to support requests via email
              </p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Request List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">
                      Support Requests
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredRequests.length} request
                      {filteredRequests.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    {filteredRequests.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No support requests found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredRequests.map((request) => (
                          <div
                            key={request._id}
                            onClick={() => handleSelectRequest(request)}
                            className={`p-4 cursor-pointer transition-colors ${
                              selectedRequest?._id === request._id
                                ? "bg-purple-50 border-l-4 border-purple-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                                {request.subject}
                              </h3>
                              {getStatusIcon(request.status)}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {request.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{request.userId?.name}</span>
                              <span>
                                {supportService.formatDate(request.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Request Detail */}
              <div className="lg:col-span-2">
                {selectedRequest ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Request Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedRequest.subject}
                          </h2>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{selectedRequest.userId?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{selectedRequest.userId?.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {supportService.formatDate(
                                  selectedRequest.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedRequest.status
                          )}`}
                        >
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>

                    {/* Request Content */}
                    <div className="p-6 space-y-6">
                      {/* Original Request */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Original Request
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {selectedRequest.message}
                          </p>
                        </div>
                      </div>

                      {/* Response */}
                      {selectedRequest.response && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Support Response
                          </h3>
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-purple-900">
                                Support Team
                              </span>
                              <span className="text-xs text-purple-600">
                                {supportService.formatDate(
                                  selectedRequest.response.respondedAt
                                )}
                              </span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {selectedRequest.response.message}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Response Form for Admin */}
                      {selectedRequest.status === "new" && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendResponse();
                          }}
                        >
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Send Response
                          </h3>
                          <div className="space-y-3">
                            <textarea
                              value={responseMessage}
                              onChange={(e) =>
                                setResponseMessage(e.target.value)
                              }
                              placeholder="Type your response here. This will be sent via email to the user."
                              rows="6"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={!responseMessage.trim() || sending}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                  responseMessage.trim() && !sending
                                    ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {sending ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    Send Email Response
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-[500px] flex items-center justify-center">
                    <div className="text-center">
                      <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Select a support request to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Support;
