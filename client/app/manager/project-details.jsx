import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Pressable, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProjectDetails() {
  const router = useRouter();
  const { id: projectId } = useLocalSearchParams();
  
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    title: '',
    priority: 'MEDIUM',
    dueDate: new Date().toISOString().split('T')[0],
    assigneeId: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // Parallel fetching
      const [tasksRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/tasks/project/${projectId}`),
        axios.get(`${API_URL}/projects/${projectId}/members`) 
      ]);
      
      setTasks(tasksRes.data);
      setTeamMembers(membersRes.data);
    } catch (error) {
      console.error("Fetch error details:", error.response?.status, error.message);
      // Logic check: If one fails, don't break the other.
      if (error.response?.status === 404) {
        Alert.alert("Configuration Error", "The server endpoint /members was not found (404).");
      } else {
        Alert.alert("Error", "Failed to sync project data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [projectId]);

  const handleCreate = async () => {
    if (!form.title.trim()) return Alert.alert("Error", "Title is required");
    if (!form.assigneeId) return Alert.alert("Error", "Please select an assignee");
    
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/tasks`, {
        ...form,
        projectId,
        dueDate: new Date(form.dueDate).toISOString(),
      });

      setModalVisible(false);
      setForm({ 
        title: '', 
        priority: 'MEDIUM', 
        dueDate: new Date().toISOString().split('T')[0],
        assigneeId: '' 
      });
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Task creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color="#374151" /></Pressable>
        <Text className="ml-4 text-xl font-bold text-gray-800">Project Tasks</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1d4ed8" className="mt-20" />
      ) : (
        <FlatList
          data={tasks}
          contentContainerStyle={{ padding: 16 }}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          ListEmptyComponent={<Text className="mt-10 text-center text-gray-400">No tasks found.</Text>}
          renderItem={({ item }) => (
            <View className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <View className="flex-row justify-between">
                <View>
                   <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
                   <Text className="text-xs text-gray-500">Assignee: {item.assignee?.name || 'Unassigned'}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md h-6 ${item.priority === 'HIGH' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <Text className={`text-[10px] font-bold ${item.priority === 'HIGH' ? 'text-red-600' : 'text-blue-600'}`}>{item.priority}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Pressable 
        onPress={() => setModalVisible(true)}
        className="absolute items-center justify-center w-16 h-16 bg-blue-700 rounded-full shadow-xl bottom-10 right-6"
      >
        <MaterialIcons name="add" size={32} color="white" />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white p-6 rounded-t-3xl h-[85%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-800">New Task</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#9ca3af" />
                </Pressable>
              </View>
              
              <Text className="mb-1 ml-1 text-xs font-medium text-gray-500 uppercase">Task Title</Text>
              <TextInput
                placeholder="What needs to be done?"
                className="p-4 mb-4 border border-gray-200 bg-gray-50 rounded-xl"
                value={form.title}
                onChangeText={(val) => setForm({...form, title: val})}
              />

              <Text className="mb-2 ml-1 text-xs font-medium text-gray-500 uppercase">Assign To (USER Role)</Text>
              <View className="flex-row flex-wrap mb-4">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <Pressable 
                      key={member.id}
                      onPress={() => setForm({...form, assigneeId: member.id})}
                      className={`px-4 py-2 mr-2 mb-2 rounded-lg border ${form.assigneeId === member.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`font-bold text-xs ${form.assigneeId === member.id ? 'text-white' : 'text-gray-700'}`}>
                        {member.name}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <View className="w-full p-4 bg-gray-100 rounded-xl">
                    <Text className="text-xs italic text-center text-gray-400">No users available for assignment.</Text>
                  </View>
                )}
              </View>

              <Text className="mb-1 ml-1 text-xs font-medium text-gray-500 uppercase">Due Date</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                className="p-4 mb-4 border border-gray-200 bg-gray-50 rounded-xl"
                value={form.dueDate}
                onChangeText={(val) => setForm({...form, dueDate: val})}
              />

              <Text className="mb-1 ml-1 text-xs font-medium text-gray-500 uppercase">Priority</Text>
              <View className="flex-row mb-8">
                {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                  <Pressable 
                    key={p} 
                    onPress={() => setForm({...form, priority: p})}
                    className={`flex-1 p-3 mr-2 rounded-xl border-2 ${form.priority === p ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-100'}`}
                  >
                    <Text className={`text-center font-bold ${form.priority === p ? 'text-blue-600' : 'text-gray-400'}`}>{p}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleCreate} disabled={isSubmitting} className="items-center w-full p-4 bg-blue-700 shadow-md rounded-xl">
                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-lg font-bold text-white">Create Task</Text>}
              </Pressable>
              
              <View className="h-10" /> 
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}