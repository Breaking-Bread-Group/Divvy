import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, FlatList, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { Formik } from 'formik';

// Storage key for groups - same as in CreateGroup component
const STORAGE_KEY = '@divvy_groups';
const USER_STORAGE_KEY = '@divvy_current_user';

export default function CreateExpense() {
  const router = useRouter();
  const handleAmountChange = (text: string) => {
    // Remove all non-numeric characters except for one optional decimal
    const sanitized = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimals
    if ((sanitized.match(/\./g) || []).length > 1) return;

    setAmount(sanitized);
  }
  
  
  // State for expense details
  const [expenseTitle, setExpenseTitle] = useState('Company Dinner');
  const [amount, setAmount] = useState('');
  
  // State for group search
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  
  // State for member search
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  
  // State for split option
  const [splitOption, setSplitOption] = useState('even'); // 'even', 'percentage', 'amount'
  
  // State for all groups (loaded from localStorage)
  const [allGroups, setAllGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate split amounts based on the selected split option
  const calculateSplitAmounts = (splitType) => {
    const currentSplitType = splitType || splitOption;
    
    if (!amount || selectedMembers.length === 0) {
      return;
    }
    
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return;
    }
    
    // Check if we need to recalculate by looking for missing splitAmount values
    // or if splitType has changed (force update)
    const needsCalculation = selectedMembers.some(member => 
      !member.splitAmount || splitType !== undefined
    );
    
    if (!needsCalculation && !splitType) {
      return; // Skip recalculation if values already exist and splitType hasn't changed
    }
    
    let updatedMembers = [...selectedMembers];
    
    if (currentSplitType === 'even') {
      const perPersonAmount = totalAmount / selectedMembers.length;
      updatedMembers = selectedMembers.map(member => ({
        ...member,
        splitAmount: perPersonAmount.toFixed(2),
        percentage: (100 / selectedMembers.length).toFixed(1),
        editingPercentage: false
      }));
    } else if (currentSplitType === 'percentage') {
      // Check if members already have percentage values
      const hasPercentages = selectedMembers.every(member => member.percentage !== undefined);
      
      if (!hasPercentages) {
        // Initialize with equal percentages if none exist
        const equalPercent = (100 / selectedMembers.length).toFixed(1);
        updatedMembers = selectedMembers.map(member => ({
          ...member,
          splitAmount: ((totalAmount * parseFloat(equalPercent)) / 100).toFixed(2),
          percentage: equalPercent,
          editingPercentage: false
        }));
      } else {
        // Calculate amounts based on existing percentages
        updatedMembers = selectedMembers.map(member => {
          const memberPercentage = parseFloat(member.percentage || 0);
          return {
            ...member,
            splitAmount: ((totalAmount * memberPercentage) / 100).toFixed(2)
          };
        });
      }
    } else if (currentSplitType === 'amount') {
      // For demo purposes, default to equal amounts
      const perPersonAmount = totalAmount / selectedMembers.length;
      updatedMembers = selectedMembers.map(member => ({
        ...member,
        splitAmount: perPersonAmount.toFixed(2),
        percentage: (100 / selectedMembers.length).toFixed(1)
      }));
    }
    
    setSelectedMembers(updatedMembers);
  };

  // Effect to recalculate split amounts when amount or members count changes
  useEffect(() => {
    if (amount && selectedMembers.length > 0) {
      calculateSplitAmounts();
    }
  }, [amount, selectedMembers.length, splitOption]); // Remove calculateSplitAmounts from dependency array

  // Load current user info
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Load all groups when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser]);
  
  // Debounce group search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (groupSearchTerm) {
        searchGroups(groupSearchTerm);
      }
    }, 300); // 300ms delay
    
    return () => clearTimeout(delaySearch);
  }, [groupSearchTerm, allGroups]);
  
  // Debounce member search
  useEffect(() => {
    if (selectedGroup) {
      const delaySearch = setTimeout(() => {
        searchMembers(memberSearchTerm);
      }, 300); // 300ms delay
      
      return () => clearTimeout(delaySearch);
    }
  }, [memberSearchTerm, selectedGroup, selectedMembers]);

  // Function to get current user
  const getCurrentUser = async () => {
    try {
      // Check if user info is stored in localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const userInfo = window.localStorage.getItem(USER_STORAGE_KEY);
        
        if (userInfo) {
          setCurrentUser(JSON.parse(userInfo));
        } else {
          // For demo purposes, create a mock user if none exists
          const mockUser = {
            id: 'user_' + Date.now(),
            name: 'Current User',
            email: 'user@example.com',
          };
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
          setCurrentUser(mockUser);
        }
      } else {
        // Fallback for non-browser environments
        setCurrentUser({
          id: 'temp_user',
          name: 'Temporary User',
          email: 'temp@example.com',
        });
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      Alert.alert('Error', 'Failed to get user information');
    }
  };

  // Function to load groups from localStorage
  const loadGroups = async () => {
    try {
      setIsLoading(true);
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedGroups = window.localStorage.getItem(STORAGE_KEY);
        
        if (storedGroups) {
          const groups = JSON.parse(storedGroups);
          
          // Filter groups to only show those created by the current user
          const userGroups = groups.filter(group => 
            group.createdBy === currentUser.id || !group.createdBy // Include groups without createdBy for backward compatibility
          );
          
          setAllGroups(userGroups);
          console.log(`Loaded ${userGroups.length} groups for user ${currentUser.id}`);
        } else {
          setAllGroups([]);
        }
      } else {
        // Fallback for non-browser environments
        console.warn('localStorage not available in this environment');
        // Set empty array for testing
        setAllGroups([]);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load saved groups');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to search groups
  const searchGroups = (term) => {
    if (!term.trim()) {
      setGroupSearchResults([]);
      return;
    }
    
    setIsSearchingGroups(true);
    
    try {
      // Search in local groups
      const results = allGroups.filter(group => 
        group.title.toLowerCase().includes(term.toLowerCase())
      );
      
      setGroupSearchResults(results);
    } catch (error) {
      console.error('Error searching groups:', error);
    } finally {
      setIsSearchingGroups(false);
    }
  };

  // Function to handle group selection
  const selectGroup = (group) => {
    setSelectedGroup(group);
    setGroupSearchTerm('');
    setGroupSearchResults([]);
    
    // Reset member selections when group changes
    setSelectedMembers([]);
    setMemberSearchTerm('');
    setMemberSearchResults([]);
    
    // Prepare member search results from the selected group
    const groupMembers = group.members.map((member, index) => {
      // Handle both string members and object members
      if (typeof member === 'string') {
        return {
          id: `member_${index}`,
          name: member,
        };
      } else {
        return {
          id: member.id || `member_${index}`,
          name: member.name,
        };
      }
    });
    
    setMemberSearchResults(groupMembers);
  };

  // Function to search members within the selected group
  const searchMembers = (term) => {
    if (!selectedGroup) {
      return;
    }
    
    setIsSearchingMembers(true);
    
    try {
      // Convert members to proper format if they're just strings
      const membersArray = selectedGroup.members.map((member, index) => {
        if (typeof member === 'string') {
          return {
            id: `member_${index}`,
            name: member,
          };
        } else {
          return {
            id: member.id || `member_${index}`,
            name: member.name,
          };
        }
      });
      
      // Filter members based on search term
      if (!term.trim()) {
        // If no search term, show all members not already selected
        const availableMembers = membersArray.filter(
          member => !selectedMembers.some(selected => selected.id === member.id)
        );
        setMemberSearchResults(availableMembers);
      } else {
        // Filter by search term and exclude already selected members
        const filteredMembers = membersArray.filter(
          member => 
            member.name.toLowerCase().includes(term.toLowerCase()) && 
            !selectedMembers.some(selected => selected.id === member.id)
        );
        setMemberSearchResults(filteredMembers);
      }
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setIsSearchingMembers(false);
    }
  };

  // Function to add a member
  const addMember = (member) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      const updatedMembers = [...selectedMembers, member];
      setSelectedMembers(updatedMembers);
      
      // Update search results to remove the added member
      setMemberSearchResults(
        memberSearchResults.filter(m => m.id !== member.id)
      );
    }
  };
  
  // Update member percentage
  const updateMemberPercentage = (memberId, newPercentage) => {
    // Validate percentage
    const percentValue = parseFloat(newPercentage);
    if (isNaN(percentValue) || percentValue < 0) {
      return;
    }
    
    // Update the specific member's percentage
    const updatedMembers = selectedMembers.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          percentage: newPercentage,
          editingPercentage: false
        };
      }
      return member;
    });
    
    // Check if total percentage exceeds 100%
    const totalPercentage = updatedMembers.reduce((sum, member) => 
      sum + parseFloat(member.percentage || 0), 0);
    
    if (totalPercentage > 100) {
      Alert.alert('Error', 'Total percentage cannot exceed 100%');
      return;
    }
    
    setSelectedMembers(updatedMembers);
    
    // Recalculate amounts based on new percentages immediately
    if (amount && !isNaN(parseFloat(amount))) {
      const totalAmount = parseFloat(amount);
      
      const recalculatedMembers = updatedMembers.map(member => {
        const memberPercentage = parseFloat(member.percentage || 0);
        const memberAmount = (totalAmount * memberPercentage / 100).toFixed(2);
        
        return {
          ...member,
          splitAmount: memberAmount
        };
      });
      
      setSelectedMembers(recalculatedMembers);
    }
  };
  
  // Toggle percentage editing mode for a member
  const togglePercentageEditing = (memberId) => {
    console.log('Toggling percentage editing for member:', memberId);
    
    if (splitOption !== 'percentage') {
      console.log('Not in percentage mode, ignoring toggle');
      return;
    }
    
    const updatedMembers = selectedMembers.map(member => {
      if (member.id === memberId) {
        console.log(`Setting editing mode for ${member.name} to: ${!member.editingPercentage}`);
        return {
          ...member,
          editingPercentage: !member.editingPercentage
        };
      } else {
        // Close editing for other members
        return {
          ...member,
          editingPercentage: false
        };
      }
    });
    
    console.log('Updated members after toggle:', updatedMembers.map(m => `${m.name}: editing=${m.editingPercentage}`));
    setSelectedMembers(updatedMembers);
  };
  
  // Handle text input for percentage
  const handlePercentageChange = (memberId, text) => {
    // Validate input - allow only numbers and a decimal point
    if (!/^(\d*\.?\d*)?$/.test(text)) {
      return;
    }
    
    // Update just the displayed value immediately
    const updatedMembers = selectedMembers.map(member => 
      member.id === memberId ? {...member, percentage: text} : member
    );
    
    setSelectedMembers(updatedMembers);
    
    // If the value is a valid percentage, update amounts in real time
    const percentValue = parseFloat(text);
    if (!isNaN(percentValue) && percentValue >= 0 && amount) {
      const totalAmount = parseFloat(amount);
      if (!isNaN(totalAmount)) {
        // Calculate this member's amount based on percentage
        const memberAmount = (totalAmount * percentValue / 100).toFixed(2);
        
        // Update just this member's amount
        const recalculatedMembers = updatedMembers.map(member => 
          member.id === memberId ? {...member, splitAmount: memberAmount} : member
        );
        
        setSelectedMembers(recalculatedMembers);
      }
    }
  };

  // Function to remove a member
  const removeMember = (memberId) => {
    // Remove member from selected members
    const updatedMembers = selectedMembers.filter(member => member.id !== memberId);
    setSelectedMembers(updatedMembers);
    
    // Add member back to search results if there's a selected group
    if (selectedGroup) {
      const memberToAdd = selectedGroup.members
        .map((member, index) => {
          if (typeof member === 'string') {
            return { id: `member_${index}`, name: member };
          } else {
            return { id: member.id || `member_${index}`, name: member.name };
          }
        })
        .find(member => member.id === memberId);
      
      if (memberToAdd && !memberSearchResults.some(m => m.id === memberId)) {
        setMemberSearchResults([...memberSearchResults, memberToAdd]);
      }
    }
  };

  // Handle split option selection
  const handleSplitOptionChange = (option) => {
    // Don't do anything if it's the same option
    if (option === splitOption) {
      return;
    }
    
    setSplitOption(option);
    
    // If switching to percentage mode, make sure each member has editable percentages
    if (option === 'percentage' && selectedMembers.length > 0) {
      const equalPercent = (100 / selectedMembers.length).toFixed(1);
      const totalAmount = parseFloat(amount || '0');
      
      const updatedMembers = selectedMembers.map(member => ({
        ...member,
        percentage: equalPercent,
        splitAmount: totalAmount > 0 ? ((totalAmount * parseFloat(equalPercent)) / 100).toFixed(2) : '0.00',
        editingPercentage: false
      }));
      
      setSelectedMembers(updatedMembers);
    } else {
      // For other split types, force recalculate with the new option
      calculateSplitAmounts(option);
    }
  };

  // Handle expense submission
  const handleExpense = () => {
    // Validate inputs
    if (!expenseTitle.trim()) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member to split with');
      return;
    }
    
    // Create expense object
    const newExpense = {
      id: Date.now().toString(),
      title: expenseTitle,
      amount: parseFloat(amount),
      createdBy: currentUser?.id,
      createdByName: currentUser?.name,
      createdAt: new Date().toISOString(),
      group: selectedGroup ? {
        id: selectedGroup.id,
        title: selectedGroup.title
      } : null,
      members: selectedMembers,
      splitOption,
    };
    
    console.log('Expense created:', newExpense);
    
    // Save expense to storage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Get existing expenses or initialize an empty array
        const storedExpenses = window.localStorage.getItem('@divvy_expenses') || '[]';
        const expenses = JSON.parse(storedExpenses);
        
        // Add new expense
        expenses.push(newExpense);
        
        // Save back to localStorage
        window.localStorage.setItem('@divvy_expenses', JSON.stringify(expenses));
        console.log('Expense saved to localStorage');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
    
    // Show success message
    Alert.alert('Success', 'Expense created successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

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

            {/* Current User Info */}
            {currentUser && (
              <View style={styles.userInfoContainer}>
                <Text style={styles.userInfoText}>
                  Logged in as: <Text style={styles.userInfoHighlight}>{currentUser.name}</Text>
                </Text>
              </View>
            )}

            {/* Title Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Title</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={expenseTitle}
                  onChangeText={setExpenseTitle}
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
                  value={amount}
                onChangeText={handleAmountChange}
                />
                <TouchableOpacity style={styles.editButton}>
                  <Feather name="edit-2" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Group Search Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Group</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={groupSearchTerm}
                  onChangeText={setGroupSearchTerm}
                  placeholder="Search for a group"
                  autoCapitalize="none"
                />
                {isSearchingGroups ? (
                  <ActivityIndicator size="small" color="#EA580C" style={styles.searchButton} />
                ) : (
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={() => searchGroups(groupSearchTerm)}
                  >
                    <Feather name="search" size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Group Search Results */}
              {groupSearchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <FlatList
                    data={groupSearchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.searchResultItem}
                        onPress={() => selectGroup(item)}
                      >
                        <View>
                          <Text style={styles.searchResultText}>{item.title}</Text>
                          <Text style={styles.searchResultMembers}>
                            {Array.isArray(item.members) 
                              ? item.members.length + ' members' 
                              : '0 members'}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.selectButton}
                          onPress={() => selectGroup(item)}
                        >
                          <Feather name="check" size={18} color="#10B981" />
                          <Text style={styles.selectButtonText}>Select</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                    style={styles.searchResultsList}
                  />
                </View>
              )}
              
              {/* Show All Groups button */}
              {!selectedGroup && (
                <TouchableOpacity 
                  style={styles.showAllButton}
                  onPress={() => {
                    setGroupSearchResults(allGroups);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Feather name="list" size={20} color="white" />
                      <Text style={styles.showAllButtonText}>Show All Groups</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              
              {/* Selected Group Display */}
              {selectedGroup && (
                <View style={[styles.groupDisplayContainer, styles.cardShadow]}>
                  <View style={styles.groupHeaderContainer}>
                    <Text style={styles.groupTitle}>{selectedGroup.title}</Text>
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => {
                        setSelectedGroup(null);
                        setSelectedMembers([]);
                        setMemberSearchResults([]);
                      }}
                    >
                      <Feather name="x" size={18} color="#4B5563" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.groupMembersCount}>
                    {Array.isArray(selectedGroup.members) 
                      ? `${selectedGroup.members.length} members` 
                      : '0 members'}
                  </Text>
                </View>
              )}
            </View>

            {/* Associates Input (enabled only when a group is selected) */}
            {selectedGroup && (
              <View style={styles.inputSection}>
                <Text style={styles.label}>Associates</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={memberSearchTerm}
                    onChangeText={setMemberSearchTerm}
                    placeholder="Search for associates in this group"
                    autoCapitalize="none"
                  />
                  {isSearchingMembers ? (
                    <ActivityIndicator size="small" color="#EA580C" style={styles.searchButton} />
                  ) : (
                    <TouchableOpacity 
                      style={styles.searchButton}
                      onPress={() => searchMembers(memberSearchTerm)}
                    >
                      <Feather name="search" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Member Search Results */}
                {memberSearchResults.length > 0 && (
                  <View style={styles.searchResultsContainer}>
                    <FlatList
                      data={memberSearchResults}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={styles.searchResultItem}
                          onPress={() => addMember(item)}
                        >
                          <Text style={styles.searchResultText}>{item.name}</Text>
                          <TouchableOpacity 
                            style={styles.addMemberButton}
                            onPress={() => addMember(item)}
                          >
                            <Feather name="user-plus" size={18} color="#10B981" />
                            <Text style={styles.addButtonText}>Add</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      )}
                      style={styles.searchResultsList}
                    />
                  </View>
                )}
                
                {/* Show all members button */}
                <TouchableOpacity 
                  style={styles.showAllButton}
                  onPress={() => searchMembers('')}
                >
                  <Feather name="users" size={20} color="white" />
                  <Text style={styles.showAllButtonText}>Show All Members</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Selected Members with Editable Percentages */}
            {selectedMembers.length > 0 && (
              <View style={styles.selectedMembersSection}>
                <Text style={styles.label}>Selected Members</Text>
                
                {splitOption === 'percentage' && (
                  <View style={styles.percentageInstructionsContainer}>
                    <Feather name="info" size={14} color="#6B7280" />
                    <Text style={styles.percentageInstructions}>
                      Tap on a percentage to edit it
                    </Text>
                  </View>
                )}
                
                <View style={styles.selectedMembersContainer}>
                  {selectedMembers.map((member) => (
                    <View key={member.id} style={[styles.memberChip, splitOption === 'percentage' && styles.percentageMemberChip]}>
                      <View style={styles.memberInfoContainer}>
                        <Text style={styles.memberChipText}>{member.name}</Text>
                        
                        {splitOption === 'percentage' ? (
                          member.editingPercentage ? (
                            // Editing state with improved input field
                            <View style={styles.percentageInputContainer}>
                              <TextInput
                                style={styles.percentageInput}
                                value={member.percentage}
                                onChangeText={(text) => handlePercentageChange(member.id, text)}
                                onBlur={() => updateMemberPercentage(member.id, member.percentage)}
                                keyboardType="numeric"
                                autoFocus
                                selectTextOnFocus
                              />
                              <Text style={styles.percentageSymbol}>%</Text>
                            </View>
                          ) : (
                            // Display state with prominent edit button
                            <TouchableOpacity 
                              onPress={() => togglePercentageEditing(member.id)}
                              style={styles.percentageDisplay}
                            >
                              <View style={styles.percentageBadge}>
                                <Text style={styles.percentageText}>{member.percentage}%</Text>
                              </View>
                              <Text style={styles.splitAmountText}>(${member.splitAmount})</Text>
                              <View style={styles.editIconContainer}>
                                <Feather name="edit-2" size={14} color="#4F46E5" />
                              </View>
                            </TouchableOpacity>
                          )
                        ) : (
                          // Non-percentage mode - just show amount
                          member.splitAmount && (
                            <Text style={styles.splitAmountText}>(${member.splitAmount})</Text>
                          )
                        )}
                      </View>
                      
                      <TouchableOpacity 
                        onPress={() => removeMember(member.id)}
                        style={styles.removeButton}
                      >
                        <Feather name="x" size={16} color="#4B5563" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                
                {splitOption === 'percentage' && (
                  <View style={styles.percentageSummary}>
                    <Text style={styles.percentageSummaryText}>
                      Total: {selectedMembers.reduce((sum, member) => sum + parseFloat(member.percentage || 0), 0).toFixed(1)}%
                    </Text>
                    {selectedMembers.reduce((sum, member) => sum + parseFloat(member.percentage || 0), 0) < 100 && (
                      <Text style={styles.percentageWarning}>
                        (Remaining: {(100 - selectedMembers.reduce((sum, member) => sum + parseFloat(member.percentage || 0), 0)).toFixed(1)}%)
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Split Options */}
            <View style={styles.splitSection}>
              <Text style={styles.label}>Split Options</Text>
              <View style={styles.splitButtonsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.splitButton, 
                    styles.cardShadow,
                    splitOption === 'even' && styles.activeButton
                  ]}
                  onPress={() => handleSplitOptionChange('even')}
                >
                  <Feather name="divide" size={20} color={splitOption === 'even' ? "#FFFFFF" : "#1F2937"} />
                  <Text 
                    style={[
                      styles.splitButtonText,
                      splitOption === 'even' && styles.activeButtonText
                    ]}
                  >
                    Split Evenly
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.splitButton, 
                    styles.cardShadow,
                    splitOption === 'percentage' && styles.activeButton
                  ]}
                  onPress={() => handleSplitOptionChange('percentage')}
                >
                  <Feather name="percent" size={20} color={splitOption === 'percentage' ? "#FFFFFF" : "#1F2937"} />
                  <Text 
                    style={[
                      styles.splitButtonText,
                      splitOption === 'percentage' && styles.activeButtonText
                    ]}
                  >
                    By Percentage
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.splitButton, 
                    styles.cardShadow,
                    splitOption === 'amount' && styles.activeButton
                  ]}
                  onPress={() => handleSplitOptionChange('amount')}
                >
                  <Text 
                    style={[
                      styles.dollarSymbol,
                      splitOption === 'amount' && styles.activeButtonText
                    ]}
                  >
                    $
                  </Text>
                  <Text 
                    style={[
                      styles.splitButtonText,
                      splitOption === 'amount' && styles.activeButtonText
                    ]}
                  >
                    By Amount
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Done Button */}
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={handleExpense}
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
    marginBottom: 16,
  },
  userInfoContainer: {
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  userInfoText: {
    fontSize: 14,
    color: '#1F2937',
  },
  userInfoHighlight: {
    fontWeight: 'bold',
    color: '#EA580C',
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
  searchResultsContainer: {
    marginTop: 8,
    maxHeight: 200,
  },
  searchResultsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchResultText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  searchResultMembers: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectButtonText: {
    marginLeft: 4,
    color: '#10B981',
    fontWeight: '500',
  },
  showAllButton: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  showAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  groupDisplayContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  groupHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  groupMembersCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(209, 213, 219, 0.5)',
    borderRadius: 8,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 4,
    color: '#10B981',
    fontWeight: '500',
  },
  selectedMembersSection: {
    marginBottom: 24,
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 213, 219, 0.7)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  memberChipText: {
    fontSize: 14,
    color: '#1F2937',
    marginRight: 6,
  },
  percentageInstructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentageInstructions: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 60,
  },
  percentageInput: {
    fontSize: 14,
    color: '#1F2937',
    minWidth: 40,
    padding: 0,
  },
  percentageSymbol: {
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 2,
  },
  percentageBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  percentageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  percentageText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  editIconContainer: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginLeft: 6,
  },
  removeButton: {
    padding: 4,
  },
  memberInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  percentageMemberChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    marginRight: 0,
  },
  percentageSummary: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(209, 213, 219, 0.3)',
    borderRadius: 8,
  },
  percentageSummaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  percentageWarning: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 2,
  },
  splitAmountText: {
    color: '#057A55',
    fontWeight: '500',
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
    marginTop: 16,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  groupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  groupText: {
    fontSize: 16,
    color: '#1F2937',
  },
});
