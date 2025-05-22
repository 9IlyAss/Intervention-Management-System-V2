import React from 'react';

function Notification({ show, message, type }) {
  if (!show) return null;

  const getColors = () => {
    switch(type) {
      case 'success':
        return 'bg-green-50 border-l-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-l-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-l-yellow-500 text-yellow-800';
      default:
        return 'bg-gray-50 border-l-gray-500 text-gray-800';
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'success':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case 'error':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case 'warning':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'success':
        return 'Success: ';
      case 'error':
        return 'Error: ';
      case 'warning':
        return 'Note: ';
      default:
        return '';
    }
  };

  return (
    <div className={`mb-6 p-4 rounded-md flex items-center border-l-4 shadow-sm animate-fadeIn ${getColors()}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 mr-3 ${getIconColor()}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        {getIcon()}
      </svg>
      <div>
        <span className="font-medium">{getTitle()}</span>
        {message}
      </div>
    </div>
  );
}

export default Notification;