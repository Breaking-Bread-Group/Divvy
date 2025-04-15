import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, FlatList, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../../components/BackgroundGradient';

// API base URL - replace with your actual API URL
const API_BASE_URL = 'http://localhost:8080';

// Storage key for groups
const STORAGE_KEY = '@divvy_groups';

export default function CreateGroup() {
  const router = useRouter();
  const [groupTitle, setGroupTitle] = useState('My Group');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([]);

  // Search results state
  const [searchResults, setSearchResults] = useState([]);
  
  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved groups on initial render
  useEffect(() => {
    loadGroups();
  }, []);

  // Function to load groups from localStorage
  const loadGroups = async () => {
    try {
      setIsLoading(true);
      
      // Check if we're in a browser environment (where localStorage is available)
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedGroups = window.localStorage.getItem(STORAGE_KEY);
        
        if (storedGroups) {
          setGroups(JSON.parse(storedGroups));
        } else {
          // Set default groups only if no saved groups exist
          const defaultGroups = [
            { id: '1', title: 'Vacation Trip', members: ['John Smith', 'Sarah Johnson', 'Mike Williams'] },
            { id: '2', title: 'Office Lunch', members: ['Emma Davis', 'David Brown'] },
          ];
          setGroups(defaultGroups);
          
          // Save default groups to localStorage
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGroups));
        }
      } else {
        // Fallback for non-browser environments
        console.warn('localStorage not available in this environment');
        // Set default groups
        const defaultGroups = [
          { id: '1', title: 'Vacation Trip', members: ['John Smith', 'Sarah Johnson', 'Mike Williams'] },
          { id: '2', title: 'Office Lunch', members: ['Emma Davis', 'David Brown'] },
        ];
        setGroups(defaultGroups);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load saved groups');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save groups to localStorage
  const storeGroups = async (updatedGroups) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));
        console.log('Groups saved to localStorage:', updatedGroups);
      } else {
        console.warn('localStorage not available, groups not saved');
      }
    } catch (error) {
      console.error('Error saving groups:', error);
      Alert.alert('Error', 'Failed to save groups');
    }
  };

  // Function to search users via API
  const searchUsers = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?term=${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Filter out users who are already selected
      const availableUsers = data.filter(
        user => !selectedMembers.some(member => member.id === user.id.toString())
      );
      
      setSearchResults(availableUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      }
    }, 300); // 300ms delay
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);
  
  // Handle search input change
  const handleSearch = (text) => {
    setSearchTerm(text);
    
    if (!text.trim()) {
      setSearchResults([]);
    }
  };

  // Function to get all available users
  const getAllUsers = async () => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Filter out users who are already selected
      const availableUsers = data.filter(
        user => !selectedMembers.some(member => member.id === user.id.toString())
      );
      
      setSearchResults(availableUsers);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setSearchError('Failed to fetch users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = (member) => {
    // Check if member is already added
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
      // Show confirmation toast or feedback
      Alert.alert('Member Added', `${member.name} has been added to the group`, [
        { text: 'OK' }
      ]);
    } else {
      // Notify user the member is already in the group
      Alert.alert('Already Added', `${member.name} is already in the group`);
    }
    // Remove the added user from search results but keep other results visible
    setSearchResults(searchResults.filter(result => result.id !== member.id));
  };

  const removeMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
  };

  const saveGroup = async () => {
    if (groupTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a group title');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please add at least one member');
      return;
    }

    // Create new group
    const newGroup = {
      id: Date.now().toString(),
      title: groupTitle,
      members: selectedMembers.map(member => member.name)
    };

    // Add new group to the list
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    
    // Save to localStorage
    await storeGroups(updatedGroups);
    console.log('Group saved:', newGroup);
    
    // Reset form
    setGroupTitle('My Group');
    setSelectedMembers([]);
    setSearchTerm('');
    setSearchResults([]);
    
    Alert.alert('Success', 'Group created successfully');
  };

  // Enhanced delete group function with immediate visual feedback
  const handleDeleteGroup = (groupId) => {
    console.log('Delete button clicked for group ID:', groupId);
    
    // First, immediately remove the group from the UI
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    
    // Then persist the change to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGroups));
      console.log('Groups updated in localStorage after deletion');
    }
    
    // Optional: Show a brief success message
    Alert.alert('Group Deleted', 'The group has been removed');
  };

  return (
    <ScrollView>
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          {/* Header Icons */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => router.push('/(app)/home')}
            >
              <Feather name="home" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.notificationContainer, styles.iconShadow]}
              onPress={() => router.push('/(app)/notifications')}
            >
              <Feather name="bell" size={24} color="black" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Create Group</Text>

            {/* Title Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Title</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={groupTitle}
                  onChangeText={setGroupTitle}
                  placeholder="Enter group title"
                />
                <TouchableOpacity style={styles.editButton}>
                  <Feather name="edit-2" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Associates Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Associates</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={searchTerm}
                  onChangeText={handleSearch}
                  placeholder="Search for associates by name"
                  autoCapitalize="none"
                />
                {isSearching ? (
                  <ActivityIndicator size="small" color="#EA580C" style={styles.searchButton} />
                ) : (
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={() => searchUsers(searchTerm)}
                  >
                    <Feather name="search" size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Search Error */}
              {searchError && (
                <Text style={styles.errorText}>{searchError}</Text>
              )}
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.searchResultItem}
                        onPress={() => addMember(item)}
                      >
                        <View>
                          <Text style={styles.searchResultText}>{item.name}</Text>
                          <Text style={styles.searchResultEmail}>{item.email}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.addMemberButton}
                          onPress={() => addMember(item)}
                        >
                          <Feather name="user-plus" size={18} color="#10B981" />
                          <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                    style={styles.searchResultsList}
                  />
                </View>
              )}
            </View>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <View style={styles.selectedMembersSection}>
                <Text style={styles.label}>Selected Members</Text>
                <View style={styles.selectedMembersContainer}>
                  {selectedMembers.map((member) => (
                    <View key={member.id} style={styles.memberChip}>
                      <Text style={styles.memberChipText}>{member.name}</Text>
                      <TouchableOpacity onPress={() => removeMember(member.id)}>
                        <Feather name="x" size={16} color="#4B5563" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Button to clear search and add more members */}
            {searchResults.length > 0 && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                }}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}

            {/* Show All Members Button */}
            <TouchableOpacity 
              style={styles.addMemberMainButton}
              onPress={getAllUsers}
              disabled={isSearching}
            >
              {isSearching && searchTerm === '' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="users" size={20} color="white" />
                  <Text style={styles.addMemberMainButtonText}>Show All Associates</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Save Group Button */}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveGroup}
            >
              <Text style={styles.saveButtonText}>Save Group</Text>
            </TouchableOpacity>

            {/* Existing Groups */}
            <View style={styles.existingGroupsSection}>
              <Text style={styles.sectionTitle}>Existing Groups</Text>
              {isLoading ? (
                <ActivityIndicator size="large" color="#EA580C" />
              ) : groups.length > 0 ? (
                groups.map((group) => (
                  <View key={group.id} style={[styles.groupContainer, styles.cardShadow]}>
                    <View style={styles.groupHeaderContainer}>
                      <Text style={styles.groupTitle}>{group.title}</Text>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => {
                          console.log('Delete button pressed for group:', group.title);
                          handleDeleteGroup(group.id);
                        }}
                      >
                        <Feather name="trash-2" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.groupMembersText}>
                      {group.members.join(', ')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noGroupsText}>No groups created yet</Text>
              )}
            </View>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  homeButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  notificationContainer: {
    position: 'relative',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 12,
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 213, 219, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  searchButton: {
    padding: 8,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
    fontSize: 14,
  },
  searchResultsContainer: {
    marginTop: 8,
    maxHeight: 200,
  },
  searchResultsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchResultText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  searchResultEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 4,
    color: '#10B981',
    fontWeight: '500',
  },
  selectedMembersSection: {
    marginBottom: 24,
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 213, 219, 0.7)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  memberChipText: {
    fontSize: 14,
    color: '#1F2937',
    marginRight: 6,
  },
  clearSearchButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)', // Indigo with opacity
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearSearchButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5', // Indigo-600
  },
  addMemberMainButton: {
    backgroundColor: '#EA580C', // Orange-600
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMemberMainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#EA580C', // Orange-600
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  existingGroupsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  noGroupsText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  groupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  groupHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  groupMembersText: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 10,  // Increased padding for larger touch target
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Light red background
    borderRadius: 8,
  },
});