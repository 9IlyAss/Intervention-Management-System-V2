// app/(app)/(client)/ImageViewer.jsx
import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ImageViewer() {
  const { url } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const decodedUrl = decodeURIComponent(url);
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image. The image may be unavailable or the URL may be invalid.');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Viewer</Text>
        <View style={styles.spacer} />
      </View>
      
      <View style={styles.imageContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: decodedUrl }}
            style={styles.image}
            resizeMode="contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height - 100,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
});