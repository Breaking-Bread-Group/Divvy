import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, ActivityIndicator, Animated, PanResponder } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { useAuth } from '../../context/AuthContext';

interface ExpenseTotals {
  total_amount: number;
  user_contribution: number;
  total_expenses: number;
  contribution_percentage: string;
}

interface RecentExpense {
  id: number;
  title: string;
  total_amount: number;
  user_amount: number;
  group_title: string;
  created_by: string;
  created_at: string;
  status: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [totals, setTotals] = useState<ExpenseTotals | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentExpenseIndex, setCurrentExpenseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        // Move the card with the gesture
        swipeAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 50; // Minimum distance to trigger a swipe
        const velocityThreshold = 0.3; // Minimum velocity to trigger a swipe

        if (
          Math.abs(gestureState.dx) > swipeThreshold ||
          Math.abs(gestureState.vx) > velocityThreshold
        ) {
          const direction = gestureState.dx > 0 ? -1 : 1;
          const newIndex = currentExpenseIndex + direction;

          // Only animate if we have a valid index
          if (newIndex >= 0 && newIndex < recentExpenses.length) {
            // Fade out
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              // Change expense and fade in
              setCurrentExpenseIndex(newIndex);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
            });
          }
        }

        // Reset the swipe animation
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [totalsResponse, expensesResponse] = await Promise.all([
        fetch('http://localhost:8080/api/expenses/totals', { credentials: 'include' }),
        fetch('http://localhost:8080/api/expenses/recent', { credentials: 'include' })
      ]);

      if (totalsResponse.ok) {
        const totalsData = await totalsResponse.json();
        setTotals(totalsData);
      }

      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setRecentExpenses(expensesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentExpenseIndex > 0) {
        handleExpenseChange(currentExpenseIndex - 1);
      } else if (e.key === 'ArrowRight' && currentExpenseIndex < recentExpenses.length - 1) {
        handleExpenseChange(currentExpenseIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentExpenseIndex, recentExpenses.length]);

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
      case 'pending':
        return '#7C2D12';
      case 'unpaid':
        return '#B45309';
      case 'paid':
        return '#065F46';
      default:
        return '#7C2D12';
    }
  };

  const handleExpenseChange = (index: number) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Change expense and fade in
      setCurrentExpenseIndex(index);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          {/* Profile and Bell */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(app)/account')}
            >
              <Image
                source={require('../../assets/Account_Settings.png')}
                style={styles.profileImage}
              />
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
            <Text style={styles.title}>Latest Expenses</Text>
            <Text style={styles.subtitle}>Some expenses need your attention</Text>

            {/* Expense Card */}
            {recentExpenses.length > 0 && (
              <Animated.View 
                style={[
                  { opacity: fadeAnim },
                  {
                    transform: [
                      {
                        translateX: swipeAnim.interpolate({
                          inputRange: [-200, 0, 200],
                          outputRange: [-200, 0, 200],
                        }),
                      },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <LinearGradient
                  colors={['#FED7AA', '#FB923C', '#EA580C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.expenseCard, styles.cardShadow]}
                >
                  <View style={styles.expenseHeader}>
                    <Text style={[styles.expenseStatus, { color: getStatusColor(recentExpenses[currentExpenseIndex].status) }]}>
                      {recentExpenses[currentExpenseIndex].status}
                    </Text>
                    <View style={styles.titleRow}>
                      <Text style={[styles.expenseDescription, { color: getStatusColor(recentExpenses[currentExpenseIndex].status) }]}>
                        "{recentExpenses[currentExpenseIndex].title}"
                      </Text>
                      <Text style={[styles.separator, { color: getStatusColor(recentExpenses[currentExpenseIndex].status) }]}>
                        |
                      </Text>
                      <View style={styles.groupContainer}>
                        <Text style={[styles.expenseGroup, { color: getStatusColor(recentExpenses[currentExpenseIndex].status) }]}>
                          {recentExpenses[currentExpenseIndex].group_title}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => router.push(`/(app)/expense/${recentExpenses[currentExpenseIndex].id}`)}
                    >
                      <Text style={[styles.expenseTitle, { color: getStatusColor(recentExpenses[currentExpenseIndex].status) }]}>
                        {formatCurrency(recentExpenses[currentExpenseIndex].user_amount)}
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.expenseDate, { color: getStatusColor(recentExpenses[currentExpenseIndex].status) }]}>
                      {formatDate(recentExpenses[currentExpenseIndex].created_at)}
                    </Text>
                  </View>

                  {/* Pagination Dots */}
                  {recentExpenses.length > 1 && (
                    <View style={styles.paginationDots}>
                      {recentExpenses.map((_, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleExpenseChange(index)}
                        >
                          <View 
                            style={[
                              styles.dot, 
                              { 
                                backgroundColor: getStatusColor(recentExpenses[currentExpenseIndex].status),
                                opacity: index === currentExpenseIndex ? 0.7 : 0.3
                              }
                            ]} 
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            )}

            {/* Total Section */}
            <View style={[styles.totalSection, styles.totalSectionShadow]}>
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>{formatCurrency(totals?.total_amount || 0)}</Text>
                  <View style={styles.contributionRow}>
                    <Text style={styles.contributionLabel}>Your contribution:</Text>
                    <Text style={styles.contributionAmount}>
                      {formatCurrency(totals?.user_contribution || 0)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonShadow]}
                onPress={() => router.push('/(app)/create-group')}
              >
                <LinearGradient
                  colors={['#FFE8D2', '#FDB78F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="users" size={24} color="#1F2937" />
                  <Text style={[styles.actionButtonText]}>
                    Manage{'\n'}Groups
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonShadow]}
                onPress={() => router.push('/(app)/create-expense')}
              >
                <LinearGradient
                  colors={['#FFE8D2', '#FDB78F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="plus" size={24} color="#1F2937" />
                  <Text style={[styles.actionButtonText]}>
                    Create{'\n'}Expense
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonShadow]}
                onPress={() => router.push('/(app)/payment-settings')}
              >
                <LinearGradient
                  colors={['#FFE8D2', '#FDB78F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="credit-card" size={24} color="#1F2937" />
                  <Text style={[styles.actionButtonText]}>
                    Payment{'\n'}Settings
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonShadow]}
                onPress={() => router.push('/(app)/manage-expenses')}
              >
                <LinearGradient
                  colors={['#FFE8D2', '#FDB78F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Feather name="list" size={24} color="#1F2937" />
                  <Text style={[styles.actionButtonText]}>
                    Manage{'\n'}Expenses
                  </Text>
                </LinearGradient>
              </TouchableOpacity>       
            </View>

            {/* Divvy Text */}
            <Text style={styles.divvyText}>© 2025 Divvy</Text>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  expenseCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  cardShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  expenseHeader: {
    marginBottom: 16,
  },
  expenseStatus: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#000',
  },
  expenseDate: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    marginBottom: 8,
  },
  expenseGroup: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  totalSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
  },
  totalSectionShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  totalLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 4,
  },
  contributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contributionLabel: {
    fontSize: 14,
    color: '#000',
  },
  contributionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 16,
      columnGap: 12,
  },
  actionButton: {
    flexBasis: '48%', // Adjust this value to control the width of the buttons
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 4,
  },  
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SF Pro Display',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  actionButtonShadow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  divvyText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupContainer: {
    justifyContent: 'center',
    height: 24, // Match the height of the expense name
  },
  separator: {
    fontSize: 20,
    marginHorizontal: 8,
    opacity: 0.7,
  },
}); 