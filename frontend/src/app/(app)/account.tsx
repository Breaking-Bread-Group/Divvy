import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AccountSettings() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Icons */}
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={() => router.push('/(app)/home')}>
          <Feather name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.notificationContainer}
          onPress={() => router.push('/(app)/notifications')}
        >
          <Feather name="bell" size={24} color="black" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Image */}
        <View style={styles.profileSection}>
          <Image
            source={require('../../assets/Account_Settings.png')}
            style={styles.profileImage}
          />
        </View>

        {/* Name Section */}
        <View style={styles.nameSection}>
          <Text style={styles.nameText}>John{'\n'}Anderson</Text>
          <TouchableOpacity style={styles.editNameButton}>
            <Feather name="edit-2" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.formField}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value="john.anderson@example.com"
                editable={false}
              />
              <TouchableOpacity style={styles.editButton}>
                <Feather name="edit-2" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value="+1 (555) 123-4567"
                editable={false}
              />
              <TouchableOpacity style={styles.editButton}>
                <Feather name="edit-2" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value="••••••••"
                editable={false}
                secureTextEntry
              />
              <TouchableOpacity style={styles.editButton}>
                <Feather name="edit-2" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  notificationContainer: {
    position: 'relative',
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
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  nameSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    position: 'relative',
  },
  nameText: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
  },
  editNameButton: {
    position: 'absolute',
    right: 24,
    top: 8,
  },
  formSection: {
    paddingHorizontal: 24,
    gap: 24,
  },
  formField: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  editButton: {
    padding: 8,
  },
}); 