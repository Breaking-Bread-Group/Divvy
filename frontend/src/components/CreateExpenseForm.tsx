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
            value={title}
            onChangeText={setTitle}
            placeholder="Enter expense title"
          />
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Description</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
          />
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Split Options */}
      <View style={styles.splitSection}>
        <Text style={styles.label}>Split Options</Text>
        <View style={styles.splitButtonsContainer}>
          <TouchableOpacity
            style={[styles.splitButton, styles.cardShadow, splitType === 'even' && styles.activeButton]}
            onPress={() => setSplitType('even')}
          >
            <Feather name="divide" size={20} color={splitType === 'even' ? "#FFFFFF" : "#1F2937"} />
            <Text style={[styles.splitButtonText, splitType === 'even' && styles.activeButtonText]}>
              Split Evenly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.splitButton, styles.cardShadow, splitType === 'percentage' && styles.activeButton]}
            onPress={() => setSplitType('percentage')}
          >
            <Feather name="percent" size={20} color={splitType === 'percentage' ? "#FFFFFF" : "#1F2937"} />
            <Text style={[styles.splitButtonText, splitType === 'percentage' && styles.activeButtonText]}>
              By Percentage
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.splitButton, styles.cardShadow, splitType === 'amount' && styles.activeButton]}
            onPress={() => setSplitType('amount')}
          >
            <Text style={[styles.dollarSymbol, splitType === 'amount' && styles.activeButtonText]}>$</Text>
            <Text style={[styles.splitButtonText, splitType === 'amount' && styles.activeButtonText]}>
              By Amount
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Member Splits */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Splits</Text>
        {selectedMembers.map((member) => (
          <View key={member.user_id} style={[styles.memberSplit, styles.cardShadow]}>
            <Text style={styles.memberName}>{member.name}</Text>
            {splitType === 'percentage' ? (
              <TextInput
                style={styles.percentageInput}
                value={member.percentage?.toFixed(1) || ''}
                onChangeText={(text) => updateMemberPercentage(member.user_id, text)}
                keyboardType="numeric"
                placeholder="0.0"
              />
            ) : splitType === 'amount' ? (
              <TextInput
                style={styles.amountInput}
                value={member.amount?.toFixed(2) || ''}
                onChangeText={(text) => updateMemberAmount(member.user_id, text)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            ) : null}
            <Text style={styles.splitAmount}>
              ${member.amount?.toFixed(2)}
            </Text>
          </View>
        ))}
        {splitType === 'percentage' && (
          <Text style={styles.totalPercentage}>
            Total: {selectedMembers.reduce((sum, member) => sum + (member.percentage || 0), 0).toFixed(1)}%
          </Text>
        )}
        {splitType === 'amount' && (
          <Text style={[
            styles.totalAmount,
            Math.abs(parseFloat(amount) - selectedMembers.reduce((sum, member) => sum + (member.amount || 0), 0)) > 0.01
              ? styles.amountWarning
              : styles.amountSuccess
          ]}>
            Remaining: ${(parseFloat(amount) - selectedMembers.reduce((sum, member) => sum + (member.amount || 0), 0)).toFixed(2)}
          </Text>
        )}
      </View>

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleSubmit}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 213, 219, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  currencySymbol: {
    fontSize: 18,
    color: '#1F2937',
    marginRight: 4,
  },
  editButton: {
    padding: 8,
  },
  splitSection: {
    marginBottom: 32,
  },
  splitButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  splitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#EA580C',
  },
  splitButtonText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  dollarSymbol: {
    fontSize: 16,
    color: '#1F2937',
  },
  memberSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#1F2937',
  },
  percentageInput: {
    width: 60,
    height: 36,
    backgroundColor: 'rgba(209, 213, 219, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  amountInput: {
    width: 80,
    height: 36,
    backgroundColor: 'rgba(209, 213, 219, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  splitAmount: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#EA580C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  totalPercentage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
  },
  totalAmount: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '600',
  },
  amountWarning: {
    color: '#DC2626', // red
  },
  amountSuccess: {
    color: '#059669', // green
  },
}); 