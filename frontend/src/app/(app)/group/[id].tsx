import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExpenseList } from '../../../components/ExpenseList';
import { CreateExpenseForm } from '../../../components/CreateExpenseForm';

export default function GroupDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateExpense, setShowCreateExpense] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/groups/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group details');
      }

      const data = await response.json();
      setGroup(data);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{group.title}</Text>
        <TouchableOpacity
          onPress={() => setShowCreateExpense(!showCreateExpense)}
          style={styles.addButton}
        >
          <Feather
            name={showCreateExpense ? 'x' : 'plus'}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {showCreateExpense ? (
          <CreateExpenseForm
            groupId={group.id}
            groupMembers={group.members}
            onSubmit={() => {
              setShowCreateExpense(false);
              fetchGroupDetails();
            }}
          />
        ) : (
          <ExpenseList groupId={group.id} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
}); 