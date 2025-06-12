// services/socketService.js - Complete Socket.IO client service
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentRoom = null;
  }

  connect() {
    if (this.socket && this.isConnected) {
      return; // Already connected
    }

    // 🔧 CHANGE THIS URL to your server URL
    this.socket = io('http://localhost:3000', { // Changed from 5000 to 3000 to match your server
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });
  }

  joinRoom(roomId) {
    if (this.socket && roomId) {
      this.currentRoom = roomId;
      this.socket.emit('join_room', roomId);
      console.log(`🏠 Joined room: ${roomId}`);
    }
  }

  leaveRoom(roomId) {
    if (this.socket && roomId) {
      this.socket.emit('leave_room', roomId);
      console.log(`🚪 Left room: ${roomId}`);
      this.currentRoom = null;
    }
  }

  sendMessage(roomId, message, senderId, senderName, isFromClient = true) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        roomId,
        message,
        senderId,
        senderName,
        isFromClient
      });
      console.log(`📤 Message sent to room ${roomId}`);
      return true;
    }
    console.log('❌ Cannot send message - not connected');
    return false;
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  sendTyping(roomId, userId, userName, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user_typing', {
        roomId,
        userId,
        userName,
        isTyping
      });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentRoom = null;
      console.log('🔌 Socket disconnected');
    }
  }

  // Check if connected
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      currentRoom: this.currentRoom,
      socketId: this.socket?.id
    };
  }
}

// Create single instance
const socketService = new SocketService();
export default socketService;