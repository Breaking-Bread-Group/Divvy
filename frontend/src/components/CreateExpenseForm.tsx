import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useExpense } from '../context/ExpenseContext';

interface CreateExpenseFormProps {
  groupId: number;
  groupMembers: Array<{
    user_id: number;
    name: string;
  }>;
  onSubmit: () => void;
}

export const CreateExpenseForm: React.FC<CreateExpenseFormProps> = ({
  groupId,
  groupMembers,
  onSubmit,
}) => {
  const { createExpense } = useExpense();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState<'even' | 'percentage' | 'amount'>('even');
  const [selectedMembers, setSelectedMembers] = useState<Array<{
    user_id: number;
    name: string;
    amount?: number;
    percentage?: number;
  }>>([]);

  useEffect(() => {
    // Initialize with all group members
    setSelectedMembers(
      groupMembers.map(member => ({
        ...member,
        amount: 0,
        percentage: 100 / groupMembers.length,
      }))
    );
  }, [groupMembers]);

  const calculateSplits = () => {
    if (!amount || selectedMembers.length === 0) return;

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return;

    let updatedMembers = [...selectedMembers];

    if (splitType === 'even') {
      const perPersonAmount = totalAmount / selectedMembers.length;
      updatedMembers = selectedMembers.map(member => ({
        ...member,
        amount: perPersonAmount,
        percentage: 100 / selectedMembers.length,
      }));
    } else if (splitType === 'percentage') {
      const totalPercentage = selectedMembers.reduce((sum, member) => sum + (member.percentage || 0), 0);
      if (totalPercentage !== 100) {
        Alert.alert('Error', 'Total percentage must equal 100%');
        return;
      }
      updatedMembers = selectedMembers.map(member => ({
        ...member,
        amount: (totalAmount * (member.percentage || 0)) / 100,
      }));
    }

    setSelectedMembers(updatedMembers);
  };

  useEffect(() => {
    calculateSplits();
  }, [amount, splitType, selectedMembers.length]);

  const updateMemberPercentage = (userId: number, percentage: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = percentage.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    
    // Format to one decimal place
    let formattedValue = parts[0];
    if (parts.length === 2) {
      formattedValue += '.' + parts[1].slice(0, 1);
    }

    const newPercentage = parseFloat(formattedValue);
    if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
      return;
    }

    setSelectedMembers(prevMembers =>
      prevMembers.map(member =>
        member.user_id === userId
          ? { ...member, percentage: newPercentage }
          : member
      )
    );
  };

  const updateMemberAmount = (userId: number, amount: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = amount.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    
    // Format to two decimal places
    let formattedValue = parts[0];
    if (parts.length === 2) {
      formattedValue += '.' + parts[1].slice(0, 2);
    }

    const newAmount = parseFloat(formattedValue);
    if (isNaN(newAmount) || newAmount < 0) {
      return;
    }

    setSelectedMembers(prevMembers =>
      prevMembers.map(member =>
        member.user_id === userId
          ? { ...member, amount: newAmount }
          : member
      )
    );
  };

  const validatePercentages = () => {
    const totalPercentage = selectedMembers.reduce((sum, member) => sum + (member.percentage || 0), 0);
    return Math.abs(totalPercentage - 100) <= 0.1;
  };

  const validateAmounts = () => {
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid total amount');
      return false;
    }

    const sumOfSplits = selectedMembers.reduce((sum, member) => sum + (member.amount || 0), 0);
    const difference = Math.abs(sumOfSplits - totalAmount);
    
    if (difference > 0.01) {
      Alert.alert(
        'Amount Mismatch',
        `The sum of splits ($${sumOfSplits.toFixed(2)}) does not equal the total amount ($${totalAmount.toFixed(2)}).\n\nRemaining: $${(totalAmount - sumOfSplits).toFixed(2)}`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!title || !amount || selectedMembers.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (splitType === 'percentage' && !validatePercentages()) {
      Alert.alert('Error', 'Total percentage must equal 100%');
      return;
    }

    if (splitType === 'amount' && !validateAmounts()) {
      return; // Error message already shown in validateAmounts
    }

    try {
      const totalAmount = parseFloat(amount);
      const requestBody = {
        title,
        total_amount: totalAmount.toFixed(2),
        description,
        split_type: splitType,
        splits: selectedMembers.map(member => {
          let splitAmount;
          let splitPercentage;

          if (splitType === 'even') {
            splitAmount = totalAmount / selectedMembers.length;
            splitPercentage = 100 / selectedMembers.length;
          } else if (splitType === 'percentage') {
            splitAmount = (totalAmount * (member.percentage || 0)) / 100;
            splitPercentage = member.percentage || 0;
          } else {
            // For manual amounts, calculate percentage based on the member's amount
            splitAmount = member.amount || 0;
            splitPercentage = (splitAmount / totalAmount) * 100;
          }

          return {
            user_id: member.user_id,
            amount: parseFloat(splitAmount.toFixed(2)),
            percentage: parseFloat(splitPercentage.toFixed(1))
          };
        })
      };

      console.log('Submitting expense:', requestBody);

      const response = await fetch(`http://localhost:8080/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('Error', 'Please log in to create an expense');
          return;
        }
        const errorText = await response.text();
        throw new Error(`Failed to create expense: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Expense created successfully:', result);
      
      Alert.alert('Success', 'Expense created successfully');
      onSubmit();
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', error.message || 'Failed to create expense. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Title</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter expense title"
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Description</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter expense description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Split Type Selection */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Split Type</Text>
        <View style={styles.splitTypeContainer}>
          <TouchableOpacity
            style={[styles.splitTypeButton, splitType === 'even' && styles.splitTypeButtonActive]}
            onPress={() => setSplitType('even')}
          >
            <Text style={[styles.splitTypeText, splitType === 'even' && styles.splitTypeTextActive]}>
              Even
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.splitTypeButton, splitType === 'percentage' && styles.splitTypeButtonActive]}
            onPress={() => setSplitType('percentage')}
          >
            <Text style={[styles.splitTypeText, splitType === 'percentage' && styles.splitTypeTextActive]}>
              Percentage
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.splitTypeButton, splitType === 'amount' && styles.splitTypeButtonActive]}
            onPress={() => setSplitType('amount')}
          >
            <Text style={[styles.splitTypeText, splitType === 'amount' && styles.splitTypeTextActive]}>
              Amount
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Member Splits */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Split Details</Text>
        {selectedMembers.map((member) => (
          <View key={member.user_id} style={styles.memberSplitContainer}>
            <Text style={styles.memberName}>{member.name}</Text>
            {splitType === 'percentage' ? (
              <View style={styles.percentageInputContainer}>
                <TextInput
                  style={styles.percentageInput}
                  value={member.percentage?.toString() || ''}
                  onChangeText={(value) => updateMemberPercentage(member.user_id, value)}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
            ) : (
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={member.amount?.toString() || ''}
                  onChangeText={(value) => updateMemberAmount(member.user_id, value)}
                  keyboardType="decimal-pad"
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  splitTypeButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  splitTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  splitTypeTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  memberSplitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#1F2937',
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  percentageInput: {
    fontSize: 16,
    color: '#1F2937',
    width: 60,
    textAlign: 'right',
  },
  percentageSymbol: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 16,
    color: '#1F2937',
    width: 80,
  },
  submitButton: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 