import { Stack } from 'expo-router';

export default function LeadLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="lead-projects" />
    </Stack>
  );
}