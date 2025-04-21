import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  description: string;
  status: string;
}

export default function PaymentSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/25' },
    { id: '2', last4: '1881', brand: 'Mastercard', expiry: '03/26' },
  ]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([
    { id: '1', amount: 25.00, date: '2024-04-15', description: 'Dinner with friends', status: 'Completed' },
    { id: '2', amount: 50.00, date: '2024-04-10', description: 'Movie night', status: 'Completed' },
    { id: '3', amount: 75.00, date: '2024-04-05', description: 'Weekend trip', status: 'Pending' },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#065F46';
      case 'pending':
        return '#B45309';
      default:
        return '#7C2D12';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Icons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
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

      <ScrollView style={styles.content}>
        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={[styles.paymentCard, styles.cardShadow]}>
                <View style={styles.paymentCardHeader}>
                  <Text style={styles.cardBrand}>{method.brand}</Text>
                  <TouchableOpacity style={styles.editButton}>
                    <Feather name="edit-2" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
                <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.addCardButton, styles.cardShadow]}>
              <Feather name="plus" size={24} color="#4B5563" />
              <Text style={styles.addCardText}>Add New Card</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <View style={styles.paymentHistory}>
            {paymentHistory.map((payment) => (
              <View key={payment.id} style={[styles.paymentItem, styles.cardShadow]}>
                <View style={styles.paymentItemHeader}>
                  <Text style={styles.paymentDescription}>{payment.description}</Text>
                  <Text style={[styles.paymentStatus, { color: getStatusColor(payment.status) }]}>
                    {payment.status}
                  </Text>
                </View>
                <View style={styles.paymentItemDetails}>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                  <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  paymentMethods: {
    gap: 16,
  },
  paymentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  editButton: {
    padding: 8,
  },
  cardNumber: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#6B7280',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  paymentHistory: {
    gap: 12,
  },
  paymentItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  paymentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  paymentDate: {
    fontSize: 14,
    color: '#6B7280',
  },
}); 