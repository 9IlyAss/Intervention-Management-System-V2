// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AssignTechnicians from './pages/AssignTechnicians'
import ManageUsers from "./pages/ManageUsers"
import AllRequests from "./pages/AllRequests"
import Support from './pages/Support';
// import Reports from './pages/Reports';
import Feedback from './pages/Feedback';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // If still loading, show a loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If not authenticated after loading, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the children
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/assign-technicians" 
        element={
          <ProtectedRoute>
            <AssignTechnicians />
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/manage-users" 
        element={
          <ProtectedRoute>
            <ManageUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Requests" 
        element={
          <ProtectedRoute>
            <AllRequests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/support" 
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } 
      />
      {/* <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      /> */}
      <Route 
        path="/feedback" 
        element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        } 
      />
      
      
      {/* Catch all route */}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;