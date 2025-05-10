// app/(app)/(client)/conversation/[id].jsx
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';

export default function ConversationScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Simulate API call to get chat info and messages
    setTimeout(() => {
      // This would be replaced with a real API call in production
      if (id === '1') { // Support Team
        setChatInfo({
          id: '1',
          name: 'Support Team',
          avatar: null,
          isOnline: true,
        });
        setMessages([
          {
            id: '1',
            text: 'Hello! How can I help you today?',
            sender: 'tech',
            senderName: 'Support Team',
            timestamp: new Date(Date.now() - 60000 * 25),
          },
          {
            id: '2',
            text: 'I have a question about my AC maintenance appointment.',
            sender: 'client',
            senderName: 'You',
            timestamp: new Date(Date.now() - 60000 * 20),
          },
          {
            id: '3',
            text: 'Of course! I can see you have an appointment scheduled for next week. What would you like to know?',
            sender: 'tech',
            senderName: 'Support Team',
            timestamp: new Date(Date.now() - 60000 * 15),
          },
        ]);
      } else if (id === '2') { // John Smith
        setChatInfo({
          id: '2',
          name: 'John Smith',
          avatar: null,
          isOnline: false,
          lastSeen: new Date(Date.now() - 60000 * 45),
        });
        setMessages([
          {
            id: '1',
            text: 'Hello, I m scheduled to perform AC maintenance at your location.',
            sender: 'tech',
            senderName: 'John Smith',
            timestamp: new Date(Date.now() - 3600000 * 5),
          },
          {
            id: '2',
            text: 'Hi John, what time should I expect you?',
            sender: 'client',
            senderName: 'You',
            timestamp: new Date(Date.now() - 3600000 * 4),
          },
          {
            id: '3',
            text: 'I ll be there at 10 AM for the AC maintenance.',
            sender: 'tech',
            senderName: 'John Smith',
            timestamp: new Date(Date.now() - 3600000 * 2),
          },
        ]);
      } else { // Sarah Johnson or fallback
        setChatInfo({
          id: '3',
          name: 'Sarah Johnson',
          avatar: null,
          isOnline: true,
        });
        setMessages([
          {
            id: '1',
            text: 'Hi, I ll be handling your network setup today.',
            sender: 'tech',
            senderName: 'Sarah Johnson',
            timestamp: new Date(Date.now() - 86400000 * 2),
          },
          {
            id: '2',
            text: 'Great! What time will you arrive?',
            sender: 'client',
            senderName: 'You',
            timestamp: new Date(Date.now() - 86400000 * 2 + 3600000),
          },
          {
            id: '3',
            text: 'I should be there around 2:30 PM. I ll let you know if anything changes.',
            sender: 'tech',
            senderName: 'Sarah Johnson',
            timestamp: new Date(Date.now() - 86400000 * 2 + 3600000 * 2),
          },
          {
            id: '4',
            text: 'The network setup has been completed successfully.',
            sender: 'tech',
            senderName: 'Sarah Johnson',
            timestamp: new Date(Date.now() - 86400000 * 1),
          },
        ]);
      }
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'client',
      senderName: 'You',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate response after 1 second
    setTimeout(() => {
      const responseMessage = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'll get back to you shortly.",
        sender: 'tech',
        senderName: chatInfo?.name || 'Technician',
        timestamp: new Date(),
      };
      setMessages(currentMessages => [...currentMessages, responseMessage]);
    }, 1000);
  };

  const renderMessage = ({ item }) => {
    const isClient = item.sender === 'client';
    return (
      <View style={[styles.messageContainer, isClient ? styles.clientMessage : styles.techMessage]}>
        <View style={[styles.messageBubble, isClient ? styles.clientBubble : styles.techBubble]}>
          <Text style={[styles.messageText, isClient ? styles.clientText : styles.techText]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#6200EE" />
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
              Last seen {chatInfo?.lastSeen?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color="#6200EE" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={message.trim() === ''}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() === '' ? '#CCCCCC' : '#6200EE'} 
            />
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
  messageText: {
    fontSize: 16,
  },
  clientText: {
    color: '#FFFFFF',
  },
  techText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    marginHorizontal: 4,
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
});