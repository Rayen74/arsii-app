import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, FlatList, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ManagerAcceuil() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  
  // Lead Assignment State
  const [leads, setLeads] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const statuses = ['', 'PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD'];

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/filter`, {
        params: { status: filter || undefined, search: search || undefined }
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Fetch projects error", error);
    }
  };

  // load user from storage so we can display name and logout
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // if for some reason there's no user, send to login
        router.replace('/auth/login');
      }
    } catch (err) {
      console.error("Failed to load user", err);
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

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error("Fetch leads error", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
      fetchLeads(); // Fetch leads so they are ready for the modal
      loadUser();
    }, [filter, search])
  );

  const handleAssignLead = async (leadId) => {
    setIsAssigning(true);
    try {
      await axios.patch(`${API_URL}/projects/${selectedProjectId}/assign-lead`, {
        leadId: leadId
      });
      Alert.alert("Success", "Project lead assigned successfully");
      setModalVisible(false);
      fetchProjects(); // Refresh to show the updated lead (if you display it)
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Could not assign lead");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header & Search */}
      <View className="p-6 bg-blue-700 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-blue-100 opacity-80">Manager</Text>
            <Text className="text-2xl font-bold text-white">{user?.name || 'Manager Space'}</Text>
          </View>
          <View className="flex-row items-center">
            <Pressable onPress={() => router.push('/manager/create-project')} className="p-2 mr-2 rounded-full bg-white/20">
              <MaterialIcons name="add" size={28} color="white" />
            </Pressable>
            <Pressable onPress={handleLogout} className="p-2 rounded-full bg-white/20 active:bg-white/40">
              <MaterialIcons name="logout" size={24} color="white" />
            </Pressable>
          </View>
        </View>
        <View className="flex-row items-center px-3 py-2 bg-white rounded-xl">
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search projects..."
            className="flex-1 ml-2 text-base"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Status Filter */}
      <View className="py-4">
        <FlatList
          horizontal
          data={statuses}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(s) => s || 'all'}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item: s }) => (
            <Pressable
              onPress={() => setFilter(s)}
              className={`mr-2 px-4 py-2 rounded-full ${filter === s ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <Text className={filter === s ? 'text-white' : 'text-gray-600'}>{s || 'All'}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Projects List */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="p-4 mb-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <Pressable 
              onPress={() => router.push({ pathname: '/manager/project-details', params: { id: item.id } })}
              className="active:opacity-70"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                  <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>{item.description}</Text>
                  
                  {/* Lead Display */}
                  <View className="flex-row items-center mt-2">
                    <MaterialIcons name="person" size={14} color="#6b7280" />
                    <Text className="ml-1 text-xs text-gray-600">
                      Lead: {item.lead?.name || 'Unassigned'}
                    </Text>
                  </View>
                </View>
                
                <Pressable 
                  onPress={() => router.push({ pathname: '/manager/edit-project', params: { id: item.id } })} 
                  className="p-2 ml-2 rounded-full bg-blue-50"
                >
                  <MaterialIcons name="edit" size={20} color="#3b82f6" />
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between mt-3">
                <View className="px-3 py-1 rounded-lg bg-blue-50">
                  <Text className="text-xs font-bold text-blue-600">{item.status}</Text>
                </View>
                
                {/* THE ASSIGN BUTTON */}
                <Pressable 
                  onPress={() => {
                    setSelectedProjectId(item.id);
                    setModalVisible(true);
                  }}
                  className="flex-row items-center px-3 py-1 rounded-lg bg-orange-50"
                >
                  <MaterialIcons name="person-add" size={14} color="#f97316" />
                  <Text className="ml-1 text-xs font-bold text-orange-600">Assign Lead</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        )}
      />

      {/* Lead Selector Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white p-6 rounded-t-3xl h-[50%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold">Assign Project Lead</Text>
              <Pressable onPress={() => setModalVisible(false)}><MaterialIcons name="close" size={24} /></Pressable>
            </View>
            
            <FlatList
              data={leads}
              keyExtractor={(lead) => lead.id}
              renderItem={({ item: lead }) => (
                <Pressable 
                  onPress={() => handleAssignLead(lead.id)}
                  disabled={isAssigning}
                  className="flex-row items-center p-4 mb-2 border border-gray-100 rounded-xl active:bg-gray-50"
                >
                  <View className="items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <Text className="font-bold text-blue-700">{lead.name.charAt(0)}</Text>
                  </View>
                  <View className="ml-4">
                    <Text className="font-bold text-gray-800">{lead.name}</Text>
                    <Text className="text-xs text-gray-500">{lead.email}</Text>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={<Text className="mt-10 text-center text-gray-400">No leads available.</Text>}
            />
            {isAssigning && <ActivityIndicator size="large" color="#1d4ed8" className="absolute self-center top-1/2" />}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}