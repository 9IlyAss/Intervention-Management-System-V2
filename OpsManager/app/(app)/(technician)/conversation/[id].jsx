// app/(app)/(client)/conversation/[id].jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import clientService from '../../../services/clientService';

export default function ConversationScreen() {
  const { user } = useAuth();
  const { id, technicianName } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [chatInfo, setChatInfo] = useState({
    id: id,
    name: technicianName || 'Technician',
    avatar: null,
    isOnline: false,
  });
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  // Generate a unique ID for messages
  const generateMessageId = () => {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  };

  // Load chat messages on component mount
  useEffect(() => {
    fetchChatMessages();
  }, [id]);

  // Function to fetch chat messages
  const fetchChatMessages = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (!id) {
        throw new Error('Chat ID is required');
      }
      
      // Get chat with technician using clientService
      const chatData = await clientService.getChatWithTechnician(id);
      
      // Check if we have chat data
      if (!chatData || !chatData.messages) {
        setChatInfo({
          id: id,
          name: technicianName || 'Technician',
          avatar: null,
          isOnline: false,
        });
        setMessages([]);
      } else {
        // Update chat info
        setChatInfo({
          id: id,
          name: chatData.technicianName || technicianName || 'Technician',
          avatar: null,
          isOnline: true, // This would come from the API in a real app
        });
        
        // Format messages for display with unique IDs
        const formattedMessages = chatData.messages.map((msg, index) => ({
          id: `msg-${index}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          text: msg.content,
          sender: msg.senderName === user?.name ? 'client' : 'tech',
          senderName: msg.senderName,
          timestamp: new Date(msg.sentAt || Date.now()),
        }));
        
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      setError('Failed to load chat messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send a message
  const sendMessage = async () => {
    if (message.trim() === '') return;
    
    // Store the message text and clear input for better UX
    const messageText = message.trim();
    setMessage('');
    
    // Add message to the UI immediately (optimistic update)
    const newMessage = {
      id: generateMessageId(),
      text: messageText,
      sender: 'client',
      senderName: 'You',
      timestamp: new Date(),
      pending: true, // Mark as pending until confirmed by server
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Scroll to the bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      setIsSending(true);
      
      // Send message to server
      await clientService.sendMessageToTechnician(id, messageText);
      
      // Update the message status (remove pending flag)
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMessage.id ? { ...msg, pending: false } : msg
        )
      );
      
      // No need to fetch all messages again for a simple chat app
      // But in a real app, you might want to fetch to get message ID from server
      // await fetchChatMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Show error but keep the message in the UI
      Alert.alert(
        'Message Not Sent',
        'Failed to send your message. Tap to try again.',
        [{ text: 'OK' }]
      );
      
      // Mark the message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMessage.id ? { ...msg, pending: false, failed: true } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // Function to retry sending a failed message
  const retryMessage = async (failedMessage) => {
    // Remove the failed message
    setMessages(prevMessages => 
      prevMessages.filter(msg => msg.id !== failedMessage.id)
    );
    
    // Set the message text and trigger send
    setMessage(failedMessage.text);
    setTimeout(() => sendMessage(), 100);
  };

  // Render each message
  const renderMessage = ({ item }) => {
    const isClient = item.sender === 'client';
    return (
      <TouchableOpacity
        style={[styles.messageContainer, isClient ? styles.clientMessage : styles.techMessage]}
        disabled={!item.failed}
        onPress={() => item.failed && retryMessage(item)}
      >
        <View style={[
          styles.messageBubble, 
          isClient ? styles.clientBubble : styles.techBubble,
          item.pending && styles.pendingBubble,
          item.failed && styles.failedBubble
        ]}>
          <Text style={[styles.messageText, isClient ? styles.clientText : styles.techText]}>
            {item.text}
          </Text>
        </View>
        <View style={styles.timestampContainer}>
          {item.pending && <Ionicons name="time" size={12} color="#999" style={styles.statusIcon} />}
          {item.failed && <Ionicons name="alert-circle" size={12} color="#F44336" style={styles.statusIcon} />}
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerNameContainer}>
          <Text style={styles.headerTitle}>{chatInfo?.name}</Text>
          {chatInfo?.isOnline ? (
            <Text style={styles.onlineStatus}>Online</Text>
          ) : (
            <Text style={styles.offlineStatus}>
              Offline
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            // Show options like refresh, clear chat, etc.
            Alert.alert(
              'Chat Options',
              'What would you like to do?',
              [
                { 
                  text: 'Refresh Messages', 
                  onPress: fetchChatMessages 
                },
                { 
                  text: 'Cancel', 
                  style: 'cancel' 
                }
              ]
            )
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchChatMessages}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Send a message to start the conversation</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => String(item.id)} // Ensure key is always a string
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={true}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => {
              Alert.alert(
                'Attachment Options',
                'This feature is coming soon!',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6200EE" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, (message.trim() === '' || isSending) && styles.disabledButton]}
            onPress={sendMessage}
            disabled={message.trim() === '' || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#CCCCCC" />
            ) : (
              <Ionicons 
                name="send" 
                size={24} 
                color={message.trim() === '' ? '#CCCCCC' : '#6200EE'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerNameContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  offlineStatus: {
    fontSize: 12,
    color: '#999',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  clientMessage: {
    alignSelf: 'flex-end',
  },
  techMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
  },
  clientBubble: {
    backgroundColor: '#6200EE',
    borderBottomRightRadius: 4,
  },
  techBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  pendingBubble: {
    opacity: 0.7,
  },
  failedBubble: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  messageText: {
    fontSize: 16,
  },
  clientText: {
    color: '#FFFFFF',
  },
  techText: {
    color: '#333333',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginHorizontal: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 80, // To account for tab bar
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});