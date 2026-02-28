import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UserProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUserProjects = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      
      if (!user?.id) return Alert.alert("Error", "User session not found");

      // Uses 'participating' to match your backend route
      const response = await axios.get(`${API_URL}/projects/participating/${user.id}`);
      setProjects(response.data);
    } catch (error) {
      console.error("Fetch projects error:", error);
      Alert.alert("Error", "Could not load your projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUserProjects(); 
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch (err) {
      console.error("load user failed", err);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/auth/login');
    } catch (err) {
      Alert.alert("Error", "Could not logout");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100">
        <View>
          <Text className="text-2xl font-bold text-gray-800">My Projects</Text>
          <Text className="text-gray-500">Projects you are contributing to</Text>
        </View>
        <Pressable onPress={handleLogout} className="p-2">
          <MaterialIcons name="logout" size={24} color="#6b7280" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1d4ed8" className="mt-20" />
      ) : (
        <FlatList
          data={projects}
          contentContainerStyle={{ padding: 16 }}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <MaterialIcons name="folder-open" size={64} color="#d1d5db" />
              <Text className="mt-4 text-center text-gray-400">You haven't been added to any teams yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => router.push({
                pathname: '/user/user-project-tasks',
                params: { id: item.id } // Passes ID to user-project-tasks.jsx
              })}
              className="p-5 mb-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                  <Text className="mt-1 text-sm text-gray-500" numberOfLines={2}>{item.description}</Text>
                </View>
                <View className="px-2 py-1 rounded-md bg-blue-50">
                  <Text className="text-[10px] font-bold text-blue-600">{item.status}</Text>
                </View>
              </View>

              <View className="flex-row items-center pt-4 mt-4 border-t border-gray-50">
                <MaterialIcons name="person" size={16} color="#9ca3af" />
                <Text className="ml-1 text-xs text-gray-500">Lead: {item.lead?.name}</Text>
                <View className="flex-row items-center ml-auto">
                  <MaterialIcons name="assignment" size={16} color="#9ca3af" />
                  <Text className="ml-1 text-xs text-gray-500">{item._count?.tasks} Tasks</Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}