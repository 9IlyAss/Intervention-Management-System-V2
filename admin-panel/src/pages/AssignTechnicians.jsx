import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SelectRequest from "../components/technician-assignment/SelectRequest";
import SelectTechnician from "../components/technician-assignment/SelectTechnician";
import ConfirmAssignment from "../components/technician-assignment/ConfirmAssignment";
import { requestService } from "../services/requestService";
import { userService } from "../services/userService";
import "../styles/AssignTechnicians.css";
import PermissionDenied from "../components/PermissionDenied";
import { useAuth } from '../contexts/AuthContext';

function AssignmentWizard() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  
  const { currentUser } = useAuth();



  // Check permissions more flexibly
  const hasPermission = () => {
    // Check various permission structures
    const permissions = currentUser?.permissionsList || [];
    if(permissions.includes('full_access','assign_technician'))
        return true
    return false;
  };

  const isAuthorized = hasPermission();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Only fetch data if user has permission
        if (!isAuthorized) {
          setLoading(false);
          return;
        }

        // Fetch pending requests and all users
        const [requestsResponse, usersResponse] = await Promise.all([
          requestService.getrequests(),
          userService.getUsers(),
        ]);

        // Filter pending requests
        const pendingRequestsData = requestsResponse.filter(
          (request) => request.status === "Pending" && !request.technicianId
        );

        // Format requests for the component
        const formattedRequests = pendingRequestsData.map((request) => ({
          _id: request._id,
          clientId: request.clientId._id || request.clientId,
          clientName: request.clientId?.name || "Unknown Client",
          clientEmail: request.clientId?.email || "",
          clientPhone: request.clientId?.phone || "",
          clientProfile: request.clientId?.profileImage || "",
          issue: request.title,
          description: request.description,
          location: request.location || "Not specified",
          category: request.category || "General",
          urgency: request.urgency || "Normal",
          createdAt: request.createdAt,
        }));
        
        // Filter technicians from users
        const techniciansData = usersResponse.filter(
          (user) => user.role === "technician"
        );

        // Format technicians for the component
        const formattedTechnicians = techniciansData.map((technician) => ({
          _id: technician._id,
          name: technician.name,
          email: technician.email,
          phone: technician.phone || "",
          profileImage: technician.profileImage || "",
          status: technician.status || "Available",
          activeAssignments: technician.activeAssignments || 0,
          avgRating: technician.avgRating || 0,
          skills: technician.skillsList || [],
        }));

        setPendingRequests(formattedRequests);
        setTechnicians(formattedTechnicians);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotification({
          show: true,
          message: "Failed to load data. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthorized]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  const handleTechnicianSelect = (technician) => {
    setSelectedTechnician(technician);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedRequest) {
      showNotification("Please select a service request", "warning");
      return;
    }

    if (currentStep === 2 && !selectedTechnician) {
      showNotification("Please select a technician", "warning");
      return;
    }

    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleAssign = async () => {
    try {
      setLoading(true);

      // Call the actual API to assign technician
      const assignmentResult = await requestService.assignTechnician(
        selectedRequest._id,
        selectedTechnician._id
      );

      console.log("Assignment result:", assignmentResult);

      // Update UI - remove the assigned request from the list
      setPendingRequests((prevRequests) =>
        prevRequests.filter((req) => req._id !== selectedRequest._id)
      );

      showNotification(
        `Technician ${
          selectedTechnician.name
        } assigned to request #${selectedRequest._id
          .slice(-6)
          .toUpperCase()} successfully`,
        "success"
      );

      // Reset the wizard after successful assignment
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedRequest(null);
        setSelectedTechnician(null);
        setSearchQuery("");
      }, 2000);
    } catch (error) {
      console.error("Error assigning technician:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to assign technician. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      {!isAuthorized ? (
        <div className="flex-1 ml-64">
          <PermissionDenied message="the technician assignment feature" />
        </div>
      ) : (
        <div className="flex-1 pt-16 md:pt-6 md:ml-64 p-4 overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600 rounded-lg shadow-md mr-4">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Assign Technicians
                </h1>
                <p className="text-gray-600">
                  Three-step wizard to assign technicians to service requests
                </p>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center space-x-1 w-full md:w-auto">
              <div
                className={`flex items-center ${
                  currentStep >= 1 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 1
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  1
                </div>
                <span className="ml-2 text-sm hidden md:inline">
                  Select Request
                </span>
              </div>

              <div
                className={`w-5 h-0.5 ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                }`}
              ></div>

              <div
                className={`flex items-center ${
                  currentStep >= 2 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 2
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  2
                </div>
                <span className="ml-2 text-sm hidden md:inline">
                  Select Technician
                </span>
              </div>

              <div
                className={`w-5 h-0.5 ${
                  currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
                }`}
              ></div>

              <div
                className={`flex items-center ${
                  currentStep >= 3 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 3
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  3
                </div>
                <span className="ml-2 text-sm hidden md:inline">
                  Confirm Assignment
                </span>
              </div>
            </div>
          </div>

          {/* Notification */}
          {notification.show && (
            <div
              className={`mb-6 p-4 rounded-md flex items-center border-l-4 shadow-sm animate-fadeIn
              ${
                notification.type === "success"
                  ? "bg-green-50 border-l-green-500 text-green-800"
                  : ""
              }
              ${
                notification.type === "error"
                  ? "bg-red-50 border-l-red-500 text-red-800"
                  : ""
              }
              ${
                notification.type === "warning"
                  ? "bg-yellow-50 border-l-yellow-500 text-yellow-800"
                  : ""
              }
            `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 mr-3
                  ${notification.type === "success" ? "text-green-500" : ""}
                  ${notification.type === "error" ? "text-red-500" : ""}
                  ${notification.type === "warning" ? "text-yellow-500" : ""}
                `}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {notification.type === "success" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
                {notification.type === "error" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
                {notification.type === "warning" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                )}
              </svg>
              <div>
                <span className="font-medium">
                  {notification.type === "success"
                    ? "Success: "
                    : notification.type === "error"
                    ? "Error: "
                    : "Note: "}
                </span>
                {notification.message}
              </div>
            </div>
          )}

          {/* Main Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <span className="text-gray-700">Loading data...</span>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              {/* Step 1: Select Request */}
              {currentStep === 1 && (
                <SelectRequest
                  pendingRequests={pendingRequests}
                  selectedRequest={selectedRequest}
                  handleRequestSelect={handleRequestSelect}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
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
                  handlePrevStep={handlePrevStep}
                  handleAssign={handleAssign}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignmentWizard;