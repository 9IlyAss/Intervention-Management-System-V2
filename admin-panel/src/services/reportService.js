// services/reportService.js
// Simulates report service that would interact with backend APIs

export const reportService = {
  // Get technician performance report
  getTechnicianPerformance: async (dateRange) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would use the dateRange parameter to filter data
    
    // Return mock data for technician performance report
    return {
      technicianData: [
        {
          name: 'Mike Johnson',
          completedRequests: 24,
          averageRating: 4.8,
          averageResolutionTime: 3.2
        },
        {
          name: 'Sarah Lee',
          completedRequests: 18,
          averageRating: 4.6,
          averageResolutionTime: 4.5
        },
        {
          name: 'David Chen',
          completedRequests: 22,
          averageRating: 4.3,
          averageResolutionTime: 3.8
        }
      ],
      topPerformer: 'Mike Johnson',
      averageResolutionTime: 3.8,
      totalRequestsCompleted: 64
    };
  },
  
  // Get request statistics report
  getRequestStatistics: async (dateRange) => {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Return mock data for request statistics report
    return {
      statusDistribution: [
        { name: 'Pending', value: 35 },
        { name: 'Assigned', value: 20 },
        { name: 'In Progress', value: 25 },
        { name: 'Completed', value: 75 }
      ],
      categoryDistribution: [
        { name: 'Hardware', value: 40 },
        { name: 'Software', value: 35 },
        { name: 'Network', value: 25 },
        { name: 'Email', value: 15 },
        { name: 'Other', value: 10 }
      ],
      totalRequests: 155,
      mostCommonIssue: 'Network connectivity',
      averageRequestAge: 2.7
    };
  },
  
  // Get client satisfaction report
  getClientSatisfaction: async (dateRange) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data for client satisfaction report
    return {
      satisfactionData: [
        { rating: '1 Star', count: 3 },
        { rating: '2 Stars', count: 5 },
        { rating: '3 Stars', count: 12 },
        { rating: '4 Stars', count: 28 },
        { rating: '5 Stars', count: 42 }
      ],
      averageRating: 4.1,
      totalRatings: 90,
      positivePercentage: 78
    };
  },
  
  // Get response times report
  getResponseTimes: async (dateRange) => {
    await new Promise(resolve => setTimeout(resolve, 850));
    
    // Return mock data for response times report
    return {
      timeData: [
        { date: 'Mon', initialResponse: 1.2, resolutionTime: 8.5 },
        { date: 'Tue', initialResponse: 0.9, resolutionTime: 7.8 },
        { date: 'Wed', initialResponse: 1.5, resolutionTime: 9.2 },
        { date: 'Thu', initialResponse: 1.1, resolutionTime: 8.1 },
        { date: 'Fri', initialResponse: 1.3, resolutionTime: 8.7 },
        { date: 'Sat', initialResponse: 2.2, resolutionTime: 10.1 },
        { date: 'Sun', initialResponse: 2.5, resolutionTime: 11.3 }
      ],
      averageInitialResponse: 1.5,
      averageResolutionTime: 9.1,
      slaComplianceRate: 94
    };
  },
  
  // Export a report (in a real app, this would generate a PDF or CSV)
  exportReport: async (reportType, dateRange, reportData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, this would generate and download a file
    console.log(`Exporting ${reportType} report for ${dateRange}...`);
    console.log('Report data:', reportData);
    
    // For demo purposes, just show an alert
    alert(`Report exported successfully! In a real application, this would download a PDF or CSV file.`);
    
    return { success: true };
  }
};