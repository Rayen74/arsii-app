import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditProject() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: '',
    deadline: '',
  });

  const statuses = ['PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD'];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${API_URL}/projects/filter`); 
        const project = response.data.find(p => p.id === id);
        
        if (project) {
          setForm({
            name: project.name,
            description: project.description || '',
            status: project.status,
            deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
          });
        }
      } catch (error) {
        Alert.alert("Error", "Could not load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleUpdate = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    // --- LOG ADDED HERE ---
    console.log("Full Request URL:", `${API_URL}/projects/${id}`);

    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/projects/${id}`, {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null
      });

      Alert.alert("Success", "Project updated!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      // Improved error logging for debugging the 404
      console.error("Update error response:", error.response?.data);
      console.error("Update error message:", error.message);
      Alert.alert("Error", "Update failed. Check your console for the URL.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <MaterialIcons name="close" size={24} color="#374151" />
        </Pressable>
        <Text className="ml-4 text-xl font-bold text-gray-800">Edit Project</Text>
      </View>

      <ScrollView className="p-6">
        <Text className="mb-2 font-semibold text-gray-500">Project Name</Text>
        <TextInput
          className="p-4 mb-5 border border-gray-200 bg-gray-50 rounded-xl"
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        <Text className="mb-2 font-semibold text-gray-500">Description</Text>
        <TextInput
          className="p-4 mb-5 border border-gray-200 h-28 bg-gray-50 rounded-xl"
          multiline
          textAlignVertical="top"
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
        />

        <Text className="mb-2 font-semibold text-gray-500">Deadline (YYYY-MM-DD)</Text>
        <TextInput
          className="p-4 mb-5 border border-gray-200 bg-gray-50 rounded-xl"
          placeholder="2026-12-31"
          value={form.deadline}
          onChangeText={(t) => setForm({ ...form, deadline: t })}
        />

        <Text className="mb-3 font-semibold text-gray-500">Status</Text>
        <View className="flex-row flex-wrap mb-10">
          {statuses.map((s) => (
            <Pressable
              key={s}
              onPress={() => setForm({ ...form, status: s })}
              className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                form.status === s ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}
            >
              <Text className={form.status === s ? 'text-white font-bold' : 'text-gray-400'}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable 
            onPress={handleUpdate} 
            disabled={updating}
            className={`p-4 rounded-2xl ${updating ? 'bg-blue-300' : 'bg-blue-600'}`}
        >
          {updating ? <ActivityIndicator color="white" /> : <Text className="text-lg font-bold text-center text-white">Save Changes</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}