import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" />
    <Stack.Screen name="teams" />
    <Stack.Screen name="add-user" />
    </Stack>
  );
}