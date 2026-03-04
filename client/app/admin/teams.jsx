import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Consistent ARSII Colors
const COLORS = {
  primary: '#1e3a8a',    // ARSII Navy
  secondary: '#22c55e',  // ARSII Green
  bgLight: '#f8fafc',    // Slate-50
  white: '#FFFFFF',
  textMuted: '#94a3b8'
};

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
    <View className="mb-6 overflow-hidden bg-white shadow-xl shadow-slate-200 rounded-[30px] border border-slate-50">
      {/* Updated Team Header: Navy Blue */}
      <View className="flex-row items-center justify-between p-5 bg-[#1e3a8a]">
        <View>
          <Text className="text-xl font-black tracking-tight text-white uppercase">{team.name}</Text>
          <View className="flex-row items-center mt-1">
            <View className="w-2 h-2 mr-2 bg-green-400 rounded-full" />
            <Text className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">
              {team._count?.projects || 0} Active Projects
            </Text>
          </View>
        </View>
        <View className="p-3 rounded-2xl bg-white/10">
          <MaterialIcons name="lan" size={24} color="white" />
        </View>
      </View>

      <View className="p-6">
        {/* TEAM LEAD SECTION */}
        <View className="mb-6">
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">
            Project Lead
          </Text>
          {team.lead ? (
            <View className="flex-row items-center p-4 border border-slate-100 bg-slate-50 rounded-2xl">
              <View className="items-center justify-center w-12 h-12 bg-[#1e3a8a] shadow-md rounded-xl">
                <Text className="text-lg font-black text-white">{team.lead.name.charAt(0)}</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-slate-900">{team.lead.name}</Text>
                <Text className="text-xs font-medium text-blue-800">{team.lead.email}</Text>
              </View>
              <MaterialIcons name="verified" size={20} color={COLORS.secondary} />
            </View>
          ) : (
            <View className="items-center p-4 border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-2xl">
              <Text className="text-xs font-bold text-slate-300">NO LEAD ASSIGNED</Text>
            </View>
          )}
        </View>

        {/* MEMBERS LIST SECTION */}
        <View>
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">
            Team Members ({team.members?.length || 0})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {team.members?.map((member) => (
              <View 
                key={member.id} 
                className="flex-row items-center px-4 py-2 bg-white border rounded-full shadow-sm border-slate-100"
              >
                <View className="w-2 h-2 mr-2 bg-blue-900 rounded-full" />
                <Text className="text-xs font-bold text-slate-700">{member.name}</Text>
              </View>
            ))}
            {(!team.members || team.members.length === 0) && (
              <Text className="ml-1 text-xs italic text-slate-300">Waiting for members to join...</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bgLight }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Updated Header with Back Icon */}
      <View className="flex-row items-center justify-between px-6 py-6">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            className="items-center justify-center w-12 h-12 mr-4 bg-white border shadow-sm rounded-2xl border-slate-100"
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>
          <View>
            <View className="flex-row items-center">
              <View className="w-6 h-1 mr-2 bg-green-500 rounded-full" />
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Hierarchy</Text>
            </View>
            <Text className="text-3xl font-black text-slate-900">Teams</Text>
          </View>
        </View>

        <Pressable 
          onPress={fetchHierarchy}
          className="items-center justify-center w-12 h-12 bg-white border shadow-sm border-slate-100 rounded-2xl active:bg-slate-50"
        >
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Animatable.Text 
            animation="pulse" 
            iterationCount="infinite" 
            className="mt-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest"
          >
            Syncing ARSII Structure...
          </Animatable.Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={renderTeamCard}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-30">
              <MaterialIcons name="account-tree" size={100} color={COLORS.primary} />
              <Text className="mt-4 text-sm font-black tracking-widest uppercase text-slate-900">No Structure Found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}