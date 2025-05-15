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
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import clientService from '../../../services/clientService';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// App theme colors
const THEME = {
  primary: '#6200EE',
  primaryLight: '#9954FF',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onBackground: '#333333',
  onSurface: '#333333',
  onError: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#757575',
  border: '#E0E0E0',
  placeholder: '#9E9E9E',
  divider: '#E0E0E0',
  badge: '#FF5252',
};

export default function ConversationScreen() {
  const { user } = useAuth();
  // Use chatRoomId instead of id for clarity
  const { id: chatRoomId, technicianName, technicianImage } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [chatInfo, setChatInfo] = useState({
    id: chatRoomId,
    name: technicianName || 'Technician',
    avatar: technicianImage || null,
    isOnline: false,
  });
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Force exit loading state after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Forcing exit from loading state');
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Generate a unique ID for messages
  const generateMessageId = () => {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  };

  // Helper function to format timestamp in a user-friendly way
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today, show time only
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // Day of the week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Date (Month Day)
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Load chat messages on component mount
  useEffect(() => {
    fetchChatMessages();
  }, [chatRoomId]);

  // Function to fetch chat messages using room ID
  const fetchChatMessages = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (!chatRoomId) {
        throw new Error('Chat room ID is required');
      }
      
      console.log(`Fetching chat for room ID: ${chatRoomId}`);
      
      // Use the new method that gets chat by room ID
      const chatData = await clientService.getChatByRoomId(chatRoomId);
      
      // Check if we have chat data
      if (!chatData || !chatData.messages) {
        setChatInfo({
          id: chatRoomId,
          name: technicianName || 'Technician',
          avatar: technicianImage || null,
          isOnline: false,
        });
        setMessages([]);
      } else {
        // Update chat info
        setChatInfo({
          id: chatRoomId,
          name: chatData.technicianName || technicianName || 'Technician',
          avatar: chatData.technicianImage || technicianImage || null,
          isOnline: true, // This would come from the API in a real app
        });
        
        // Format messages for display with unique IDs
        const formattedMessages = chatData.messages.map((msg, index) => {
          // IMPORTANT: Using the working logic from the original code
          // Check all possible conditions for identifying client messages
          const isFromClient = msg.senderName === user?.name || 
                  msg.senderName === 'You' || 
                  msg.senderId === user?.id;
          
          return {
            id: `msg-${index}-${Date.now()}`,
            text: msg.content,
            isFromClient: isFromClient,
            timestamp: new Date(msg.sentAt || msg.createdAt || Date.now()),
            read: msg.read || false,
          };
        });
        
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      
      // Provide more specific error messages based on error code
      if (err.response) {
        if (err.response.status === 404) {
          setError('Chat room not found or you are not authorized to access it.');
        } else if (err.response.status === 400) {
          setError('Invalid chat room ID format. Please go back and try again.');
        } else {
          setError(`Server error: ${err.response.data?.error || 'Unknown error'}`);
        }
      } else {
        setError('Failed to load chat messages. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send a message
  const sendMessage = async () => {
    if (message.trim() === '') return;
    
    // Store the message text and clear input
    const messageText = message.trim();
    setMessage('');
    
    // Add message to the UI immediately (optimistic update)
    const newMessage = {
      id: generateMessageId(),
      text: messageText,
      isFromClient: true, // This message is definitely from the client
      timestamp: new Date(),
      pending: true,
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Scroll to the bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      setIsSending(true);
      
      // Send message to server
      await clientService.sendMessageToChatRoom(chatRoomId, messageText);
      
      // Update the message status (remove pending flag)
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMessage.id ? { ...msg, pending: false } : msg
        )
      );
    } catch (err) {
      console.error('Failed to send message (client):', err);
      
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
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

  // Function to check if we should show date separator
  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp);
    const prevDate = new Date(prevMsg.timestamp);
    
    return (
      currentDate.getDate() !== prevDate.getDate() ||
      currentDate.getMonth() !== prevDate.getMonth() ||
      currentDate.getFullYear() !== prevDate.getFullYear()
    );
  };

  // Render date separator
// Render date separator
const renderDateSeparator = (date) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  let dateText;
  
  // Check if the date is today
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    dateText = "Today";
  }
  // Check if the date is yesterday
  else if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    dateText = "Yesterday";
  }
  // Otherwise show the formatted date
  else {
    dateText = date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>{dateText}</Text>
      <View style={styles.dateLine} />
    </View>
  );
};

  // Render each message item (potentially with date separator)
  const renderItem = ({ item, index }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(item, prevMessage);
    
    return (
      <>
        {showDateSeparator && renderDateSeparator(item.timestamp)}
        {renderMessage(item)}
      </>
    );
  };

  // Render each message bubble
  const renderMessage = (item) => {
    // CLIENT MESSAGE (RIGHT SIDE)
    if (item.isFromClient) {
      return (
        <View style={styles.rightMessageContainer}>
          <TouchableOpacity
            disabled={!item.failed}
            onPress={() => item.failed && retryMessage(item)}
            style={styles.rightMessageWrapper}
          >
            <View style={[
              styles.rightMessageBubble,
              item.pending && styles.pendingBubble,
              item.failed && styles.failedBubble
            ]}>
              <Text style={styles.rightMessageText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.rightMessageFooter}>
            {item.pending && <Ionicons name="time" size={12} color={THEME.textSecondary} style={styles.statusIcon} />}
            {item.failed && <Ionicons name="alert-circle" size={12} color={THEME.error} style={styles.statusIcon} />}
            <Text style={styles.messageTime}>
              {formatTimestamp(item.timestamp)}
            </Text>
            {item.read ? (
              <Ionicons name="checkmark-done" size={12} color={THEME.primary} style={styles.statusIcon} />
            ) : (
              <Ionicons name="checkmark" size={12} color={THEME.textSecondary} style={styles.statusIcon} />
            )}
          </View>
        </View>
      );
    } 
    // TECHNICIAN MESSAGE (LEFT SIDE)
    else {
      return (
        <View style={styles.leftMessageContainer}>
          {!chatInfo.avatar ? (
            <View style={styles.leftMessageAvatar}>
              <Text style={styles.leftMessageAvatarText}>{chatInfo.name?.[0]?.toUpperCase() || 'T'}</Text>
            </View>
          ) : (
            <Image source={{ uri: chatInfo.avatar }} style={styles.leftMessageAvatar} />
          )}
          
          <View style={styles.leftMessageContentWrapper}>
            <View style={styles.leftMessageBubble}>
              <Text style={styles.leftMessageText}>{item.text}</Text>
            </View>
            
            <Text style={styles.messageTime}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
      );
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {chatInfo.avatar ? (
            <Image 
              source={{ uri: chatInfo.avatar }} 
              style={styles.headerAvatar}
              onError={() => console.log('Failed to load header avatar')}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>{chatInfo.name?.[0]?.toUpperCase() || 'T'}</Text>
            </View>
          )}
          <View style={styles.headerNameContainer}>
            <Text style={styles.headerTitle}>{chatInfo.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot, 
                chatInfo.isOnline ? styles.onlineDot : styles.offlineDot
              ]} />
              <Text style={styles.statusText}>
                {chatInfo.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
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
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={THEME.error} />
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
            <View style={styles.centerContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={THEME.divider} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Send a message to start the conversation</Text>
              <TouchableOpacity 
                style={styles.startChatButton}
                onPress={() => inputRef.current?.focus()}
              >
                <Text style={styles.startChatButtonText}>Start Chat</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )
        )}
        
        {/* Input area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => {
              Alert.alert(
                'Attachment Options',
                'What would you like to attach?',
                [
                  { text: 'Photo', onPress: () => console.log('Photo selected') },
                  { text: 'Document', onPress: () => console.log('Document selected') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="add-circle" size={28} color={THEME.primary} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={THEME.placeholder}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (message.trim() === '' || isSending) ? styles.disabledButton : styles.activeSendButton
            ]}
            onPress={sendMessage}
            disabled={message.trim() === '' || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={THEME.onPrimary} />
            ) : (
              <Ionicons 
                name="send" 
                size={22} 
                color={message.trim() === '' ? THEME.placeholder : THEME.onPrimary} 
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
    backgroundColor: THEME.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.textSecondary,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: THEME.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: THEME.onPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    color: THEME.textPrimary,
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startChatButtonText: {
    color: THEME.onPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.divider,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    color: THEME.onPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerNameContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  onlineDot: {
    backgroundColor: '#4CAF50',
  },
  offlineDot: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  
  // Content
  content: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  
  // Date separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.divider,
  },
  dateText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  
  // RIGHT MESSAGE (Client message)
  rightMessageContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
    paddingLeft: SCREEN_WIDTH * 0.15,
  },
  rightMessageWrapper: {
    maxWidth: '100%',
  },
  rightMessageBubble: {
    backgroundColor: THEME.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  rightMessageText: {
    color: THEME.onPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  rightMessageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginRight: 8,
  },
  
  // LEFT MESSAGE (Technician message)
  leftMessageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingRight: SCREEN_WIDTH * 0.15,
  },
  leftMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  leftMessageAvatarText: {
    color: THEME.onPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  leftMessageContentWrapper: {
    flex: 1,
  },
  leftMessageBubble: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  leftMessageText: {
    color: THEME.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  
  // Common message styles
  messageTime: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  },
  statusIcon: {
    marginHorizontal: 4,
  },
  pendingBubble: {
    opacity: 0.7,
  },
  failedBubble: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  
  // Input area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.divider,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: THEME.background,
    borderRadius: 24,
    paddingHorizontal: 4,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: THEME.divider,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
    color: THEME.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSendButton: {
    backgroundColor: THEME.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: THEME.divider,
  },
});