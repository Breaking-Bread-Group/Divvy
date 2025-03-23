import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../../components/BackgroundGradient';

export default function CreateExpense() {
  const router = useRouter();

  return (
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
          <Text style={styles.title}>Create Expense</Text>

          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value="Company Dinner"
                placeholder="Enter expense title"
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
                placeholder="Search for associates"
              />
              <TouchableOpacity style={styles.searchButton}>
                <Feather name="search" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Group Display */}
          <TouchableOpacity 
            style={[styles.groupContainer, styles.cardShadow]}
            onPress={() => {
              // TODO: Add group action
              console.log('Group pressed');
            }}
          >
            <Text style={styles.groupText}>Company Dinner Party (Group)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundGradient>
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
  groupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  groupText: {
    fontSize: 16,
    color: '#1F2937',
  },
}); 