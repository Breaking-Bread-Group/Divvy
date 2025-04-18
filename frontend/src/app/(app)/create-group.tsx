import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, FlatList, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../../components/BackgroundGradient';

export default function CreateExpense() {
  const router = useRouter();
  const [groupTitle, setGroupTitle] = useState('My Group');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([
    { id: '1', title: 'Vacation Trip', members: ['John', 'Sarah', 'Mike'] },
    { id: '2', title: 'Office Lunch', members: ['Emma', 'David'] },
  ]);

  // Mock search results - in a real app, this would come from an API
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (text) => {
    setSearchTerm(text);
    // Mock search functionality - in a real app, this would be an API call
    if (text.trim() === '') {
      setSearchResults([]);
    } else {
      // Mock some search results based on input
      const mockResults = [
        { id: '1', name: `${text} Smith` },
        { id: '2', name: `${text} Johnson` },
        { id: '3', name: `${text} Williams` }
      ];
      setSearchResults(mockResults);
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
    // We don't clear the search term or results here so users can add multiple people
  };

  const removeMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
  };

  const saveGroup = () => {
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
    setGroups([...groups, newGroup]);
    
    // Reset form
    setGroupTitle('My Group');
    setSelectedMembers([]);
    setSearchTerm('');
    setSearchResults([]);
    
    Alert.alert('Success', 'Group created successfully');
  };

  const deleteGroup = (groupId) => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setGroups(groups.filter(group => group.id !== groupId));
          }
        }
      ]
    );
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
                  placeholder="Search for associates"
                />
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={() => handleSearch(searchTerm)}
                >
                  <Feather name="search" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.searchResultItem}>
                        <Text style={styles.searchResultText}>{item.name}</Text>
                        <TouchableOpacity 
                          style={styles.addMemberButton}
                          onPress={() => addMember(item)}
                        >
                          <Feather name="user-plus" size={18} color="#10B981" />
                          <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                      </View>
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
                <Text style={styles.clearSearchButtonText}>Clear Search & Add More Members</Text>
              </TouchableOpacity>
            )}

            {/* Add Member Button */}
            <TouchableOpacity 
              style={styles.addMemberMainButton}
              onPress={() => {
                if (searchTerm.trim() === '') {
                  Alert.alert('Enter Name', 'Please enter a name to search for members');
                } else {
                  handleSearch(searchTerm);
                }
              }}
            >
              <Feather name="user-plus" size={20} color="white" />
              <Text style={styles.addMemberMainButtonText}>Add Member</Text>
            </TouchableOpacity>

            {/* Save Group Button */}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveGroup}
            >
              <Text style={styles.saveButtonText}>Save Group</Text>
            </TouchableOpacity>

            {/* Delete Group Button */}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => Alert.alert('Delete Group', 'This will delete the current group being created')}
            >
              <Text style={styles.deleteButtonText}>Delete Group</Text>
            </TouchableOpacity>

            {/* Existing Groups */}
            <View style={styles.existingGroupsSection}>
              <Text style={styles.sectionTitle}>Existing Groups</Text>
              {groups.map((group) => (
                <View key={group.id} style={[styles.groupContainer, styles.cardShadow]}>
                  <View style={styles.groupHeaderContainer}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <TouchableOpacity onPress={() => deleteGroup(group.id)}>
                      <Feather name="trash-2" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.groupMembersText}>
                    {group.members.join(', ')}
                  </Text>
                </View>
              ))}
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
    color: '#1F2937',
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
    backgroundColor: '#EA580C', // Green-600
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
    backgroundColor: '#EA580C', // Cyan-600
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
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red with opacity
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444', // Red-500
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
});