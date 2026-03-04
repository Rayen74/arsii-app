import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ArsiiLogo from '../../assets/Arsii-logo.png';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('Please fill in both fields', false);
      return;
    }
    if (!validateEmail(email)) {
      showModal('Please enter a valid email address', false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (response.status === 200) {
        const { token, user } = response.data;

        await AsyncStorage.setItem('user_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('user_id', user.id);
        await AsyncStorage.setItem('user_role', user.role);

        console.log('Login Successful. User ID stored:', user.id);

        setUserData(user);
        setIsSuccess(true);
        showModal(`Welcome back, ${user.name}!`, true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      let errorMessage = 'Could not connect to server.';
      if (error.response) {
        errorMessage = error.response.data.message || 'Invalid email or password.';
      } else if (error.request) {
        errorMessage = `Network error. Is the server running at ${API_URL}?`;
      }
      showModal(errorMessage, false);
    } finally {
      setIsLoading(false);
    }
  };

  const showModal = (msg, success) => {
    setModalMessage(msg);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    if (isSuccess && userData) {
      if (userData.role === 'MANAGER') {
        router.replace('/manager/manager-acceuil');
      } else if (userData.role === 'LEAD') {
        router.replace('/lead/lead-projects');
      } else if (userData.role === 'ADMIN') {
        router.replace('/admin/menu');
      } else {
        router.replace('/user/user-projects');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center p-6">
            
            {/* --- ARSII Header Section --- */}
            <View className="items-center mb-10">
              <Image
                source={ArsiiLogo}
                className="h-24 w-44"
                resizeMode="contain"
              />
              <Text className="mt-4 text-2xl font-bold tracking-tight text-blue-900">
                ARSII Association
              </Text>
              <View className="w-12 h-1 mt-2 bg-green-500 rounded-full" />
            </View>

            {/* --- Login Card --- */}
            <View className="w-full max-w-md p-8 bg-white rounded-[30px] shadow-2xl shadow-slate-200 border border-slate-100">
              <Text className="mb-8 text-lg font-medium text-center text-slate-500">
                Sign in to your member portal
              </Text>

              {/* Email Field */}
              <View className="flex-row items-center w-full mb-4 border bg-slate-50 border-slate-200 rounded-2xl">
                <MaterialIcons name="email" size={20} color="#1e3a8a" style={{ marginLeft: 15 }} />
                <TextInput
                  className="flex-1 p-4 text-base text-slate-800"
                  placeholder="Email"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Field */}
              <View className="flex-row items-center w-full mb-8 border bg-slate-50 border-slate-200 rounded-2xl">
                <MaterialIcons name="lock" size={20} color="#1e3a8a" style={{ marginLeft: 15 }} />
                <TextInput
                  className="flex-1 p-4 text-base text-slate-800"
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={{ paddingRight: 15 }}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="#64748b"
                  />
                </Pressable>
              </View>

              {/* Login Button */}
              <View className="items-center">
                <Pressable
                  className={`w-full p-4 rounded-2xl shadow-lg flex-row justify-center items-center ${
                    isLoading ? 'bg-blue-300' : 'bg-blue-900'
                  }`}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-bold text-center text-white">Login</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <Text className="mt-10 text-xs text-slate-400">
              © 2026 ARSII Association. All Rights Reserved.
            </Text>
          </View>
        </ScrollView>

        {/* --- Feedback Modal --- */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="w-4/5 max-w-sm p-8 bg-white rounded-[32px] shadow-2xl items-center">
              <Animatable.View animation="zoomIn" duration={500} className="items-center mb-4">
                <MaterialIcons
                  name={isSuccess ? 'check-circle' : 'cancel'}
                  size={60}
                  color={isSuccess ? '#22c55e' : '#ef4444'}
                />
              </Animatable.View>
              <Text className="mb-4 text-xl font-bold text-center text-slate-800">
                {isSuccess ? 'Success' : 'Attention'}
              </Text>
              <Text className="mb-8 text-base text-center text-slate-500">
                {modalMessage}
              </Text>
              <Pressable 
                className={`w-full p-4 rounded-2xl ${isSuccess ? 'bg-green-600' : 'bg-blue-900'}`} 
                onPress={closeModal}
              >
                <Text className="text-lg font-bold text-center text-white">OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}