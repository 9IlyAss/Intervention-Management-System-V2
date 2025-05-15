// app/(app)/(client)/chat.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import clientService from '../../../services/clientService';

export default function ChatListScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load chat rooms on component mount
  useEffect(() => {
    fetchChatRooms();
  }, []);

  // Function to fetch chat rooms
  const fetchChatRooms = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const data = await clientService.getChatRooms();
      
      // Format the data for display
      const formattedChatRooms = data.map(room => {
        // Get the last message if available
        const lastMessage = room.interventionTitle || 'Start a conversation';
        
        return {
          id: room.chatRoomId || `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: room.clientName, // In this case it's the technician name
          avatar: room.technicianImage,
          lastMessage: lastMessage,
          timestamp: new Date(),
          unread: 0, // You would get this from the API in a real app
        };
      });
      
      setChatRooms(formattedChatRooms);
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
      setError('Failed to load chat rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChatRooms();
    setRefreshing(false);
  };

  // Filter chat rooms based on search query
  const filteredChatRooms = searchQuery.trim() === '' 
    ? chatRooms 
    : chatRooms.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffInHours = (now - timestamp) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Navigate to conversation screen
  const goToChat = (chatId, technicianName, technicianImage) => {
    router.push({
      pathname: `/(app)/(client)/conversation/${chatId}`,
      params: { 
        technicianName,
        technicianImage
      }
    });
  };

  // Render each chat room item
  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => goToChat(item.id, item.name, item.avatar)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name?.[0] || 'T'}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.chatTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text 
            style={styles.lastMessage}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
          
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Show empty state when no chat rooms
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : error ? (
        <View>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={[styles.emptyText, { color: '#F44336' }]}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchChatRooms}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <TouchableOpacity 
            style={styles.newChatButton} 
            onPress={() => router.push('/(app)/(client)/support')}
          >
            <Text style={styles.newChatButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading || refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#6200EE" />
          ) : (
            <Ionicons name="refresh" size={22} color="#6200EE" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={filteredChatRooms}
        renderItem={renderChatItem}
        keyExtractor={item => String(item.id)} // Ensure key is always a string
        contentContainerStyle={[
          styles.chatList,
          filteredChatRooms.length === 0 && styles.emptyChatList
        ]}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 40,
  },
  clearButton: {
    padding: 8,
  },
  chatList: {
    padding: 16,
    paddingBottom: 80, // For tab bar
  },
  emptyChatList: {
    flex: 1,
    justifyContent: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    lineHeight: 20,
  },
  unreadBadge: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  newChatButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newChatButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});