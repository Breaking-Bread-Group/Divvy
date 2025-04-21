import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  notification_id: number;
  type: string;
  title: string;
  message: string;
  related_id: number;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notifications', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'group_invite':
        router.push(`/(app)/groups/${notification.related_id}`);
        break;
      case 'expense_added':
        router.push(`/(app)/expenses/${notification.related_id}`);
        break;
      default:
        router.push('/(app)/home');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNotifications}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          {notifications.some(n => !n.is_read) && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        
        <View style={styles.notificationsList}>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications</Text>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity 
                key={notification.notification_id}
                style={styles.notificationItem}
                onPress={() => handleNotificationPress(notification)}
              >
                {!notification.is_read && (
                  <View style={styles.notificationDotContainer}>
                    <View style={styles.notificationItemDot} />
                  </View>
                )}
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationText}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryText: {
    color: '#3B82F6',
    fontSize: 16,
  },
}); 