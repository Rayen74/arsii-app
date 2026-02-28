import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TeamVisualization() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/teams/hierarchy`);
      setTeams(response.data);
    } catch (error) {
      console.error("Hierarchy UI Error:", error);
      Alert.alert("Error", "Could not load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const renderTeamCard = ({ item: team }) => (
    <View className="mb-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
      {/* Team Header Stripe */}
      <View className="flex-row items-center justify-between p-4 bg-indigo-600">
        <View>
          <Text className="text-xl font-bold tracking-tight text-white">{team.name}</Text>
          <Text className="text-xs font-medium text-indigo-100">
            {team._count?.projects || 0} Active Projects
          </Text>
        </View>
        <View className="p-2 rounded-full bg-white/20">
          <MaterialIcons name="groups" size={24} color="white" />
        </View>
      </View>

      <View className="p-5">
        {/* TEAM LEAD SECTION */}
        <View className="mb-5">
          <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
            Department Lead
          </Text>
          {team.lead ? (
            <View className="flex-row items-center p-4 border border-indigo-100 bg-indigo-50/50 rounded-2xl">
              <View className="items-center justify-center w-12 h-12 bg-indigo-500 shadow-sm rounded-2xl">
                <Text className="text-lg font-bold text-white">{team.lead.name.charAt(0)}</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-gray-900">{team.lead.name}</Text>
                <Text className="text-xs font-medium text-indigo-600">{team.lead.email}</Text>
              </View>
              <MaterialIcons name="verified" size={20} color="#4f46e5" />
            </View>
          ) : (
            <View className="p-4 border border-gray-200 border-dashed bg-gray-50 rounded-2xl">
              <Text className="text-xs italic text-center text-gray-400">No lead assigned to this team</Text>
            </View>
          )}
        </View>

        {/* MEMBERS LIST SECTION */}
        <View>
          <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">
            Team Members ({team.members?.length || 0})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {team.members?.map((member) => (
              <View 
                key={member.id} 
                className="flex-row items-center px-3 py-2 bg-white border border-gray-200 shadow-sm rounded-xl"
              >
                <FontAwesome5 name="user-alt" size={10} color="#6366f1" />
                <Text className="ml-2 text-sm font-medium text-gray-700">{member.name}</Text>
              </View>
            ))}
            {(!team.members || team.members.length === 0) && (
              <Text className="ml-1 text-xs italic text-gray-300">No members joined yet</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-end justify-between px-6 py-4">
        <View>
          <Text className="text-3xl font-black text-gray-900">Teams</Text>
          <Text className="font-medium text-gray-500">Organizational Hierarchy</Text>
        </View>
        <Pressable 
          onPress={fetchHierarchy}
          className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl"
        >
          <MaterialIcons name="refresh" size={24} color="#4b5563" />
        </Pressable>
      </View>

      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 font-medium text-gray-400">Mapping structures...</Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={renderTeamCard}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <MaterialIcons name="domain-disabled" size={80} color="#e2e8f0" />
              <Text className="mt-4 text-lg font-bold text-gray-400">No teams found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}