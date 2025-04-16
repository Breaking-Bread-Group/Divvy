import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../../components/BackgroundGradient';

export default function CreateExpense() {
  const router = useRouter();

  return (
    <ScrollView>
    <BackgroundGradient>import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import Notifications from './notifications';

export default function CreateExpense() {
  const router = useRouter();
  const [amount, setAmount] = useState("");

  const handleAmountChange = (text: string) => {
    // Remove all non-numeric characters except for one optional decimal
    const sanitized = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimals
    if ((sanitized.match(/\./g) || []).length > 1) return;

    setAmount(sanitized);
  }

  return (
    <ScrollView>
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        {/* Header Icons */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.homeButton}
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

        <View style={styles.content}>
          <Text style={styles.title}>Create Expense</Text>

          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value="Company Dinner"
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
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleAmountChange}
              />
              <TouchableOpacity style={styles.editButton}>
                <Feather name="edit-2" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Associates Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Associates</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search for associates"
              />
              <TouchableOpacity style={styles.searchButton}>
                <Feather name="search" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Group Display */}
          <TouchableOpacity 
            style={[styles.groupContainer, styles.cardShadow]}
            onPress={() => {
              // TODO: Add group action
              console.log('Group pressed');
            }}
          >
            <Text style={styles.groupText}>Company Dinner Party (Group)</Text>
          </TouchableOpacity>

          {/* Split Options */}
          <View style={styles.splitSection}>
            <Text style={styles.label}>Split Options</Text>
            <View style={styles.splitButtonsContainer}>
              <TouchableOpacity 
                style={[styles.splitButton, styles.cardShadow, styles.activeButton]}
                onPress={() => console.log('Split evenly')}
              >
                <Feather name="divide" size={20} color="#FFFFFF" />
                <Text style={[styles.splitButtonText, styles.activeButtonText]}>Split Evenly</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.splitButton, styles.cardShadow]}
                onPress={() => console.log('Split by percentage')}
              >
                <Feather name="percent" size={20} color="#1F2937" />
                <Text style={styles.splitButtonText}>By Percentage</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.splitButton, styles.cardShadow]}
                onPress={() => console.log('Split by amount')}
              >
                <Text style={styles.dollarSymbol}>$</Text>
                <Text style={styles.splitButtonText}>By Amount</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Done Button */}
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => {
              new Notification('newExpense');
              console.log('Done pressed');
              router.back();
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundGradient>
    </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
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
  searchButton: {
    padding: 8,
  },
  groupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  groupText: {
    fontSize: 16,
    color: '#1F2937',
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
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    height: 48,
  },
  activeButton: {
    backgroundColor: '#EA580C',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  splitButtonText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 6,
    fontWeight: '500',
  },
  dollarSymbol: {
    fontSize: 18,
    color: '#1F2937',
    marginRight: 2,
  },
  doneButton: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

function setValue(formatted: string) {
  throw new Error('Function not implemented.');
}

      <SafeAreaView style={styles.container}>
        {/* Header Icons */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.homeButton}
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

        <View style={styles.content}>
          <Text style={styles.title}>Create Expense</Text>

          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value="Company Dinner"
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
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.editButton}>
                <Feather name="edit-2" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Associates Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Associates</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search for associates"
              />
              <TouchableOpacity style={styles.searchButton}>
                <Feather name="search" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Group Display */}
          <TouchableOpacity 
            style={[styles.groupContainer, styles.cardShadow]}
            onPress={() => {
              // TODO: Add group action
              console.log('Group pressed');
            }}
          >
            <Text style={styles.groupText}>Company Dinner Party (Group)</Text>
          </TouchableOpacity>

          {/* Split Options */}
          <View style={styles.splitSection}>
            <Text style={styles.label}>Split Options</Text>
            <View style={styles.splitButtonsContainer}>
              <TouchableOpacity 
                style={[styles.splitButton, styles.cardShadow, styles.activeButton]}
                onPress={() => console.log('Split evenly')}
              >
                <Feather name="divide" size={20} color="#FFFFFF" />
                <Text style={[styles.splitButtonText, styles.activeButtonText]}>Split Evenly</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.splitButton, styles.cardShadow]}
                onPress={() => console.log('Split by percentage')}
              >
                <Feather name="percent" size={20} color="#1F2937" />
                <Text style={styles.splitButtonText}>By Percentage</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.splitButton, styles.cardShadow]}
                onPress={() => console.log('Split by amount')}
              >
                <Text style={styles.dollarSymbol}>$</Text>
                <Text style={styles.splitButtonText}>By Amount</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Done Button */}
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => {
              console.log('Done pressed');
              router.back();
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundGradient>
    </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
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
  searchButton: {
    padding: 8,
  },
  groupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  groupText: {
    fontSize: 16,
    color: '#1F2937',
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
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    height: 48,
  },
  activeButton: {
    backgroundColor: '#EA580C',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  splitButtonText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 6,
    fontWeight: '500',
  },
  dollarSymbol: {
    fontSize: 18,
    color: '#1F2937',
    marginRight: 2,
  },
  doneButton: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
