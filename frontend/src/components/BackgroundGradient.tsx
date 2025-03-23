import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function BackgroundGradient({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF', '#FED7AA', '#FFEDD5']}
        style={styles.background}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 0.65 }}
        locations={[0, 0.5, 1]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
}); 