import React from 'react';

const ADMIN_PERMISSIONS = ['assign_technician', 'manage_users', 'view_reports'];
const SKILL_OPTIONS = [
  'Network', 'VPN', 'Router Configuration', 'Printers', 'Hardware', 
  'PC Repair', 'Software Installation', 'Operating Systems', 'Mobile Devices', 
  'Cloud Services', 'Email Configuration', 'Database Management', 'Security'
];

function UserFormModal({ 
  isOpen, 
  onClose, 
  formData, 
  onFormChange, 
  onSubmit, 
  isEditing, 
  loading 
}) {
  if (!isOpen) return null;

  // Handle role change
  const handleRoleChange = (e) => {
    const role = e.target.value;
    const updatedData = { ...formData, role };
    
    // Reset role-specific fields
    if (role === 'administrator') {
      updatedData.permissionsList = [];
      updatedData.skillsList = undefined;
    } else if (role === 'technician') {
      updatedData.permissionsList = undefined;
      updatedData.skillsList = [];
    } else if (role === 'client') {
      updatedData.permissionsList = undefined;
      updatedData.skillsList = undefined;
    }
    
    onFormChange(updatedData);
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    const permissions = formData.permissionsList || [];
    const updatedPermissions = permissions.includes(permission)
      ? permissions.filter(p => p !== permission)
      : [...permissions, permission];
    
    onFormChange({ ...formData, permissionsList: updatedPermissions });
  };

  // Handle skill toggle
  const handleSkillToggle = (skill) => {
    const skills = formData.skillsList || [];
    const updatedSkills = skills.includes(skill)
      ? skills.filter(s => s !== skill)
      : [...skills, skill];
    
    onFormChange({ ...formData, skillsList: updatedSkills });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormChange({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="administrator">Administrator</option>
                <option value="technician">Technician</option>
                <option value="client">Client</option>
              </select>
            </div>
            
            {/* Password fields */}
            {!isEditing && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isEditing}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
            
            {/* Password for editing - optional */}
            {isEditing && (
              <div className="md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Only fill this if you want to change the password</p>
              </div>
            )}
          </div>
          
          {/* Administrator permissions */}
          {formData.role === 'administrator' && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Administrator Permissions</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {ADMIN_PERMISSIONS.map((permission, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`permission-${permission}`}
                      checked={formData.permissionsList?.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-700">
                      {permission.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Select permissions for this administrator</p>
            </div>
          )}
          
          {/* Technician fields */}
          {formData.role === 'technician' && (
            <div className="mb-6 space-y-4">
              {/* Skills */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Technician Skills</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    {SKILL_OPTIONS.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`skill-${index}`}
                          checked={formData.skillsList?.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`skill-${index}`} className="ml-2 block text-sm text-gray-700">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Select skills for this technician</p>
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;