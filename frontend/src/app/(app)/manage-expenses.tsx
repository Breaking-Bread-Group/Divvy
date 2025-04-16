import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { useAuth } from '../../context/AuthContext';
import { useExpense } from '../../context/ExpenseContext';

export default function ManageExpenses() {
  const router = useRouter();
  const { user } = useAuth();
  const { expenses, fetchExpenses } = useExpense();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        await fetchExpenses();
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (isPaid, isAccepted) => {
    if (isPaid) return '#10B981'; // Green for paid
    if (!isAccepted) return '#EF4444'; // Red for not accepted
    return '#F59E0B'; // Yellow for accepted but not paid
  };

  const getStatusText = (isPaid, isAccepted) => {
    if (isPaid) return 'Paid';
    if (!isAccepted) return 'Pending';
    return 'Accepted';
  };

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
          <Text style={styles.title}>Manage Expenses</Text>
          <View style={styles.headerRight} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FB923C" />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {expenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="file-text" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>No expenses found</Text>
              </View>
            ) : (
              expenses.map((expense) => (
                <TouchableOpacity 
                  key={expense.expense_id}
                  style={styles.expenseCard}
                  onPress={() => router.push(`/(app)/expense/${expense.expense_id}`)}
                >
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(expense.is_paid, expense.is_accepted) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(expense.is_paid, expense.is_accepted)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.groupName}>Group: {expense.group_title}</Text>
                  <Text style={styles.amount}>Amount: ${expense.amount.toFixed(2)}</Text>
                  <Text style={styles.date}>Date: {formatDate(expense.created_at)}</Text>
                  
                  <View style={styles.footer}>
                    <Text style={styles.description}>
                      {expense.description || 'No description provided'}
                    </Text>
                    <Feather name="chevron-right" size={24} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  groupName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
}); 