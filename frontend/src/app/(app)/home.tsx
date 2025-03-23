import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile and Bell */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(app)/account')}
        >
          <Image
            source={require('../../assets/Account_Settings.png')}
            style={styles.profileImage}
          />
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
        <Text style={styles.title}>Latest Expenses</Text>
        <Text style={styles.subtitle}>Some expenses need your attention</Text>

        {/* Expense Card */}
        <LinearGradient
          colors={['#FED7AA', '#FB923C', '#EA580C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.expenseCard, styles.cardShadow]}
        >
          <View style={styles.expenseHeader}>
            <Text style={[styles.expenseStatus, { color: '#7C2D12' }]}>Awaiting</Text>
            <Text style={[styles.expenseTitle, { color: '#7C2D12' }]}>Acceptance</Text>
          </View>
          <Text style={[styles.expenseDescription, { color: '#7C2D12' }]}>"Company Dinner"</Text>
          <Text style={[styles.expenseDate, { color: '#7C2D12' }]}>Mar-24 2025</Text>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            <View style={[styles.dot, { backgroundColor: '#7C2D12', opacity: 0.3 }]} />
            <View style={[styles.dot, { backgroundColor: '#7C2D12', opacity: 0.3 }]} />
            <View style={[styles.activeDot, { backgroundColor: '#7C2D12', opacity: 0.7 }]} />
          </View>
        </LinearGradient>

        {/* Total Section */}
        <View style={[styles.totalSection, styles.cardShadow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>$257.85</Text>
          <View style={styles.contributionRow}>
            <Text style={styles.contributionLabel}>Your contribution:</Text>
            <Text style={styles.contributionAmount}>$42.98 (16.67%)</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cardShadow]}
            onPress={() => router.push('/(app)/home')}
          >
            <LinearGradient
              colors={['#FFEDD5', '#FED7AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Feather name="users" size={24} color="#EA580C" />
              <Text style={[styles.actionButtonText, { color: '#EA580C' }]}>
                Manage{'\n'}Groups
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.cardShadow]}
            onPress={() => router.push('/(app)/home')}
          >
            <LinearGradient
              colors={['#FFEDD5', '#FED7AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Feather name="plus" size={24} color="#EA580C" />
              <Text style={[styles.actionButtonText, { color: '#EA580C' }]}>
                Create{'\n'}Expense
              </Text>
            </LinearGradient>
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
  profileButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  expenseCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  expenseHeader: {
    marginBottom: 16,
  },
  expenseStatus: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
  },
  expenseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  expenseDescription: {
    fontSize: 20,
    fontStyle: 'italic',
    marginBottom: 4,
    color: '#000',
  },
  expenseDate: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    marginBottom: 16,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    opacity: 0.7,
  },
  totalSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
  },
  totalLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 4,
  },
  contributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contributionLabel: {
    fontSize: 14,
    color: '#000',
  },
  contributionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
}); 