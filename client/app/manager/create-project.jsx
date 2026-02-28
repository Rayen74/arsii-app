import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'PLANNING',
    deadline: '', // State for the deadline
  });

  const statuses = ['PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD'];

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Project name is required");
      return;
    }

    setLoading(true);
    try {
      const loggedUserId = await AsyncStorage.getItem('user_id');

      if (!loggedUserId) {
        Alert.alert("Error", "Session not found. Please log in again.");
        return;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
        // LOGIC CHECK: We convert the text to a real ISO Date for Prisma
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        creatorId: loggedUserId,
      };

      const response = await axios.post(`${API_URL}/projects`, payload);

      if (response.status === 201) {
        Alert.alert("Success", "Project created successfully!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error("Creation Error:", error.response?.data || error.message);
      const serverError = error.response?.data?.error || "Invalid date format or server error";
      Alert.alert("Error", `Could not create project: ${serverError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <Text className="ml-4 text-xl font-bold text-gray-800">New Project</Text>
      </View>

      <ScrollView className="p-6">
        {/* Project Name */}
        <Text className="mb-2 font-semibold text-gray-500">Project Name *</Text>
        <TextInput
          className="p-4 mb-5 text-base border border-gray-200 bg-gray-50 rounded-xl"
          placeholder="Project Title"
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        {/* Description */}
        <Text className="mb-2 font-semibold text-gray-500">Description</Text>
        <TextInput
          className="p-4 mb-5 text-base border border-gray-200 h-28 bg-gray-50 rounded-xl"
          placeholder="Details..."
          multiline
          textAlignVertical="top"
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
        />

        {/* --- ADDED: Deadline Input --- */}
        <Text className="mb-2 font-semibold text-gray-500">Deadline (YYYY-MM-DD)</Text>
        <View className="flex-row items-center p-4 mb-5 border border-gray-200 bg-gray-50 rounded-xl">
          <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="e.g. 2026-12-31"
            value={form.deadline}
            onChangeText={(t) => setForm({ ...form, deadline: t })}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Status Selection */}
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
              <Text className={form.status === s ? 'text-white font-bold' : 'text-gray-400'}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={loading}
          className={`p-4 rounded-2xl shadow-sm ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-bold text-center text-white">Create Project</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}