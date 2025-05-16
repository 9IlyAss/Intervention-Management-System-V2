// app/(app)/(technician)/Assignment.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import technicianService from "../../../services/technicianService";
import * as ImagePicker from "expo-image-picker";
import fileService from "../../../services/fileService";


export default function AssignmentScreen() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "Pending", "in-progress"
  
  // For status update modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState("");
  
  // Fetch interventions on component mount
  useEffect(() => {
    fetchInterventions();
  }, []);
  
  // Filter interventions when filter or interventions change
  useEffect(() => {
    filterInterventions();
  }, [filter, interventions]);
  
  // Function to fetch interventions
  const fetchInterventions = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const data = await technicianService.getTechnicianInterventions();
      
      // Format interventions data
      const formattedInterventions = data.map(intervention => ({
        id: intervention._id || intervention.id,
        title: intervention.title,
        description: intervention.description || 'No description provided',
        clientName: intervention.clientId?.name || 'Unknown Client',
        clientId: intervention.clientId,
        clientAddress: intervention.clientId?.location || 'No address provided',
        clientPhone: intervention.clientId?.phone || 'No phone provided',
        date: new Date(intervention.createdAt || Date.now()).toLocaleDateString(),
        time: new Date(intervention.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        serviceType: intervention.category || 'General',
        status: intervention.status || 'Pending',
        category: intervention.category || 'General Services',
        location: intervention.location || 'No location provided',
        hasAttachments: intervention.attachmentsList?.length > 0,
        attachments: intervention.attachmentsList || []
      }));

      setInterventions(formattedInterventions);
    } catch (err) {
      console.error('Failed to load interventions:', err);
      setError('Failed to load interventions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to filter interventions
  const filterInterventions = () => {
    if (filter === "all") {
      // Show only Pending and in-progress interventions
      setFilteredInterventions(
        interventions.filter(item => 
          item.status === "Pending" || item.status === "In Progress"
        )
      );
    } else if (filter === "Pending") {
      setFilteredInterventions(
        interventions.filter(item => item.status === "Pending")
      );
    } else if (filter === "in-progress") {
      setFilteredInterventions(
        interventions.filter(item => item.status === "In Progress")
      );
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInterventions();
    setRefreshing(false);
  };
  
  // Handle intervention press - open details
  const handleInterventionPress = (intervention) => {
    setSelectedIntervention(intervention);
    setModalVisible(true);
    setNewStatus(intervention.status);
    setPhotos([]);
    setNotes("");
  };
  
  // Update intervention status
// Update intervention status
const updateInterventionStatus = async () => {
  if (!selectedIntervention) return;
  
  try {
    let imageUrls = []
    setIsLoading(true);
    if (photos.length > 0) {
            imageUrls = await fileService.uploadMultipleImages(
            photos, 
          );}
    // Prepare evidence payload
    const evidencePayload = {
      notes: notes.trim(),
      photos: imageUrls
    };

    // Call API to update status
    const updatedIntervention = await technicianService.updateInterventionStatus(
      selectedIntervention.id,
      newStatus,
      evidencePayload
    );

    // Update the local state with the response data
    const updatedInterventions = interventions.map(item => 
      item.id === selectedIntervention.id ? {
        ...item,
        status: updatedIntervention.status,
        hasAttachments: updatedIntervention.evidence?.photos?.length > 0,
        attachments: [
          ...(item.attachments || []),
          ...(updatedIntervention.evidence?.photos || [])
        ]
      } : item
    );

    setInterventions(updatedInterventions);
    setModalVisible(false);
    
    Alert.alert(
      "Status Updated",
      `Intervention status has been updated to ${newStatus}.`
    );
  } catch (err) {
    console.error('Status update error:', err);
    
    let errorMessage = err.message;
    if (err.status === 400) {
      errorMessage = err.details || "Invalid request data";
    } else if (err.status === 404) {
      errorMessage = "Intervention not found";
    }

    Alert.alert(
      "Update Failed",
      errorMessage
    );
  } finally {
    setIsLoading(false);
    setSelectedIntervention(null);
    setPhotos([]);
    setNotes("");
  }
};
  
  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera permissions to take photos"
      );
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };
  
  // Remove photo
  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  
  // Open chat with client
  const handleOpenChat = (clientId) => {
    if (!clientId || !clientId._id) {
      Alert.alert("Error", "Client information is not available.");
      return;
    }
    
    const chatRoomId = clientId._id; // Using client ID as chat room ID
    const clientName = clientId.name || "Client";
    const clientImage = clientId.profileImage || null;
    
    router.push({
      pathname: `/(app)/(technician)/conversation/${chatRoomId}`,
      params: { 
        clientName: clientName,
        clientImage: clientImage
      }
    });
  };
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FF9800'; // Orange
      case 'In Progress':
        return '#2196F3'; // Blue
      case 'Completed':
        return '#4CAF50'; // Green
      case 'Cancelled':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };
  
  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    if (!category) return 'construct';
    
    switch (category.toLowerCase()) {
      case 'it services':
        return 'desktop-outline';
      case 'surveillance':
        return 'videocam';
      case 'telephony':
        return 'call';
      case 'printers':
        return 'print';
      case 'software':
        return 'code-slash';
      case 'office supplies':
        return 'briefcase';
      case 'maintenance':
        return 'hammer';
      case 'alarms':
        return 'notifications';
      case 'sound systems':
        return 'volume-high';
      default:
        return 'construct';
    }
  };

  // Render intervention item
  const renderInterventionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.interventionCard}
      onPress={() => handleInterventionPress(item)}
    >
      <View style={styles.interventionHeader}>
        <View style={styles.interventionStatus}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(item.status) }
            ]} 
          />
          <Text style={[
            styles.statusText, 
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        
        <View style={styles.interventionDateContainer}>
          <Ionicons name="calendar" size={14} color="#757575" />
          <Text style={styles.interventionDate}>{item.date} · {item.time}</Text>
        </View>
      </View>
      
      <Text style={styles.interventionTitle}>{item.title}</Text>
      
      <View style={styles.clientInfoContainer}>
        {item.clientId?.profileImage ? (
          <Image source={{ uri: item.clientId.profileImage }} style={styles.clientImage} />
        ) : (
          <View style={styles.clientImagePlaceholder}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.clientDetails}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.clientAddress} numberOfLines={1}>{item.location || item.clientAddress}</Text>
        </View>
      </View>
      
      <View style={styles.interventionFooter}>
        <View style={styles.categoryContainer}>
          <Ionicons 
            name={getCategoryIcon(item.category)} 
            size={14} 
            color="#6200EE" 
          />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        
        <View style={styles.interventionActions}>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => handleOpenChat(item.clientId)}
          >
            <Ionicons name="chatbubble" size={16} color="#6200EE" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Assignments</Text>
        <View style={{ width: 40 }} /> 
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && styles.activeFilterTab
          ]}
          onPress={() => setFilter("all")}
        >
          <Text style={[
            styles.filterTabText,
            filter === "all" && styles.activeFilterTabText
          ]}>
            All Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "Pending" && styles.activeFilterTab
          ]}
          onPress={() => setFilter("Pending")}
        >
          <Text style={[
            styles.filterTabText,
            filter === "Pending" && styles.activeFilterTabText
          ]}>
            Pending
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "in-progress" && styles.activeFilterTab
          ]}
          onPress={() => setFilter("in-progress")}
        >
          <Text style={[
            styles.filterTabText,
            filter === "in-progress" && styles.activeFilterTabText
          ]}>
            In Progress
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Intervention List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchInterventions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredInterventions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>No active assignments found</Text>
          <Text style={styles.emptySubText}>
            When you get new assignments, they will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredInterventions}
          renderItem={renderInterventionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6200EE"]} />
          }
        />
      )}
      
      {/* Intervention Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Intervention Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedIntervention && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={styles.statusChipContainer}>
                      <TouchableOpacity
                        style={[
                          styles.statusChip,
                          newStatus === "Pending" && { backgroundColor: "#FFF8E1", borderColor: "#FF9800" }
                        ]}
                        onPress={() => setNewStatus("Pending")}
                      >
                        <Text style={[
                          styles.statusChipText,
                          newStatus === "Pending" && { color: "#FF9800" }
                        ]}>
                          Pending
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.statusChip,
                          newStatus === "In Progress" && { backgroundColor: "#E3F2FD", borderColor: "#2196F3" }
                        ]}
                        onPress={() => setNewStatus("In Progress")}
                      >
                        <Text style={[
                          styles.statusChipText,
                          newStatus === "In Progress" && { color: "#2196F3" }
                        ]}>
                          In Progress
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.statusChip,
                          newStatus === "Completed" && { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" }
                        ]}
                        onPress={() => setNewStatus("Completed")}
                      >
                        <Text style={[
                          styles.statusChipText,
                          newStatus === "Completed" && { color: "#4CAF50" }
                        ]}>
                          Completed
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.statusChip,
                          newStatus === "Cancelled" && { backgroundColor: "#FFEBEE", borderColor: "#F44336" }
                        ]}
                        onPress={() => setNewStatus("Cancelled")}
                      >
                        <Text style={[
                          styles.statusChipText,
                          newStatus === "Cancelled" && { color: "#F44336" }
                        ]}>
                          Cancelled
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Title</Text>
                    <Text style={styles.detailValue}>{selectedIntervention.title}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedIntervention.description}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <View style={styles.detailRow}>
                      <Ionicons 
                        name={getCategoryIcon(selectedIntervention.category)} 
                        size={16} 
                        color="#6200EE" 
                      />
                      <Text style={[styles.detailValue, { marginLeft: 8 }]}>
                        {selectedIntervention.category}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{selectedIntervention.location}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Client</Text>
                    <View style={styles.clientRow}>
                      {selectedIntervention.clientId?.profileImage ? (
                        <Image 
                          source={{ uri: selectedIntervention.clientId.profileImage }} 
                          style={styles.detailClientImage} 
                        />
                      ) : (
                        <View style={styles.detailClientImagePlaceholder}>
                          <Ionicons name="person" size={16} color="#FFFFFF" />
                        </View>
                      )}
                      <View style={styles.clientInfo}>
                        <Text style={styles.clientNameDetail}>{selectedIntervention.clientName}</Text>
                        <Text style={styles.clientContact}>{selectedIntervention.clientPhone}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Existing Attachments */}
                  {selectedIntervention.hasAttachments && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Existing Attachments</Text>
                      <View style={styles.attachmentsContainer}>
                        {selectedIntervention.attachments.map((attachment, index) => (
                          <View key={index} style={styles.attachmentItem}>
                            <Image source={{ uri: attachment }} style={styles.attachmentThumbnail} />
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {(newStatus === "Completed" || newStatus === "Cancelled") && (
  <>
    {/* Photo Upload Section */}
    <View style={styles.detailSection}>
      <Text style={styles.detailLabel}>
        Add Photos
        <Text style={styles.requiredText}> (Required)</Text>
      </Text>

      <View style={styles.photoContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoPreview}>
            <Image source={{ uri: photo }} style={styles.photoImage} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={22} color="#F44336" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Buttons to pick/take photo */}
        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#6200EE" />
            <Text style={styles.photoButtonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#6200EE" />
            <Text style={styles.photoButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>

    {/* Notes Section */}
    <View style={styles.detailSection}>
      <Text style={styles.detailLabel}>Notes (Optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Add any notes about this intervention..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  </>
)}

                  
                  
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.updateButton}
                onPress={updateInterventionStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Status</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filterTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeFilterTab: {
    backgroundColor: "#EDE7F6",
    borderColor: "#6200EE",
  },
  filterTabText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: "#6200EE",
    fontWeight: "600",
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Extra space for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6200EE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
  },
  interventionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  interventionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  interventionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  interventionDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  interventionDate: {
    fontSize: 12,
    color: "#757575",
    marginLeft: 4,
  },
  interventionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  clientInfoContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  clientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clientImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#BDBDBD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  clientAddress: {
    fontSize: 12,
    color: "#757575",
  },
  interventionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: "#6200EE",
    marginLeft: 8,
    fontWeight: "500",
  },
  interventionActions: {
    flexDirection: "row",
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(98, 0, 238, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    marginRight: 8,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  updateButton: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6200EE",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F7FA",
    marginRight: 8,
    marginBottom: 8,
  },
  statusChipText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailClientImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  detailClientImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#BDBDBD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientNameDetail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  clientContact: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 2,
  },
  notesInput: {
    minHeight: 100,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  requiredText: {
    color: "#F44336",
    fontWeight: "normal",
  },
  photoContainer: {
    marginTop: 8,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  photoButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F3E5F5",
    marginHorizontal: 8,
  },
  photoButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#6200EE",
  },
  attachmentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  attachmentItem: {
  width: 80,
  height: 80,
  borderRadius: 8, 
  overflow: "hidden",
  marginRight: 8,
  marginBottom: 8,
},
  attachmentThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
