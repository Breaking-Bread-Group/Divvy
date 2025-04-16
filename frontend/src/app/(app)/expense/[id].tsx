import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackgroundGradient } from '../../../components/BackgroundGradient';
import { useAuth } from '../../../context/AuthContext';
import { useExpense } from '../../../context/ExpenseContext';

export default function ExpenseDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { expenses, updateExpenseSplit } = useExpense();
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState(null);
  const [userSplit, setUserSplit] = useState(null);

  useEffect(() => {
    const foundExpense = expenses.find(e => e.expense_id === parseInt(id));
    if (foundExpense) {
      setExpense(foundExpense);
      const split = foundExpense.splits.find(s => s.user_id === user.id);
      setUserSplit(split);
    }
  }, [expenses, id, user.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      await updateExpenseSplit(expense.expense_id, userSplit.split_id, true, userSplit.is_paid);
      Alert.alert('Success', 'Expense accepted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept expense');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setLoading(true);
      await updateExpenseSplit(expense.expense_id, userSplit.split_id, userSplit.is_accepted, true);
      Alert.alert('Success', 'Expense marked as paid');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark expense as paid');
    } finally {
      setLoading(false);
    }
  };

  if (!expense) {
    return (
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FB923C" />
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Expense Details</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.expenseCard}>
            <Text style={styles.expenseTitle}>{expense.title}</Text>
            <Text style={styles.groupName}>Group: {expense.group_title}</Text>
            <Text style={styles.amount}>Total Amount: ${Number(expense.total_amount || 0).toFixed(2)}</Text>
            <Text style={styles.date}>Date: {formatDate(expense.created_at)}</Text>
            <Text style={styles.description}>
              {expense.description || 'No description provided'}
            </Text>
          </View>

          <View style={styles.splitsSection}>
            <Text style={styles.sectionTitle}>Splits</Text>
            {expense.splits.map((split) => (
              <View key={split.split_id} style={styles.splitCard}>
                <View style={styles.splitHeader}>
                  <Text style={styles.splitName}>{split.user_name}</Text>
                  <Text style={styles.splitAmount}>${split.amount.toFixed(2)}</Text>
                </View>
                <View style={styles.splitDetails}>
                  <Text style={styles.splitPercentage}>{split.percentage}%</Text>
                  <View style={styles.splitStatus}>
                    <Text style={[
                      styles.statusText,
                      { color: split.is_accepted ? '#10B981' : '#EF4444' }
                    ]}>
                      {split.is_accepted ? 'Accepted' : 'Pending'}
                    </Text>
                    <Text style={[
                      styles.statusText,
                      { color: split.is_paid ? '#10B981' : '#F59E0B' }
                    ]}>
                      {split.is_paid ? 'Paid' : 'Unpaid'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {userSplit && (
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Your Actions</Text>
              <View style={styles.actionButtons}>
                {!userSplit.is_accepted && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={handleAccept}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>Accept Expense</Text>
                  </TouchableOpacity>
                )}
                {userSplit.is_accepted && !userSplit.is_paid && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.payButton]}
                    onPress={handleMarkAsPaid}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>Mark as Paid</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>
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
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  expenseTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 8,
  },
  splitsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  splitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  splitName: {
    fontSize: 16,
    fontWeight: '600',
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  splitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  splitStatus: {
    flexDirection: 'row',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  payButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 