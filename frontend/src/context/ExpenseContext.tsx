import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

interface ExpenseSplit {
  user_id: number;
  amount: number;
  percentage: number;
  is_accepted: boolean;
  is_paid: boolean;
}

interface Expense {
  expense_id: number;
  group_id: number;
  title: string;
  total_amount: number;
  description?: string;
  is_settled: boolean;
  is_active: boolean;
  is_paid: boolean;
  created_by: number;
  created_at: string;
  splits: ExpenseSplit[];
}

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  createExpense: (groupId: number, expenseData: any) => Promise<void>;
  getGroupExpenses: (groupId: number) => Promise<void>;
  fetchExpenses: () => Promise<void>;
  updateExpenseSplit: (expenseId: number, splitId: number, isAccepted: boolean, isPaid: boolean) => Promise<void>;
  deleteExpense: (expenseId: number) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8080/api';

  const createExpense = async (groupId: number, expenseData: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include',
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      const result = await response.json();
      await getGroupExpenses(groupId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      Alert.alert('Error', 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const getGroupExpenses = async (groupId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const updateExpenseSplit = async (
    expenseId: number,
    splitId: number,
    isAccepted: boolean,
    isPaid: boolean
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/splits/${splitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include',
        },
        body: JSON.stringify({ is_accepted: isAccepted, is_paid: isPaid }),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense split');
      }

      // Refresh the expenses list
      const expense = expenses.find(e => e.expense_id === expenseId);
      if (expense) {
        await getGroupExpenses(expense.group_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      Alert.alert('Error', 'Failed to update expense split');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      // Remove the deleted expense from the state
      setExpenses(prevExpenses => prevExpenses.filter(e => e.expense_id !== expenseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      Alert.alert('Error', 'Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        error,
        createExpense,
        getGroupExpenses,
        fetchExpenses,
        updateExpenseSplit,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}; 