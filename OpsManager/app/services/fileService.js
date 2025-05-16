// services/fileService.js
import * as FileSystem from 'expo-file-system';
import api from './api';  // Use the same api.js instance as other services

/**
 * File upload service for handling image uploads to Cloudinary
 */
const fileService = {
  /**
   * Upload a single image to Cloudinary
   * @param {string} uri - Local URI of the image
   * @param {Function} progressCallback - Optional callback for upload progress
   * @returns {Promise<string>} - Promise that resolves to the Cloudinary URL
   */
  uploadImage: async (uri, progressCallback = null) => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error("File doesn't exist");
      }
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        type: 'image/jpeg', // Assuming JPEG, adjust as needed
        name: uri.split('/').pop() || 'photo.jpg',
      });
      
      // Use the api.js instance to make the post request
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (progressCallback) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressCallback(percentCompleted);
          }
        }
      });
      
      // Return the Cloudinary URL
      if (response.data && response.data.imageUrl) {
        return response.data.imageUrl;
      } else {
        throw new Error('Image upload failed - no URL returned');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  },
  
  /**
   * Upload multiple images to Cloudinary
   * @param {Array<string>} uris - Array of local URIs
   * @param {Function} progressCallback - Optional callback for overall progress
   * @returns {Promise<Array<string>>} - Promise that resolves to array of Cloudinary URLs
   */
  uploadMultipleImages: async (uris, progressCallback = null) => {
    if (!uris || uris.length === 0) return [];
    
    try {
      const uploadedUrls = [];
      
      // Upload images one by one
      for (let i = 0; i < uris.length; i++) {
        const url = await fileService.uploadImage(uris[i], progressCallback);
        uploadedUrls.push(url);
        
        // Update progress if available
        if (progressCallback) {
          progressCallback(Math.round(((i + 1) / uris.length) * 100));
        }
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Failed to upload multiple images:', error);
      throw error;
    }
  }
};

export default fileService;
