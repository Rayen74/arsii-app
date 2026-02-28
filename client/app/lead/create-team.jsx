import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateTeam() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  
  const [teamName, setTeamName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // UPDATED: Fixed endpoint and removed unnecessary frontend filtering
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/employees`);
      // We trust the backend controller (getAllEmployees) which already filters by role: 'USER'
      setUsers(response.data); 
    } catch (error) {
      console.error("Fetch Users Error:", error);
      Alert.alert("Error", "Could not fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName || selectedUsers.length === 0) {
      Alert.alert("Wait", "Please provide a team name and select at least one member.");
      return;
    }

    setSubmitting(true);
    try {
      // Logic Check: Ensure projectId is passed correctly from LeadProjects
      await axios.post(`${API_URL}/projects/${projectId}/team`, {
        name: teamName,
        memberIds: selectedUsers,
      });
      
      Alert.alert("Success", "Team assigned to project!");
      router.back(); // Returns to LeadProjects where useFocusEffect will refresh the list
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 p-6 bg-white">
      <View className="flex-row items-center mb-6">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-xl font-bold">Create Project Team</Text>
      </View>

      <Text className="mb-2 font-medium text-gray-500 uppercase text-[10px] tracking-widest">Team Name</Text>
      <TextInput 
        className="p-4 mb-6 font-bold text-gray-800 bg-gray-100 rounded-xl"
        placeholder="e.g. Frontend Warriors"
        placeholderTextColor="#9ca3af"
        value={teamName}
        onChangeText={setTeamName}
      />

      <Text className="mb-4 font-medium text-gray-500 uppercase text-[10px] tracking-widest">
        Select Members ({selectedUsers.length})
      </Text>

      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator color="#3b82f6" size="large" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedUsers.includes(item.id);
            return (
              <Pressable 
                onPress={() => toggleUser(item.id)}
                className={`flex-row items-center p-4 mb-2 rounded-xl border ${
                  isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-100'
                }`}
              >
                <MaterialIcons 
                  name={isSelected ? "check-circle" : "radio-button-unchecked"} 
                  size={24} 
                  color={isSelected ? "#3b82f6" : "#d1d5db"} 
                />
                <View className="ml-3">
                  <Text className={`font-bold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500">{item.email}</Text>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-gray-400">No employees found.</Text>
            </View>
          }
        />
      )}

      <Pressable 
        onPress={handleCreateTeam}
        disabled={submitting}
        className={`mt-4 p-5 rounded-2xl items-center shadow-sm ${
          submitting ? 'bg-gray-400' : 'bg-blue-600'
        }`}
      >
        <Text className="text-lg font-bold text-white">
          {submitting ? "Processing..." : "Assign Team to Project"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}