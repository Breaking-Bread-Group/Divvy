import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
        contentStyle: {
          backgroundColor: '#F9FAFB'
        }
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="account" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="create-expense" />
    </Stack>
  );
} 