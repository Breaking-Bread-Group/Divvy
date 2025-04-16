import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CreateExpenseForm } from '../../components/CreateExpenseForm';
import { BackgroundGradient } from '../../components/BackgroundGradient';

export default function CreateExpense() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/groups', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }

      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch groups');
      Alert.alert('Error', 'Failed to load your groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseGroupMembers = async (group) => {
    try {
      // Fetch the group details with member IDs from the backend
      const response = await fetch(`http://localhost:8080/api/groups/${group.id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group details');
      }

      const groupDetails = await response.json();
      console.log('Group details:', groupDetails); // Debug log
      
      // The group details response includes member information
      if (Array.isArray(groupDetails.members)) {
        return groupDetails.members.map(member => ({
          user_id: member.id, // Using id instead of user_id
          name: member.name
        }));
      }

      // If members is a string (from GROUP_CONCAT), parse it
      if (typeof group.members === 'string') {
        // Split by comma and trim whitespace
        const memberNames = group.members.split(',').map(name => name.trim());
        
        // Since we already have the member data from groupDetails, use it
        const membersWithIds = memberNames.map(name => {
          const member = groupDetails.members.find(
            m => m.name === name
          );
          
          if (!member) {
            throw new Error(`Member not found: ${name}`);
          }

          return {
            user_id: member.id, // Using id instead of user_id
            name: name,
          };
        });

        return membersWithIds;
      }

      return [];
    } catch (error) {
      console.error('Error parsing group members:', error);
      Alert.alert('Error', 'Failed to load group members. Please try again.');
      return [];
    }
  };

  const handleGroupSelect = async (group) => {
    try {
      setLoading(true);
      const members = await parseGroupMembers(group);
      setSelectedGroup({ ...group, members });
    } catch (error) {
      console.error('Error selecting group:', error);
      Alert.alert('Error', 'Failed to load group details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => handleGroupSelect(item)}
    >
      <View style={styles.groupInfo}>
        <Text style={styles.groupTitle}>{item.title}</Text>
        <Text style={styles.groupMembers}>{item.members}</Text>
      </View>
      <Feather name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <BackgroundGradient>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </BackgroundGradient>
    );
  }

  if (error) {
    return (
      <BackgroundGradient>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </BackgroundGradient>
    );
  }

  if (selectedGroup) {
    const parsedMembers = selectedGroup.members;

  return (
      <BackgroundGradient>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedGroup(null)}
            >
              <Feather name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Expense</Text>
            <View style={styles.placeholder} />
              </View>
              
          <CreateExpenseForm
            groupId={selectedGroup.id}
            groupMembers={parsedMembers}
            onSubmit={() => {
                        setSelectedGroup(null);
              fetchUserGroups(); // Refresh groups list
            }}
                    />
                  </View>
      </BackgroundGradient>
    );
  }
                
  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <View style={styles.header}>
                <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
                >
            <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
          <Text style={styles.title}>Select Group</Text>
          <View style={styles.placeholder} />
                      </View>
                      
        {groups.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>You haven't joined any groups yet</Text>
                      <TouchableOpacity 
              style={styles.createGroupButton}
              onPress={() => router.push('/(app)/create-group')}
            >
              <Text style={styles.createGroupButtonText}>Create a Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
      </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createGroupButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});