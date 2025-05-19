// src/pages/Support.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supportService } from '../services/supportService';

function Support() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTickets() {
      try {
        const allTickets = await supportService.getTickets();
        setTickets(allTickets);
      } catch (error) {
        console.error('Error fetching support tickets:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTickets();
  }, []);
  
  const handleSelectTicket = async (ticketId) => {
    try {
      const ticket = await supportService.getTicketDetails(ticketId);
      setSelectedTicket(ticket);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };
  
  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!reply.trim()) return;
    
    try {
      const updatedTicket = await supportService.replyToTicket(selectedTicket.id, reply);
      setSelectedTicket(updatedTicket);
      setReply('');
      
      // Update ticket in the list
      setTickets(tickets.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };
  
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      const updatedTicket = await supportService.closeTicket(selectedTicket.id);
      setSelectedTicket(updatedTicket);
      
      // Update ticket in the list
      setTickets(tickets.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };
  
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Tickets</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-gray-500">Loading tickets...</div>
                </div>
              ) : (
                <>
                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No support tickets available.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {tickets.map(ticket => (
                        <li 
                          key={ticket.id}
                          className={`p-3 rounded-md cursor-pointer border-l-4 hover:bg-gray-50 
                            ${selectedTicket && selectedTicket.id === ticket.id 
                              ? 'bg-gray-100 border-primary-600' 
                              : 'border-transparent'
                            } 
                            ${ticket.status === 'closed' ? 'opacity-70' : ''}
                          `}
                          onClick={() => handleSelectTicket(ticket.id)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-800 truncate">{ticket.subject}</span>
                            <span className={`badge badge-${ticket.status}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{ticket.clientName}</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-2">{selectedTicket.subject}</h2>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>From: {selectedTicket.clientName}</span>
                      <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    {selectedTicket.status !== 'closed' && (
                      <button 
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        onClick={handleCloseTicket}
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="max-w-3xl ml-0 mr-auto p-4 bg-gray-100 rounded-lg">
                    <div className="text-gray-800 mb-3">
                      {selectedTicket.description}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{selectedTicket.clientName}</span>
                      <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {selectedTicket.messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`max-w-3xl p-4 rounded-lg ${
                        message.isAdmin 
                          ? 'ml-auto mr-0 bg-blue-50' 
                          : 'ml-0 mr-auto bg-gray-100'
                      }`}
                    >
                      <div className="text-gray-800 mb-3">
                        {message.content}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {message.isAdmin ? 'Admin' : selectedTicket.clientName}
                        </span>
                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedTicket.status !== 'closed' && (
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendReply}>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        rows="3"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply here..."
                        required
                      ></textarea>
                      <div className="mt-2 text-right">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          Send Reply
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;