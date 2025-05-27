// // src/pages/Reports.jsx
// import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import { reportService } from '../services/reportService';
// import { 
//   BarChart, Bar, LineChart, Line, PieChart, Pie, 
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   Cell
// } from 'recharts';

// function Reports() {
//   const [reportType, setReportType] = useState('technician-performance');
//   const [dateRange, setDateRange] = useState('last-month');
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [customDateRange, setCustomDateRange] = useState({
//     startDate: '',
//     endDate: ''
//   });
  
//   // Define colors for charts
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
//   useEffect(() => {
//     async function fetchReportData() {
//       try {
//         setLoading(true);
//         let data;
        
//         // Determine which date range to use
//         const dates = dateRange === 'custom' 
//           ? { startDate: customDateRange.startDate, endDate: customDateRange.endDate }
//           : dateRange;
        
//         // Fetch the appropriate report data based on report type
//         switch (reportType) {
//           case 'technician-performance':
//             data = await reportService.getTechnicianPerformance(dates);
//             break;
//           case 'request-statistics':
//             data = await reportService.getRequestStatistics(dates);
//             break;
//           case 'client-satisfaction':
//             data = await reportService.getClientSatisfaction(dates);
//             break;
//           case 'response-times':
//             data = await reportService.getResponseTimes(dates);
//             break;
//           default:
//             data = await reportService.getTechnicianPerformance(dates);
//         }
        
//         setReportData(data);
//       } catch (error) {
//         console.error('Error fetching report data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }
    
//     fetchReportData();
//   }, [reportType, dateRange, customDateRange]);
  
//   const handleExportReport = () => {
//     if (!reportData) return;
    
//     try {
//       reportService.exportReport(reportType, dateRange, reportData);
//     } catch (error) {
//       console.error('Error exporting report:', error);
//     }
//   };
  
//   const renderChart = () => {
//     if (!reportData) return null;
    
//     switch (reportType) {
//       case 'technician-performance':
//         return (
//           <div className="w-full">
//             <h3 className="text-xl font-semibold text-center mb-6">Technician Performance</h3>
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={reportData.technicianData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="completedRequests" name="Completed Requests" fill="#0088FE" />
//                 <Bar dataKey="averageRating" name="Average Rating (out of 5)" fill="#00C49F" />
//                 <Bar dataKey="averageResolutionTime" name="Avg. Resolution Time (hours)" fill="#FFBB28" />
//               </BarChart>
//             </ResponsiveContainer>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Performer</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.topPerformer}</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Average Resolution Time</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.averageResolutionTime} hours</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Requests Completed</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.totalRequestsCompleted}</p>
//               </div>
//             </div>
//           </div>
//         );
        
//       case 'request-statistics':
//         return (
//           <div className="w-full">
//             <h3 className="text-xl font-semibold text-center mb-6">Request Statistics</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//               <div>
//                 <h4 className="text-lg font-medium text-center mb-4">Requests by Status</h4>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={reportData.statusDistribution}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={true}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                       nameKey="name"
//                       label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                     >
//                       {reportData.statusDistribution.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
              
//               <div>
//                 <h4 className="text-lg font-medium text-center mb-4">Requests by Category</h4>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={reportData.categoryDistribution}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={true}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                       nameKey="name"
//                       label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                     >
//                       {reportData.categoryDistribution.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Requests</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.totalRequests}</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Most Common Issue</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.mostCommonIssue}</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Average Request Age</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.averageRequestAge} days</p>
//               </div>
//             </div>
//           </div>
//         );
        
//       case 'client-satisfaction':
//         return (
//           <div className="w-full">
//             <h3 className="text-xl font-semibold text-center mb-6">Client Satisfaction</h3>
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={reportData.satisfactionData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="rating" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="count" name="Number of Ratings" fill="#0088FE" />
//               </BarChart>
//             </ResponsiveContainer>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Average Rating</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.averageRating.toFixed(1)} / 5.0</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Ratings</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.totalRatings}</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Positive Feedback %</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.positivePercentage}%</p>
//               </div>
//             </div>
//           </div>
//         );
        
//       case 'response-times':
//         return (
//           <div className="w-full">
//             <h3 className="text-xl font-semibold text-center mb-6">Response Times</h3>
//             <ResponsiveContainer width="100%" height={400}>
//               <LineChart data={reportData.timeData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="initialResponse" 
//                   name="Initial Response (hours)" 
//                   stroke="#0088FE" 
//                   activeDot={{ r: 8 }} 
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="resolutionTime" 
//                   name="Resolution Time (hours)" 
//                   stroke="#00C49F" 
//                 />
//               </LineChart>
//             </ResponsiveContainer>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Avg Initial Response</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.averageInitialResponse} hours</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Avg Resolution Time</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.averageResolutionTime} hours</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <h4 className="text-sm font-semibold text-gray-700 mb-2">SLA Compliance</h4>
//                 <p className="text-xl font-bold text-primary-600">{reportData.slaComplianceRate}%</p>
//               </div>
//             </div>
//           </div>
//         );
        
//       default:
//         return null;
//     }
//   };
  
//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="ml-64 p-8 flex-1">
//         <h1 className="text-2xl font-bold mb-6">Reports</h1>
        
//         <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-wrap gap-4 items-end">
//           <div className="flex flex-col">
//             <label htmlFor="report-type" className="text-sm font-medium text-gray-700 mb-1">
//               Report Type:
//             </label>
//             <select
//               id="report-type"
//               value={reportType}
//               onChange={(e) => setReportType(e.target.value)}
//               className="form-select"
//             >
//               <option value="technician-performance">Technician Performance</option>
//               <option value="request-statistics">Request Statistics</option>
//               <option value="client-satisfaction">Client Satisfaction</option>
//               <option value="response-times">Response Times</option>
//             </select>
//           </div>
          
//           <div className="flex flex-col">
//             <label htmlFor="date-range" className="text-sm font-medium text-gray-700 mb-1">
//               Date Range:
//             </label>
//             <select
//               id="date-range"
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value)}
//               className="form-select"
//             >
//               <option value="last-week">Last Week</option>
//               <option value="last-month">Last Month</option>
//               <option value="last-quarter">Last Quarter</option>
//               <option value="last-year">Last Year</option>
//               <option value="custom">Custom Range</option>
//             </select>
//           </div>
          
//           {dateRange === 'custom' && (
//             <div className="flex space-x-4">
//               <div className="flex flex-col">
//                 <label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-1">
//                   Start Date:
//                 </label>
//                 <input
//                   type="date"
//                   id="start-date"
//                   value={customDateRange.startDate}
//                   onChange={(e) => setCustomDateRange({
//                     ...customDateRange, 
//                     startDate: e.target.value
//                   })}
//                   className="form-input"
//                 />
//               </div>
              
//               <div className="flex flex-col">
//                 <label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-1">
//                   End Date:
//                 </label>
//                 <input
//                   type="date"
//                   id="end-date"
//                   value={customDateRange.endDate}
//                   onChange={(e) => setCustomDateRange({
//                     ...customDateRange, 
//                     endDate: e.target.value
//                   })}
//                   className="form-input"
//                 />
//               </div>
//             </div>
//           )}
          
//           <button 
//             className="btn btn-primary ml-auto"
//             onClick={handleExportReport}
//             disabled={!reportData}
//           >
//             Export Report
//           </button>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6">
//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="text-gray-500">Loading report data...</div>
//             </div>
//           ) : (
//             reportData ? renderChart() : 
//             <div className="text-center py-12 text-gray-500">
//               No data available for the selected parameters.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Reports;