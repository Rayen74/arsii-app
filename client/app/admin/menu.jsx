import React from 'react';
import { View, Text, Pressable, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added for session clearing

const COLORS = {
  primary: '#1e3a8a',    // Blue-900 from Login
  secondary: '#22c55e',  // Green-500 from Login
  bgLight: '#f8fafc',    
  textMain: '#1e293b',   
  textMuted: '#64748b'   
};

export default function AdminMenu() {
  const router = useRouter();

  // --- Logout Functionality ---
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to exit the admin portal?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all sensitive data
              await AsyncStorage.multiRemove(['user_token', 'user', 'user_id', 'user_role']);
              // Redirect back to login
              router.replace('/auth/login'); 
            } catch (error) {
              console.error("Error during logout:", error);
            }
          }
        }
      ]
    );
  };

  const MenuCard = ({ title, subtitle, icon, route, color }) => (
    <Pressable 
      onPress={() => router.push(route)}
      className="flex-row items-center p-5 mb-4 bg-white shadow-xl shadow-slate-200 rounded-[24px] border border-slate-100 active:opacity-70"
    >
      <View 
        className="p-4 rounded-2xl" 
        style={{ backgroundColor: color + '15' }}
      >
        <MaterialIcons name={icon} size={28} color={color} />
      </View>

      <View className="flex-1 ml-4">
        <Text className="text-xl font-bold tracking-tight text-slate-900">{title}</Text>
        <Text className="mt-1 text-xs font-medium leading-4 text-slate-500">{subtitle}</Text>
      </View>

      <View className="p-1 rounded-full bg-slate-50">
        <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bgLight }}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        
        {/* --- Header with Logout --- */}
        <View className="flex-row items-start justify-between mb-10">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-1 mr-2 bg-green-500 rounded-full" />
              <Text className="text-xs font-black tracking-widest text-blue-900 uppercase">
                Administration
              </Text>
            </View>
            <Text className="text-4xl font-black tracking-tighter text-blue-900">
              Control Panel
            </Text>
          </View>

          {/* Logout Button */}
          <Pressable 
            onPress={handleLogout}
            className="p-3 bg-white border shadow-sm rounded-2xl border-slate-100 active:bg-slate-50"
          >
            <MaterialIcons name="logout" size={24} color="#ef4444" />
          </Pressable>
        </View>

        <Text className="mt-[-20px] mb-8 text-sm font-medium text-slate-400">
          Manage the ARSII innovation ecosystem
        </Text>

        {/* --- Menu Options --- */}
        <MenuCard 
          title="Team Hierarchy"
          subtitle="View leads, members, and organization structure"
          icon="account-tree"
          route="/admin/teams"
          color={COLORS.primary}
        />

        <MenuCard 
          title="Add New User"
          subtitle="Create accounts for Employees, Leads, or Managers"
          icon="person-add"
          route="/admin/create-user" 
          color={COLORS.secondary}
        />

        <MenuCard 
          title="Project Stats"
          subtitle="Monitor overall project completion rates"
          icon="bar-chart"
          route="/admin/stats"
          color="#475569"
        />

        {/* Branding Footer */}
        <View className="items-center mt-12">
            <Text className="text-[10px] font-bold text-slate-300 tracking-[2px] uppercase">
                © 2026 ARSII Association
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}