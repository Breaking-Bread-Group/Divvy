import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Notifications() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile and Bell */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/(app)/home')}
        >
          <Feather name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.notificationContainer}
          onPress={() => router.back()}
        >
          <Feather name="bell" size={24} color="black" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        
        <View style={styles.notificationsList}>
          {/* Notification 1 */}
          <TouchableOpacity 
            style={styles.notificationItem}
            onPress={() => router.push('/(app)/home')}
          >
            <View style={styles.notificationDotContainer}>
              <View style={styles.notificationItemDot} />
            </View>
            <Text style={styles.notificationText}>
              You've been requested to join the group "Company Dinner Party"
            </Text>
          </TouchableOpacity>

          {/* Notification 2 */}
          <TouchableOpacity 
            style={styles.notificationItem}
            onPress={() => router.push('/(app)/home')}
          >
            <Text style={styles.notificationText}>
              "Roommates" group has created a new expense "Monthly Rent"
            </Text>
          </TouchableOpacity>

          {/* Notification 3 */}
          <TouchableOpacity 
            style={styles.notificationItem}
            onPress={() => router.push('/(app)/home')}
          >
            <Text style={styles.notificationText}>
              John Anderson has invited you to expense "Lunch"
            </Text>
          </TouchableOpacity>

           {/* Notification 4 */}
          <TouchableOpacity 
            style={styles.notificationItem}
            onPress={() => router.push('/(app)/home')}
          >
            <Text style={styles.notificationText}>
              Your new group "Divvy Demo" has been created
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  notificationsList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  notificationDotContainer: {
    width: 24,
    paddingTop: 8,
  },
  notificationItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  notificationText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
}); 
