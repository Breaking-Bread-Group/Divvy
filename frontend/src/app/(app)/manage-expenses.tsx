import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BackgroundGradient } from '../../components/BackgroundGradient';

const STORAGE_KEY = '@divvy_expenses';

export default function ManageExpenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEY) || '[]'
      : '[]';
    setExpenses(JSON.parse(stored));
  }, []);

  const deleteExpense = (id) => {
    Alert.alert('Delete expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = expenses.filter(e => e.id !== id);
          setExpenses(filtered);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => deleteExpense(item.id)}>
      <View>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSub}>
          ${item.amount.toFixed(2)} • {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Feather name="trash" size={20} color="#EF4444" />
    </TouchableOpacity>
  );

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.page}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Expenses</Text>
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No expenses yet.</Text>}
        />
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  sep: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSub: { fontSize: 12, color: '#6B7280' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6B7280' },
  backBtn: { marginBottom: 12 },
});
