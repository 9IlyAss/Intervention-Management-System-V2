// services/supportService.js
// Simulates support ticket service that would interact with backend APIs

// Mock data for support tickets
const MOCK_TICKETS = [
  {
    id: 1,
    clientId: 101,
    clientName: 'John Doe',
    subject: 'Cannot access the client portal',
    description: 'I\'m trying to log in to the client portal but keep getting an error message. I\'ve tried resetting my password but still having issues.',
    status: 'open',
    createdAt: '2025-04-20T10:30:00Z',
    messages: [
      {
        content: 'I\'ve tried multiple browsers as well with no success.',
        timestamp: '2025-04-20T10:35:00Z',
        isAdmin: false
      }
    ]
  },
  {
    id: 2,
    clientId: 102,
    clientName: 'Jane Smith',
    subject: 'Billing discrepancy on last invoice',
    description: 'There seems to be an error on my last invoice. I was charged for services I don\'t believe I received.',
    status: 'open',
    createdAt: '2025-04-19T14:45:00Z',
    messages: []
  },
  {
    id: 3,
    clientId: 103,
    clientName: 'Robert Brown',
    subject: 'Feature request for client dashboard',
    description: 'Would it be possible to add a calendar view to the client dashboard to see upcoming maintenance windows?',
    status: 'closed',
    createdAt: '2025-04-18T09:15:00Z',
    messages: [
      {
        content: 'Thank you for your suggestion. We\'ll add this to our feature request list and consider it for upcoming releases.',
        timestamp: '2025-04-18T11:20:00Z',
        isAdmin: true
      },
      {
        content: 'Great, thank you for the quick response!',
        timestamp: '2025-04-18T13:45:00Z',
        isAdmin: false
      },
      {
        content: 'You\'re welcome! We\'ve closed this ticket, but feel free to reach out if you have any other questions or suggestions.',
        timestamp: '2025-04-18T15:10:00Z',
        isAdmin: true
      }
    ]
  },
  {
    id: 4,
    clientId: 104,
    clientName: 'Emily Wilson',
    subject: 'Need help understanding service package',
    description: 'I\'m confused about what\'s included in my current service package. Can someone go over the details with me?',
    status: 'open',
    createdAt: '2025-04-17T16:20:00Z',
    messages: []
  },
  {
    id: 5,
    clientId: 105,
    clientName: 'David Clark',
    subject: 'Request for additional support hours',
    description: 'Our current support hours aren\'t sufficient for our needs. I\'d like to discuss increasing our support package.',
    status: 'open',
    createdAt: '2025-04-16T13:10:00Z',
    messages: []
  }
];

// Store mock data in localStorage for persistence during session
if (!localStorage.getItem('mock_tickets')) {
  localStorage.setItem('mock_tickets', JSON.stringify(MOCK_TICKETS));
}

export const supportService = {
  // Get all tickets
  getTickets: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
    return tickets;
  },
  
  // Get tickets by status
  getTicketsByStatus: async (status) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
    
    if (status === 'all') {
      return tickets;
    }
    
    return tickets.filter(ticket => ticket.status === status);
  },
  
  // Get a specific ticket by ID with full details
  getTicketDetails: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
    return tickets.find(ticket => ticket.id === Number(id)) || null;
  },
  
  // Reply to a ticket
  replyToTicket: async (ticketId, content) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
    
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === Number(ticketId)) {
        const updatedTicket = { 
          ...ticket,
          messages: [
            ...ticket.messages,
            {
              content,
              timestamp: new Date().toISOString(),
              isAdmin: true
            }
          ]
        };
        
        return updatedTicket;
      }
      return ticket;
    });
    
    localStorage.setItem('mock_tickets', JSON.stringify(updatedTickets));
    
    return updatedTickets.find(ticket => ticket.id === Number(ticketId));
  },
  
  // Close a ticket
  closeTicket: async (ticketId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
    
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === Number(ticketId)) {
        return { 
          ...ticket,
          status: 'closed'
        };
      }
      return ticket;
    });
    
    localStorage.setItem('mock_tickets', JSON.stringify(updatedTickets));
    
    return updatedTickets.find(ticket => ticket.id === Number(ticketId));
  },
  
  // Create a new ticket
  createTicket: async (ticketData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]');
    
    const newTicket = {
      id: Math.max(0, ...tickets.map(t => t.id)) + 1,
      ...ticketData,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    const updatedTickets = [...tickets, newTicket];
    localStorage.setItem('mock_tickets', JSON.stringify(updatedTickets));
    
    return newTicket;
  }
};