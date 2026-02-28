import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UserProjectTasks() {
  const { id: projectId } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch tasks assigned specifically to this user for this project
  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      
      if (!user?.id) return Alert.alert("Error", "User session not found");
      if (!projectId) return;

      // Endpoint: /api/tasks/project/:projectId/user/:userId
      const response = await axios.get(`${API_URL}/tasks/project/${projectId}/user/${user.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Task fetch error:", error);
      Alert.alert("Error", "Could not load your assigned tasks. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic to toggle through TaskStatus: TODO -> IN_PROGRESS -> DONE
  const handleToggleStatus = async (taskId, currentStatus) => {
    const statusOrder = ['TODO', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      // PATCH /api/tasks/:taskId/status
      await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status: nextStatus });
      
      // Optimistic UI Update: update the local state immediately
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: nextStatus } : task
        )
      );
    } catch (error) {
      console.error("Update status error:", error);
      Alert.alert("Error", "Failed to update task status");
    }
  };

  useEffect(() => { 
    if (projectId) fetchMyTasks(); 
  }, [projectId]);

  // Helper to determine status badge color
  const getStatusStyle = (status) => {
    switch (status) {
      case 'DONE': return 'bg-green-600';
      case 'IN_PROGRESS': return 'bg-amber-500';
      default: return 'bg-blue-600';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-1 mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">My Tasks</Text>
            
        </View>
        <Pressable onPress={fetchMyTasks} className="p-2">
          <MaterialIcons name="refresh" size={20} color="#6b7280" />
        </Pressable>
      </View>

      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-2 text-gray-500">Loading your tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center px-8 mt-20">
              <MaterialIcons name="assignment-turned-in" size={64} color="#f3f4f6" />
              <Text className="mt-4 text-lg font-medium text-center text-gray-500">No tasks assigned to you</Text>
              <Text className="mt-1 text-center text-gray-400">You aren't assigned to any tasks in this project yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="p-5 mb-4 border border-gray-100 shadow-sm bg-gray-50 rounded-3xl">
              <View className="flex-row items-start justify-between mb-2">
                <Text className="flex-1 text-lg font-bold leading-6 text-gray-900">{item.title}</Text>
                <View className={`px-2 py-1 rounded-lg ${item.priority === 'HIGH' ? 'bg-red-100' : 'bg-green-100'}`}>
                  <Text className={`text-[10px] font-bold ${item.priority === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.priority}
                  </Text>
                </View>
              </View>
              
              <Text className="mb-4 text-sm text-gray-600" numberOfLines={3}>
                {item.description || "No description provided."}
              </Text>
              
              <View className="flex-row items-center pt-4 border-t border-gray-200/50">
                <View className="flex-row items-center">
                  <MaterialIcons name="calendar-today" size={14} color="#9ca3af" />
                  <Text className="ml-1.5 text-xs text-gray-500">
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No deadline'}
                  </Text>
                </View>
                
                {/* Interactive Status Badge */}
                <Pressable 
                  onPress={() => handleToggleStatus(item.id, item.status)}
                  className={`px-4 py-1.5 ml-auto rounded-full ${getStatusStyle(item.status)}`}
                >
                   <Text className="text-[11px] text-white font-bold">{item.status.replace('_', ' ')}</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}