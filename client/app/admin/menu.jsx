import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminMenu() {
  const router = useRouter();

  const MenuCard = ({ title, subtitle, icon, route, color }) => (
    <Pressable 
      onPress={() => router.push(route)}
      className="flex-row items-center p-5 mb-4 bg-white border border-gray-100 shadow-sm rounded-3xl active:opacity-70"
    >
      <View className={`p-4 rounded-2xl ${color}`}>
        <MaterialIcons name={icon} size={28} color="white" />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-xl font-bold text-gray-900">{title}</Text>
        <Text className="mt-1 text-xs text-gray-500">{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="mb-8">
          <Text className="text-xs font-black tracking-widest text-gray-400 uppercase">Administration</Text>
          <Text className="mt-1 text-3xl font-black text-gray-900">Control Panel</Text>
        </View>

        {/* Option 1: View Teams */}
        <MenuCard 
          title="Team Hierarchy"
          subtitle="View leads, members, and organization structure"
          icon="account-tree"
          route="/admin/teams"
          color="bg-indigo-600"
        />

        {/* Option 2: Add New User */}
        <MenuCard 
          title="Add New User"
          subtitle="Create accounts for Employees, Leads, or Managers"
          icon="person-add"
          route="/admin/create-user" 
          color="bg-emerald-600"
        />

        {/* Option 3: System Analytics (Placeholder) */}
        <MenuCard 
          title="Project Stats"
          subtitle="Monitor overall project completion rates"
          icon="bar-chart"
          route="/admin/stats"
          color="bg-amber-500"
        />
      </ScrollView>
    </SafeAreaView>
  );
}