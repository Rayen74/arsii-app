import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LeadProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  const fetchLeadProjects = async (showLoadingUI = true) => {
    try {
      if (showLoadingUI) setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      
      if (!userData) {
        router.replace('/auth/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser?.id) {
        const response = await axios.get(`${API_URL}/projects/lead/${parsedUser.id}`);
        setProjects(response.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
      Alert.alert("Error", "Could not fetch projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Clear the specific user item
      // Or use AsyncStorage.clear() if you want to wipe everything
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert("Error", "Failed to logout safely");
    }
  };

  useFocusEffect(useCallback(() => { fetchLeadProjects(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeadProjects(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'PLANNING': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* HEADER WITH LOGOUT BUTTON */}
      <View className="flex-row items-center justify-between p-6 bg-blue-700 rounded-b-3xl">
        <View>
          <Text className="text-sm text-blue-100 opacity-80">Project Lead</Text>
          <Text className="text-2xl font-bold text-white">{user?.name || 'Loading...'}</Text>
        </View>

        {/* THE LOGOUT BUTTON */}
        <Pressable 
          onPress={handleLogout} 
          className="p-2 rounded-full bg-white/20 active:bg-white/40"
        >
          <MaterialIcons name="logout" size={24} color="white" />
        </Pressable>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#1d4ed8" className="mt-20" />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const hasTeam = item.team && item.team.id && item.team.name;

            return (
              <View className="p-5 mb-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <View className="flex-row justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                    <Text className="text-[10px] text-red-500">Backend says team is: {item.team ? "Exists" : "NULL"}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                    <Text className="text-[10px] text-white font-bold">{item.status}</Text>
                  </View>
                </View>

                <View className="pt-4 border-t border-gray-100">
                  {hasTeam ? (
                    <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <View className="flex-row items-center">
                        <View className="items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <Text className="font-bold text-blue-700">{item.team.name[0]}</Text>
                        </View>
                        <Text className="ml-3 font-semibold text-gray-700">{item.team.name}</Text>
                      </View>
                      <Pressable onPress={() => router.push({ pathname: '/lead/create-team', params: { projectId: item.id, teamId: item.team.id } })}>
                        <MaterialIcons name="edit" size={20} color="#3b82f6" />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable 
                      onPress={() => router.push({ pathname: '/lead/create-team', params: { projectId: item.id } })}
                      className="flex-row items-center justify-center p-4 border-2 border-blue-200 bg-blue-50 rounded-xl"
                      style={{ borderStyle: 'dashed' }}
                    >
                      <MaterialIcons name="group-add" size={24} color="#2563eb" />
                      <Text className="ml-2 text-base font-bold text-blue-700">CREATE TEAM</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}