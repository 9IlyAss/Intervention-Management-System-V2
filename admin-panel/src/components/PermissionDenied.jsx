// components/PermissionDenied.jsx
import React from 'react';
import PropTypes from 'prop-types';

const PermissionDenied = ({ message = 'this feature' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center max-w-md w-full">
        {/* Warning Icon */}
        <div className="mb-4 text-yellow-600">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Permission Required
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          {`You don't have permission to access ${message}.`}
          <br />
          Please contact your administrator to request access.
        </p>
      </div>
    </div>
  );
};

PermissionDenied.propTypes = {
  message: PropTypes.string
};

export default PermissionDenied;