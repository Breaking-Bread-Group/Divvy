import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useExpense } from '../context/ExpenseContext';
import { format } from 'date-fns';

interface ExpenseListProps {
  groupId: number;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ groupId }) => {
  const { expenses, loading, error, getGroupExpenses } = useExpense();

  useEffect(() => {
    getGroupExpenses(groupId);
  }, [groupId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderExpense = ({ item }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseAmount}>${item.total_amount.toFixed(2)}</Text>
      </View>
      
      <Text style={styles.expenseDescription}>{item.description || 'No description'}</Text>
      
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDate}>
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>
        <Text style={styles.expenseCreator}>
          Created by: {item.created_by_name}
        </Text>
      </View>

      <View style={styles.splitsContainer}>
        <Text style={styles.splitsTitle}>Splits:</Text>
        {item.splits.map((split, index) => (
          <View key={index} style={styles.splitItem}>
            <Text style={styles.splitName}>{split.user_name}</Text>
            <View style={styles.splitDetails}>
              <Text style={styles.splitAmount}>${split.amount.toFixed(2)}</Text>
              <Text style={styles.splitPercentage}>({split.percentage}%)</Text>
              <View style={styles.splitStatus}>
                {split.is_accepted ? (
                  <Feather name="check-circle" size={16} color="green" />
                ) : (
                  <Feather name="x-circle" size={16} color="red" />
                )}
                {split.is_paid ? (
                  <Feather name="dollar-sign" size={16} color="green" style={styles.paidIcon} />
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <FlatList
      data={expenses}
      renderItem={renderExpense}
      keyExtractor={item => item.expense_id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  expenseCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
  expenseCreator: {
    fontSize: 12,
    color: '#999',
  },
  splitsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  splitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  splitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  splitName: {
    fontSize: 14,
    flex: 1,
  },
  splitDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  splitPercentage: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  splitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidIcon: {
    marginLeft: 4,
  },
}); 