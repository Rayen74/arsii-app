// client/app/_layout.jsx
import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth Module */}
      <Stack.Screen name="auth" />

      {/* Patient Module */}
      <Stack.Screen name="patient" />

      {/* Catch 404 */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}